const Chat = require('../models/Chat')
const Message = require('../models/Message')
const MessageRequest = require('../models/MessageRequest')
const User = require('../models/User')
const { sendNotification } = require('../socket')

// ─── Get or initiate a chat ───────────────────────────────────────────────────
const getOrCreateChat = async (req, res, next) => {
  try {
    const { userId } = req.params
    const myId = req.user._id.toString()

    if (userId === myId) { res.status(400); throw new Error('Cannot chat with yourself') }

    // Check if chat exists
    let chat = await Chat.findOne({
      type: 'private',
      participants: { $all: [myId, userId], $size: 2 },
    }).populate('participants', 'name username avatar isOnline lastSeen')
      .populate('lastMessage')

    if (chat) return res.json({ success: true, data: chat, isNew: false })

    // Check if message request exists
    const request = await MessageRequest.findOne({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    })

    if (request && request.status !== 'accepted') {
      return res.json({ success: true, data: null, requestStatus: request.status, requestId: request._id, isNew: true })
    }

    // Create chat (only if request was accepted or if sending initial request)
    chat = await Chat.create({
      type: 'private',
      participants: [myId, userId],
    })

    await chat.populate('participants', 'name username avatar isOnline lastSeen')
    res.json({ success: true, data: chat, isNew: true })
  } catch (err) { next(err) }
}

// ─── Get all chats for current user ──────────────────────────────────────────
const getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate('participants', 'name username avatar isOnline lastSeen')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name username' } })
      .populate('group', 'name slug avatar')
      .sort({ lastActivity: -1 })

    // Attach unread count for each chat
    const enriched = await Promise.all(chats.map(async (chat) => {
      const unread = await Message.countDocuments({
        chat: chat._id,
        readBy: { $ne: req.user._id },
        sender: { $ne: req.user._id },
        isDeleted: false,
      })
      return { ...chat.toObject(), unreadCount: unread }
    }))

    res.json({ success: true, data: enriched })
  } catch (err) { next(err) }
}

// ─── Get messages in a chat ───────────────────────────────────────────────────
const getChatMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const { page = 1, limit = 50 } = req.query

    const chat = await Chat.findOne({ _id: chatId, participants: req.user._id })
    if (!chat) { res.status(403); throw new Error('Access denied') }

    const messages = await Message.find({
      chat: chatId,
      isDeleted: false,
      deletedFor: { $ne: req.user._id },
    })
      .populate('sender', 'name username avatar')
      .populate({ path: 'replyTo', populate: { path: 'sender', select: 'name username' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    // Mark unread as read
    const unreadIds = messages
      .filter(m => !m.readBy.map(r => r.toString()).includes(req.user._id.toString()))
      .map(m => m._id)

    if (unreadIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadIds } },
        { $addToSet: { readBy: req.user._id } }
      )
    }

    res.json({ success: true, data: messages.reverse() })
  } catch (err) { next(err) }
}

// ─── Message Requests ─────────────────────────────────────────────────────────
const sendMessageRequest = async (req, res, next) => {
  try {
    const { receiverId, initialMessage } = req.body

    if (!receiverId) {
      res.status(400)
      throw new Error('receiverId is required')
    }

    const existing = await MessageRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
    })
    if (existing) return res.status(400).json({ success: false, message: 'Message request already sent' })

    const request = await MessageRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      initialMessage: initialMessage || '',
    })

    await request.populate('sender', 'name username avatar')

    await sendNotification({
      recipient: receiverId,
      actor: req.user._id,
      type: 'message_request',
      title: `${req.user.name} wants to message you`,
      body: initialMessage || '',
      link: `/messages/requests`,
      data: { requestId: request._id },
    })

    res.status(201).json({ success: true, data: request })
  } catch (err) { next(err) }
}

const getMessageRequests = async (req, res, next) => {
  try {
    const requests = await MessageRequest.find({ receiver: req.user._id, status: 'pending' })
      .populate('sender', 'name username avatar bio')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: requests })
  } catch (err) { next(err) }
}

const respondToRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params
    const { action } = req.body // 'accept' | 'reject' | 'ignore'

    const request = await MessageRequest.findOne({ _id: requestId, receiver: req.user._id })
    if (!request) { res.status(404); throw new Error('Request not found') }

    request.status = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'ignored'
    await request.save()

    if (action === 'accept') {
      // Create the chat
      const chat = await Chat.create({
        type: 'private',
        participants: [req.user._id, request.sender],
      })

      // Send the initial message if any
      if (request.initialMessage) {
        await Message.create({
          chat: chat._id,
          sender: request.sender,
          content: request.initialMessage,
          contentType: 'text',
          readBy: [request.sender],
          deliveredTo: [request.sender],
        })
        await Chat.findByIdAndUpdate(chat._id, { lastActivity: new Date() })
      }

      await sendNotification({
        recipient: request.sender,
        actor: req.user._id,
        type: 'message_request_accepted',
        title: `${req.user.name} accepted your message request`,
        link: `/messages/${chat._id}`,
      })

      return res.json({ success: true, data: chat })
    }

    res.json({ success: true, data: request })
  } catch (err) { next(err) }
}

// ─── Archive / Mute ───────────────────────────────────────────────────────────
const archiveChat = async (req, res, next) => {
  try {
    await Chat.findOneAndUpdate(
      { _id: req.params.chatId, participants: req.user._id },
      { $addToSet: { archivedBy: req.user._id } }
    )
    res.json({ success: true })
  } catch (err) { next(err) }
}

module.exports = {
  getOrCreateChat,
  getMyChats,
  getChatMessages,
  sendMessageRequest,
  getMessageRequests,
  respondToRequest,
  archiveChat,
}
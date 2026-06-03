const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Message = require('../models/Message')
const Chat = require('../models/Chat')
const Notification = require('../models/Notification')

let io

// Track online users: userId -> Set of socketIds
const onlineUsers = new Map()

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    pingTimeout: 60000,
  })

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('No token'))
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('name username avatar')
      if (!user) return next(new Error('User not found'))
      socket.user = user
      next()
    } catch {
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString()

    // Track online presence
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set())
    onlineUsers.get(userId).add(socket.id)

    // Mark user online in DB
    User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() }).exec()
    io.emit('user:online', { userId })

    // Join personal room
    socket.join(`user:${userId}`)

    // Join all user's chat rooms
    Chat.find({ participants: userId, isActive: true })
      .select('_id')
      .then(chats => chats.forEach(c => socket.join(`chat:${c._id}`)))

    // ─── MESSAGING EVENTS ─────────────────────────────────────────

    socket.on('message:send', async (payload, ack) => {
      try {
        const { chatId, content, contentType = 'text', replyTo, tempId } = payload

        const chat = await Chat.findOne({ _id: chatId, participants: userId })
        if (!chat) return ack?.({ error: 'Chat not found' })

        const msg = await Message.create({
          chat: chatId,
          sender: userId,
          content,
          contentType,
          replyTo: replyTo || null,
          deliveredTo: [userId],
          readBy: [userId],
        })

        await msg.populate('sender', 'name username avatar')
        if (msg.replyTo) await msg.populate('replyTo', 'content sender contentType')

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: msg._id,
          lastActivity: new Date(),
        })

        const msgData = { ...msg.toObject(), tempId }

        // Emit to all in chat room
        io.to(`chat:${chatId}`).emit('message:new', msgData)

        // Notify offline participants
        const otherParticipants = chat.participants.filter(p => p.toString() !== userId)
        for (const pid of otherParticipants) {
          const pidStr = pid.toString()
          if (!onlineUsers.has(pidStr) || onlineUsers.get(pidStr).size === 0) {
            await sendNotification({
              recipient: pidStr,
              actor: userId,
              type: 'new_message',
              title: `New message from ${socket.user.name}`,
              link: `/messages/${chatId}`,
              data: { chatId, messageId: msg._id },
            })
          } else {
            // Mark as delivered for online users
            await Message.findByIdAndUpdate(msg._id, { $addToSet: { deliveredTo: pidStr } })
            io.to(`user:${pidStr}`).emit('message:delivered', { messageId: msg._id, chatId })
          }
        }

        ack?.({ success: true, message: msgData })
      } catch (err) {
        ack?.({ error: err.message })
      }
    })

    socket.on('message:read', async ({ chatId, messageIds }) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds }, chat: chatId },
          { $addToSet: { readBy: userId } }
        )
        io.to(`chat:${chatId}`).emit('message:read_receipt', { chatId, messageIds, readerId: userId })
      } catch {}
    })

    socket.on('message:edit', async ({ messageId, content }, ack) => {
      try {
        const msg = await Message.findOne({ _id: messageId, sender: userId })
        if (!msg) return ack?.({ error: 'Not found' })
        msg.content = content
        msg.isEdited = true
        msg.editedAt = new Date()
        await msg.save()
        io.to(`chat:${msg.chat}`).emit('message:edited', { messageId, content, chatId: msg.chat })
        ack?.({ success: true })
      } catch (err) { ack?.({ error: err.message }) }
    })

    socket.on('message:delete', async ({ messageId, deleteFor = 'me' }, ack) => {
      try {
        const msg = await Message.findOne({ _id: messageId, sender: userId })
        if (!msg) return ack?.({ error: 'Not authorized' })
        if (deleteFor === 'everyone') {
          msg.isDeleted = true
          msg.content = ''
          await msg.save()
          io.to(`chat:${msg.chat}`).emit('message:deleted', { messageId, chatId: msg.chat, deleteFor: 'everyone' })
        } else {
          msg.deletedFor = msg.deletedFor || []
          msg.deletedFor.push(userId)
          await msg.save()
          socket.emit('message:deleted', { messageId, chatId: msg.chat, deleteFor: 'me' })
        }
        ack?.({ success: true })
      } catch (err) { ack?.({ error: err.message }) }
    })

    socket.on('message:react', async ({ messageId, emoji }) => {
      try {
        const msg = await Message.findById(messageId)
        if (!msg) return
        const existing = msg.reactions.find(r => r.user.toString() === userId && r.emoji === emoji)
        if (existing) {
          msg.reactions = msg.reactions.filter(r => !(r.user.toString() === userId && r.emoji === emoji))
        } else {
          msg.reactions.push({ user: userId, emoji })
        }
        await msg.save()
        io.to(`chat:${msg.chat}`).emit('message:reaction', {
          messageId,
          chatId: msg.chat.toString(),
          reactions: msg.reactions,
          actorId: userId,
        })
      } catch {}
    })

    socket.on('typing:start', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:start', { chatId, userId, user: socket.user })
    })

    socket.on('typing:stop', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:stop', { chatId, userId })
    })

    socket.on('chat:join', ({ chatId }) => {
      socket.join(`chat:${chatId}`)
    })

    // ─── DISCONNECT ───────────────────────────────────────────────

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId)
      if (sockets) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          onlineUsers.delete(userId)
          User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() }).exec()
          io.emit('user:offline', { userId, lastSeen: new Date() })
        }
      }
    })
  })

  return io
}

// ─── HELPER: Send notification from anywhere ─────────────────────────────────
const sendNotification = async ({ recipient, actor, type, title, body = '', link = '', data = {} }) => {
  try {
    const notif = await Notification.create({
      recipient,
      actor,
      type,
      title,
      body,
      link,
      data,
    })

    const populated = await notif.populate('actor', 'name username avatar')

    if (io) {
      io.to(`user:${recipient.toString()}`).emit('notification:new', populated)
    }

    return populated
  } catch (err) {
    console.error('sendNotification error:', err.message)
  }
}

const isOnline = (userId) => {
  const s = onlineUsers.get(userId?.toString())
  return !!s && s.size > 0
}

const getIO = () => io

module.exports = { initSocket, sendNotification, isOnline, getIO }
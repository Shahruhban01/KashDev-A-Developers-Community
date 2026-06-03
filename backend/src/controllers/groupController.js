const Group = require('../models/Group')
const GroupMember = require('../models/GroupMember')
const Chat = require('../models/Chat')
const { sendNotification } = require('../socket')

const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

const createGroup = async (req, res, next) => {
  try {
    const { name, description, type, category, tags } = req.body
    const slug = slugify(name) + '-' + Date.now()

    // Create group chat room
    const chat = await Chat.create({ type: 'group', participants: [req.user._id] })

    const group = await Group.create({
      name, description, type, category,
      tags: tags || [],
      slug,
      createdBy: req.user._id,
      chat: chat._id,
      memberCount: 1,
    })

    await Chat.findByIdAndUpdate(chat._id, { group: group._id })

    // Creator becomes admin
    await GroupMember.create({ group: group._id, user: req.user._id, role: 'admin' })

    res.status(201).json({ success: true, data: group })
  } catch (err) { next(err) }
}

const getGroups = async (req, res, next) => {
  try {
    const { search, category, type = 'public', page = 1, limit = 12 } = req.query
    const query = { type }
    if (category) query.category = category
    if (search) query.name = { $regex: search, $options: 'i' }

    const groups = await Group.find(query)
      .populate('createdBy', 'name username avatar')
      .sort({ memberCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await Group.countDocuments(query)
    res.json({ success: true, data: groups, pagination: { page: Number(page), total } })
  } catch (err) { next(err) }
}

const getGroupBySlug = async (req, res, next) => {
  try {
    const group = await Group.findOne({ slug: req.params.slug })
      .populate('createdBy', 'name username avatar')
    if (!group) { res.status(404); throw new Error('Group not found') }

    const members = await GroupMember.find({ group: group._id, isActive: true })
      .populate('user', 'name username avatar')
      .sort({ role: 1, joinedAt: 1 })
      .limit(20)

    res.json({ success: true, data: { group, members } })
  } catch (err) { next(err) }
}

const joinGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
    if (!group) { res.status(404); throw new Error('Group not found') }

    const existing = await GroupMember.findOne({ group: group._id, user: req.user._id })
    if (existing) {
      if (existing.isActive) return res.json({ success: true, message: 'Already a member' })
      existing.isActive = true
      await existing.save()
    } else {
      await GroupMember.create({ group: group._id, user: req.user._id })
    }

    await Group.findByIdAndUpdate(group._id, { $inc: { memberCount: 1 } })
    await Chat.findByIdAndUpdate(group.chat, { $addToSet: { participants: req.user._id } })

    res.json({ success: true, message: 'Joined group' })
  } catch (err) { next(err) }
}

const leaveGroup = async (req, res, next) => {
  try {
    const member = await GroupMember.findOne({ group: req.params.id, user: req.user._id })
    if (!member) { res.status(404); throw new Error('Not a member') }
    member.isActive = false
    await member.save()
    await Group.findByIdAndUpdate(req.params.id, { $inc: { memberCount: -1 } })
    res.json({ success: true })
  } catch (err) { next(err) }
}

const updateMemberRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body
    const member = await GroupMember.findOneAndUpdate(
      { group: req.params.id, user: userId },
      { role },
      { new: true }
    )
    res.json({ success: true, data: member })
  } catch (err) { next(err) }
}

module.exports = { createGroup, getGroups, getGroupBySlug, joinGroup, leaveGroup, updateMemberRole }
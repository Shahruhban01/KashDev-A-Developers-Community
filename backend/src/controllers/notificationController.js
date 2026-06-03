const Notification = require('../models/Notification')

const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('actor', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false })
    res.json({ success: true, data: notifications, unreadCount })
  } catch (err) { next(err) }
}

const markRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() })
    res.json({ success: true })
  } catch (err) { next(err) }
}

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() })
    res.json({ success: true })
  } catch (err) { next(err) }
}

module.exports = { getNotifications, markRead, markAllRead }
const Bookmark = require('../models/Bookmark')
const UserActivity = require('../models/UserActivity')

const MODEL_MAP = {
  developer:   'User',
  project:     'Project',
  question:    'ForumQuestion',
  opportunity: 'Opportunity',
}

const toggleBookmark = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.body
    const targetModel = MODEL_MAP[targetType]
    if (!targetModel || !targetId) {
      res.status(400)
      throw new Error('Valid targetType and targetId are required')
    }

    const existing = await Bookmark.findOne({
      user: req.user._id,
      targetType,
      target: targetId,
    })
    if (existing) {
      await existing.deleteOne()
      return res.json({ success: true, bookmarked: false })
    }

    await Bookmark.create({
      user: req.user._id,
      targetType,
      target: targetId,
      targetModel,
    })

    await UserActivity.create({
      user: req.user._id,
      type: 'bookmark',
      targetType,
      targetId,
      metadata: {},
    })

    res.json({ success: true, bookmarked: true })
  } catch (err) { next(err) }
}

const getBookmarks = async (req, res, next) => {
  try {
    const { type } = req.query
    const query = { user: req.user._id }
    if (type) query.targetType = type

    const bookmarks = await Bookmark.find(query)
      .populate('target')
      .sort({ createdAt: -1 })

    res.json({ success: true, data: bookmarks.filter(b => b.target) })
  } catch (err) { next(err) }
}

module.exports = { toggleBookmark, getBookmarks }

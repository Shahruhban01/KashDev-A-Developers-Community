const express = require('express')
const router = express.Router()
const { protect, optionalAuth } = require('../middleware/auth')
const ProfileLike = require('../models/ProfileLike')
const Follow = require('../models/Follow')
const User = require('../models/User')
const { sendNotification } = require('../socket')
const {
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing,
} = require('../controllers/followController')

// ─── Profile Likes ────────────────────────────────────────────────────────────

router.post('/like/:profileId', protect, async (req, res, next) => {
  try {
    const { profileId } = req.params
    if (profileId === req.user._id.toString()) {
      res.status(400); throw new Error('Cannot like your own profile')
    }
    const existing = await ProfileLike.findOne({ liker: req.user._id, profile: profileId })
    if (existing) {
      await existing.deleteOne()
      await User.findByIdAndUpdate(profileId, { $inc: { reputation: -2 } })
      return res.json({ success: true, liked: false })
    }
    await ProfileLike.create({ liker: req.user._id, profile: profileId })
    await User.findByIdAndUpdate(profileId, { $inc: { reputation: 2 } })

    await sendNotification({
      recipient: profileId,
      actor: req.user._id,
      type: 'profile_like',
      title: `${req.user.name} liked your profile`,
      link: `/developers/${req.user.username}`,
    })

    res.json({ success: true, liked: true })
  } catch (err) { next(err) }
})

router.get('/like/:profileId', optionalAuth, async (req, res, next) => {
  try {
    const { profileId } = req.params
    const count = await ProfileLike.countDocuments({ profile: profileId })
    const recentAdmirers = await ProfileLike.find({ profile: profileId })
      .populate('liker', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(6)
    const liked = req.user
      ? !!(await ProfileLike.findOne({ liker: req.user._id, profile: profileId }))
      : false
    res.json({ success: true, data: { count, recentAdmirers, liked } })
  } catch (err) { next(err) }
})

// ─── Follow ───────────────────────────────────────────────────────────────────

router.post('/follow/:userId', protect, toggleFollow)
router.get('/follow/:userId/status', protect, getFollowStatus)
router.get('/followers/:userId', getFollowers)
router.get('/following/:userId', getFollowing)

// ─── Leaderboard ──────────────────────────────────────────────────────────────

router.get('/leaderboard', async (req, res, next) => {
  try {
    const { category = 'reputation' } = req.query
    if (category === 'followers') {
      const top = await Follow.aggregate([
        { $group: { _id: '$following', followersCount: { $sum: 1 } } },
        { $sort: { followersCount: -1 } },
        { $limit: 25 },
      ])

      const ids = top.map(row => row._id)
      const countsById = new Map(top.map(row => [row._id.toString(), row.followersCount]))
      const users = await User.find({ _id: { $in: ids } })
        .select('name username avatar bio reputation followersCount followingCount isFeatured isVerified')

      const sortedUsers = ids
        .map(id => {
          const user = users.find(u => u._id.toString() === id.toString())
          if (!user) return null
          user.followersCount = countsById.get(id.toString()) || 0
          return user
        })
        .filter(Boolean)

      return res.json({ success: true, data: sortedUsers })
    }

    const sortMap = {
      reputation:  { reputation: -1 },
      followers:   { followersCount: -1 },
    }
    const users = await User.find({})
      .select('name username avatar bio reputation followersCount followingCount isFeatured isVerified')
      .sort(sortMap[category] || { reputation: -1 })
      .limit(25)
    res.json({ success: true, data: users })
  } catch (err) { next(err) }
})

module.exports = router

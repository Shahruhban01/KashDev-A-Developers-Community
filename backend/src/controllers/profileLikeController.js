const ProfileLike = require('../models/ProfileLike')
const User = require('../models/User')
const { sendNotification } = require('../socket')

const toggleLike = async (req, res, next) => {
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
}

const getProfileLikes = async (req, res, next) => {
  try {
    const { profileId } = req.params
    const count = await ProfileLike.countDocuments({ profile: profileId })
    const recentAdmirers = await ProfileLike.find({ profile: profileId })
      .populate('liker', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(6)
    const myLike = req.user
      ? await ProfileLike.findOne({ liker: req.user._id, profile: profileId })
      : null
    res.json({ success: true, data: { count, recentAdmirers, liked: !!myLike } })
  } catch (err) { next(err) }
}

const getLeaderboard = async (req, res, next) => {
  try {
    const { category = 'reputation' } = req.query
    const sortField = {
      reputation: { reputation: -1 },
      liked:      { reputation: -1 },
    }[category] || { reputation: -1 }

    const users = await User.find({})
      .select('name username avatar bio reputation isFeatured')
      .sort(sortField)
      .limit(20)

    res.json({ success: true, data: users })
  } catch (err) { next(err) }
}

module.exports = { toggleLike, getProfileLikes, getLeaderboard }
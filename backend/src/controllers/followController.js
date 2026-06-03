const Follow = require('../models/Follow')
const User = require('../models/User')
const UserActivity = require('../models/UserActivity')
const { sendNotification } = require('../socket')

const getFollowCounts = async (userId) => {
  const [followersCount, followingCount] = await Promise.all([
    Follow.countDocuments({ following: userId }),
    Follow.countDocuments({ follower: userId }),
  ])

  await User.findByIdAndUpdate(userId, { followersCount, followingCount })
  return { followersCount, followingCount }
}

const toggleFollow = async (req, res, next) => {
  try {
    const { userId } = req.params
    const followerId = req.user._id

    if (userId === followerId.toString()) {
      res.status(400)
      throw new Error('Cannot follow yourself')
    }

    const target = await User.findById(userId).select('_id name username')
    if (!target) {
      res.status(404)
      throw new Error('User not found')
    }

    const existing = await Follow.findOne({ follower: followerId, following: userId })
    let following

    if (existing) {
      await existing.deleteOne()
      following = false
    } else {
      try {
        await Follow.create({ follower: followerId, following: userId })
      } catch (err) {
        if (err.code !== 11000) throw err
      }
      following = true

      await Promise.allSettled([
        sendNotification({
          recipient: userId,
          actor: followerId,
          type: 'new_follower',
          title: `${req.user.name} started following you`,
          link: `/developers/${req.user.username}`,
        }),
        UserActivity.create({
          user: followerId,
          type: 'follow',
          targetType: 'user',
          targetId: userId,
          metadata: { username: target.username, name: target.name },
        }),
      ])
    }

    const [meCounts, targetCounts] = await Promise.all([
      getFollowCounts(followerId),
      getFollowCounts(userId),
    ])

    res.json({
      success: true,
      data: {
        following,
        followersCount: targetCounts.followersCount,
        followingCount: targetCounts.followingCount,
        me: meCounts,
      },
      following,
    })
  } catch (err) { next(err) }
}

const getFollowStatus = async (req, res, next) => {
  try {
    const { userId } = req.params
    const [following, counts] = await Promise.all([
      Follow.exists({ follower: req.user._id, following: userId }),
      getFollowCounts(userId),
    ])

    res.json({
      success: true,
      data: { following: !!following, ...counts },
      following: !!following,
    })
  } catch (err) { next(err) }
}

const getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params
    const followers = await Follow.find({ following: userId })
      .populate('follower', 'name username avatar bio followersCount followingCount')
      .sort({ createdAt: -1 })
      .limit(50)
    const data = followers.map(f => f.follower).filter(Boolean)
    const counts = await getFollowCounts(userId)
    res.json({ success: true, data, count: counts.followersCount, counts })
  } catch (err) { next(err) }
}

const getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params
    const following = await Follow.find({ follower: userId })
      .populate('following', 'name username avatar bio followersCount followingCount')
      .sort({ createdAt: -1 })
      .limit(50)
    const data = following.map(f => f.following).filter(Boolean)
    const counts = await getFollowCounts(userId)
    res.json({ success: true, data, count: counts.followingCount, counts })
  } catch (err) { next(err) }
}

module.exports = { toggleFollow, getFollowStatus, getFollowers, getFollowing, getFollowCounts }

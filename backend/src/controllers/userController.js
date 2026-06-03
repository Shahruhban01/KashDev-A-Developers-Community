const User = require('../models/User')
const DeveloperProfile = require('../models/DeveloperProfile')
const Project = require('../models/Project')
const Opportunity = require('../models/Opportunity')

// @desc    Get community stats
// @route   GET /api/users/stats
// @access  Public
const getCommunityStats = async (req, res, next) => {
  try {
    const [users, projects, opportunities] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments({ status: 'active' }),
      Opportunity.countDocuments({ isActive: true }),
    ])

    res.json({
      success: true,
      data: { users, projects, opportunities },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get current user full profile
// @route   GET /api/users/me
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    const profile = await DeveloperProfile.findOne({ user: req.user._id })
    const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 })
    const opportunities = await Opportunity.find({ postedBy: req.user._id }).sort({ createdAt: -1 })

    res.json({ success: true, data: { user, profile, projects, opportunities } })
  } catch (error) {
    next(error)
  }
}

// @desc    Update current user basic info
// @route   PUT /api/users/me
// @access  Private
const updateMyProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'bio', 'avatar', 'location']
    const updates = {}
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field]
    })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password')

    res.json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

// @desc    Get saved opportunities for current user
// @route   GET /api/users/saved-opportunities
// @access  Private
const getSavedOpportunities = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedOpportunities',
      populate: { path: 'postedBy', select: 'name username avatar' },
    })

    res.json({ success: true, data: user.savedOpportunities })
  } catch (error) {
    next(error)
  }
}

// @desc    Get public user by username (basic info only)
// @route   GET /api/users/:username
// @access  Public
const getUserByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -savedOpportunities -email')
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }
    res.json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getCommunityStats,
  getMyProfile,
  updateMyProfile,
  getSavedOpportunities,
  getUserByUsername,
}
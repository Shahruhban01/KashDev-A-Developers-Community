'use strict'

const DeveloperProfile = require('../models/DeveloperProfile')
const Project = require('../models/Project')
const Opportunity = require('../models/Opportunity')
const UserActivity = require('../models/UserActivity')

class RecommendationService {
  /**
   * Recommend developers for a given user
   */
  async recommendDevelopers(userId, userProfile, limit = 8) {
    if (!userProfile) return []

    const { skills = [], company = '' } = userProfile
    const user = await require('../models/User').findById(userId).select('location interests')

    // Build a scored match pipeline
    const pipeline = [
      { $match: { user: { $ne: userId } } },
      {
        $addFields: {
          score: {
            $add: [
              // Shared skills (up to 5 points each, max 30)
              {
                $min: [
                  30,
                  {
                    $multiply: [
                      5,
                      {
                        $size: {
                          $ifNull: [
                            { $setIntersection: ['$skills', skills] },
                            [],
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              // Same district (15 points)
              {
                $cond: [
                  {
                    $and: [
                      { $ne: [user?.location?.district, ''] },
                      { $eq: ['$userDistrict', user?.location?.district] },
                    ],
                  },
                  15,
                  0,
                ],
              },
              // Open to collaborate (5 points)
              { $cond: ['$openToCollaborate', 5, 0] },
              // Open to mentor (3 points)
              { $cond: ['$openToMentor', 3, 0] },
            ],
          },
        },
      },
      { $match: { score: { $gt: 0 } } },
      { $sort: { score: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users', localField: 'user', foreignField: '_id', as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          skills: 1, company: 1, openToWork: 1, openToMentor: 1, score: 1,
          user: { _id: 1, name: 1, username: 1, avatar: 1, 'location.district': 1, isFeatured: 1 },
        },
      },
    ]

    // Inject district from joined user (workaround for cross-collection lookup in addFields)
    const profiles = await DeveloperProfile.aggregate([
      { $match: { user: { $ne: userId } } },
      {
        $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userData' },
      },
      { $unwind: '$userData' },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: [5, { $size: { $ifNull: [{ $setIntersection: ['$skills', skills] }, []] } }] },
              { $cond: [{ $eq: ['$userData.location.district', user?.location?.district || ''] }, 15, 0] },
              { $cond: ['$openToCollaborate', 5, 0] },
              { $cond: ['$openToMentor', 3, 0] },
            ],
          },
        },
      },
      { $match: { score: { $gt: 0 } } },
      { $sort: { score: -1 } },
      { $limit: limit },
      {
        $project: {
          skills: 1, company: 1, openToWork: 1, openToMentor: 1, score: 1,
          user: {
            _id: '$userData._id', name: '$userData.name', username: '$userData.username',
            avatar: '$userData.avatar', isFeatured: '$userData.isFeatured',
            district: '$userData.location.district',
          },
        },
      },
    ])

    return profiles
  }

  /**
   * Recommend projects for a given user
   */
  async recommendProjects(userId, userProfile, limit = 6) {
    if (!userProfile) return Project.find({ status: 'active' }).sort({ likesCount: -1 }).limit(limit).populate('owner', 'name username avatar')

    const { skills = [] } = userProfile

    // Find projects the user has NOT liked and NOT owned, matching skills
    const projects = await Project.aggregate([
      {
        $match: {
          status: 'active',
          owner: { $ne: userId },
          likes: { $ne: userId },
        },
      },
      {
        $addFields: {
          matchScore: {
            $add: [
              { $multiply: [10, { $size: { $ifNull: [{ $setIntersection: ['$technologies', skills] }, []] } }] },
              { $cond: ['$isFeatured', 20, 0] },
              { $multiply: [2, { $ifNull: ['$likesCount', 0] }] },
            ],
          },
        },
      },
      { $sort: { matchScore: -1, createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'owner' },
      },
      { $unwind: '$owner' },
      {
        $project: {
          title: 1, description: 1, technologies: 1, githubUrl: 1, demoUrl: 1,
          likesCount: 1, isFeatured: 1, createdAt: 1, matchScore: 1,
          owner: { _id: 1, name: 1, username: 1, avatar: 1 },
        },
      },
    ])

    return projects
  }

  /**
   * Recommend opportunities for a given user
   */
  async recommendOpportunities(userId, userProfile, limit = 5) {
    if (!userProfile) return Opportunity.find({ isActive: true }).sort({ createdAt: -1 }).limit(limit)

    const { skills = [], openToWork, openToFreelance } = userProfile
    const user = await require('../models/User').findById(userId).select('location')
    const district = user?.location?.district

    const opps = await Opportunity.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          matchScore: {
            $add: [
              { $multiply: [15, { $size: { $ifNull: [{ $setIntersection: ['$skills', skills] }, []] } }] },
              { $cond: [{ $eq: ['$location', district || ''] }, 10, 0] },
              { $cond: [{ $eq: ['$location', 'Remote'] }, 5, 0] },
              { $cond: [{ $and: [{ $eq: ['$type', 'freelance'] }, openToFreelance] }, 10, 0] },
            ],
          },
        },
      },
      { $sort: { matchScore: -1, createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: { from: 'users', localField: 'postedBy', foreignField: '_id', as: 'postedBy' },
      },
      { $unwind: { path: '$postedBy', preserveNullAndEmptyArrays: true } },
    ])

    return opps
  }

  /**
   * Recommend mentors for a user
   */
  async recommendMentors(userId, userProfile, limit = 6) {
    const mentors = await DeveloperProfile.find({
      user: { $ne: userId },
      openToMentor: true,
    })
      .populate('user', 'name username avatar bio location reputation')
      .sort({ 'user.reputation': -1 })
      .limit(limit)

    return mentors
  }

  /**
   * Log activity (non-blocking helper used by controllers)
   */
  async logActivity(userId, type, targetType, targetId, metadata = {}) {
    try {
      await UserActivity.create({ user: userId, type, targetType, targetId, metadata })
    } catch { /* non-critical */ }
  }
}

module.exports = new RecommendationService()
'use strict'

const User = require('../models/User')
const DeveloperProfile = require('../models/DeveloperProfile')
const Project = require('../models/Project')
const Opportunity = require('../models/Opportunity')
const SearchHistory = require('../models/SearchHistory')

class AnalyticsService {
  async getPlatformStats() {
    const [totalUsers, totalProjects, totalOpportunities, openToWork, students, mentors, founders] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments({ status: 'active' }),
      Opportunity.countDocuments({ isActive: true }),
      DeveloperProfile.countDocuments({ openToWork: true }),
      User.countDocuments({ isStudent: true }),
      DeveloperProfile.countDocuments({ openToMentor: true }),
      DeveloperProfile.countDocuments({ founderStatus: true }),
    ])

    return { totalUsers, totalProjects, totalOpportunities, openToWork, students, mentors, founders }
  }

  async getDevelopersByDistrict() {
    return User.aggregate([
      { $match: { 'location.district': { $ne: '' } } },
      { $group: { _id: '$location.district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { district: '$_id', count: 1, _id: 0 } },
    ])
  }

  async getDevelopersByCity() {
    return User.aggregate([
      { $match: { 'location.city': { $ne: '' } } },
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { city: '$_id', count: 1, _id: 0 } },
    ])
  }

  async getTopSkills(limit = 20) {
    return DeveloperProfile.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: { $toLower: '$skills' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { skill: '$_id', count: 1, _id: 0 } },
    ])
  }

  async getTopCompanies(limit = 15) {
    return DeveloperProfile.aggregate([
      { $match: { company: { $ne: '' } } },
      { $group: { _id: { $toLower: '$company' }, count: { $sum: 1 }, displayName: { $first: '$company' } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { company: '$displayName', count: 1, _id: 0 } },
    ])
  }

  async getExperienceDistribution() {
    return DeveloperProfile.aggregate([
      { $group: { _id: '$experience', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { experience: '$_id', count: 1, _id: 0 } },
    ])
  }

  async getGrowthOverTime(months = 6) {
    const since = new Date()
    since.setMonth(since.getMonth() - months)

    return User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { year: '$_id.year', month: '$_id.month', count: 1, _id: 0 } },
    ])
  }

  async getDistrictAnalytics(district) {
    const districtRe = new RegExp(district, 'i')

    const users = await User.find({ 'location.district': districtRe }).select('_id')
    const userIds = users.map(u => u._id)

    const [topSkills, companies, openToWork, students] = await Promise.all([
      DeveloperProfile.aggregate([
        { $match: { user: { $in: userIds } } },
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { skill: '$_id', count: 1, _id: 0 } },
      ]),
      DeveloperProfile.aggregate([
        { $match: { user: { $in: userIds }, company: { $ne: '' } } },
        { $group: { _id: '$company', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { company: '$_id', count: 1, _id: 0 } },
      ]),
      DeveloperProfile.countDocuments({ user: { $in: userIds }, openToWork: true }),
      User.countDocuments({ _id: { $in: userIds }, isStudent: true }),
    ])

    return {
      district,
      totalDevelopers: userIds.length,
      openToWork,
      students,
      topSkills,
      companies,
    }
  }

  async getTrendingSearches() {
    return SearchHistory.getTrending(10)
  }
}

module.exports = new AnalyticsService()
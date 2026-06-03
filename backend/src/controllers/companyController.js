const CompanyProfile = require('../models/CompanyProfile')
const DeveloperProfile = require('../models/DeveloperProfile')
const User = require('../models/User')
const Opportunity = require('../models/Opportunity')

const getCompanies = async (req, res, next) => {
  try {
    const { search, type, page = 1, limit = 20 } = req.query
    const query = {}
    if (search) query.$text = { $search: search }
    if (type)   query.type  = type

    // Auto-sync developer counts
    const companies = await CompanyProfile.find(query)
      .sort({ currentDevelopers: -1, tier: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    // Get live counts from DeveloperProfile
    const enriched = await Promise.all(companies.map(async (co) => {
      const count = await DeveloperProfile.countDocuments({
        company: { $regex: new RegExp(`^${co.name}$`, 'i') },
      })
      return { ...co.toObject(), currentDevelopers: count }
    }))

    // Also return discovered companies from profiles not in CompanyProfile
    const profileCompanies = await DeveloperProfile.aggregate([
      { $match: { company: { $ne: '' } } },
      { $group: { _id: { $toLower: '$company' }, name: { $first: '$company' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ])

    const total = await CompanyProfile.countDocuments(query)

    res.json({
      success: true,
      data: enriched,
      discovered: profileCompanies.filter(pc =>
        !enriched.some(e => e.name.toLowerCase() === pc._id)
      ).slice(0, 10),
      pagination: { page: Number(page), total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    next(error)
  }
}

const getCompanyBySlug = async (req, res, next) => {
  try {
    const { companySlug } = req.params
    let company = await CompanyProfile.findOne({ slug: companySlug })

    // Graceful: if not in CompanyProfile, build from developer data
    const companyName = company?.name || companySlug.replace(/-/g, ' ')
    const nameRe = new RegExp(`^${companyName}$`, 'i')

    // Current developers
    const currentProfiles = await DeveloperProfile.find({ company: nameRe })
      .populate('user', 'name username avatar bio location isFeatured isVerified reputation')
      .sort({ 'user.reputation': -1 })

    // Alumni (companyHistory)
    const alumniProfiles = await DeveloperProfile.find({
      company: { $not: nameRe },
      'companyHistory.company': nameRe,
    }).populate('user', 'name username avatar bio')

    // Skills aggregation
    const allSkills = currentProfiles.flatMap(p => p.skills)
    const skillCount = allSkills.reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc }, {})
    const topSkills = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }))

    // Active opportunities mentioning this company
    const opportunities = await Opportunity.find({
      isActive: true,
      company: nameRe,
    }).populate('postedBy', 'name username avatar').limit(5)

    res.json({
      success: true,
      data: {
        company: company || { name: companyName, slug: companySlug },
        currentDevelopers: currentProfiles,
        alumni: alumniProfiles,
        topSkills,
        opportunities,
        stats: {
          currentCount: currentProfiles.length,
          alumniCount:  alumniProfiles.length,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { getCompanies, getCompanyBySlug }
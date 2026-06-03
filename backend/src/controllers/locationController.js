const LocationService = require('../services/LocationService')
const RecommendationService = require('../services/RecommendationService')

const getNearbyDevelopers = async (req, res, next) => {
  try {
    const { district, city, page = 1, limit = 12 } = req.query
    const result = await LocationService.getNearbyDevelopers(district, city, Number(limit), Number(page))
    res.json({ success: true, ...result })
  } catch (error) {
    next(error)
  }
}

const getDistrictSnapshot = async (req, res, next) => {
  try {
    const { district } = req.params
    const data = await LocationService.getDistrictSnapshot(district)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

const getDistricts = async (req, res, next) => {
  try {
    const districts = LocationService.getDistricts()
    res.json({ success: true, data: districts })
  } catch (error) {
    next(error)
  }
}

const getRecommendations = async (req, res, next) => {
  try {
    const DeveloperProfile = require('../models/DeveloperProfile')
    const profile = req.user ? await DeveloperProfile.findOne({ user: req.user._id }) : null

    const [developers, projects, opportunities, mentors] = await Promise.all([
      RecommendationService.recommendDevelopers(req.user?._id, profile, 8),
      RecommendationService.recommendProjects(req.user?._id, profile, 6),
      RecommendationService.recommendOpportunities(req.user?._id, profile, 5),
      RecommendationService.recommendMentors(req.user?._id, profile, 6),
    ])

    res.json({ success: true, data: { developers, projects, opportunities, mentors } })
  } catch (error) {
    next(error)
  }
}

module.exports = { getNearbyDevelopers, getDistrictSnapshot, getDistricts, getRecommendations }
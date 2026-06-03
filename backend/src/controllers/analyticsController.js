const AnalyticsService = require('../services/AnalyticsService')
const LocationService = require('../services/LocationService')

const getPlatformInsights = async (req, res, next) => {
  try {
    const [stats, byDistrict, topSkills, topCompanies, experience, growth] = await Promise.all([
      AnalyticsService.getPlatformStats(),
      AnalyticsService.getDevelopersByDistrict(),
      AnalyticsService.getTopSkills(20),
      AnalyticsService.getTopCompanies(15),
      AnalyticsService.getExperienceDistribution(),
      AnalyticsService.getGrowthOverTime(6),
    ])

    res.json({
      success: true,
      data: { stats, byDistrict, topSkills, topCompanies, experience, growth },
    })
  } catch (error) {
    next(error)
  }
}

const getDistrictAnalytics = async (req, res, next) => {
  try {
    const { district } = req.params
    const data = await AnalyticsService.getDistrictAnalytics(district)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

const getAllDistricts = async (req, res, next) => {
  try {
    const districts = LocationService.getDistricts()
    res.json({ success: true, data: districts })
  } catch (error) {
    next(error)
  }
}

module.exports = { getPlatformInsights, getDistrictAnalytics, getAllDistricts }
const express = require('express')
const router = express.Router()
const { getPlatformInsights, getDistrictAnalytics, getAllDistricts } = require('../controllers/analyticsController')

router.get('/insights',            getPlatformInsights)
router.get('/districts',           getAllDistricts)
router.get('/districts/:district', getDistrictAnalytics)

module.exports = router
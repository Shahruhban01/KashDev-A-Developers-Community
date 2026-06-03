const express = require('express')
const router = express.Router()
const { getNearbyDevelopers, getDistrictSnapshot, getDistricts, getRecommendations } = require('../controllers/locationController')
const { optionalAuth } = require('../middleware/auth')

router.get('/nearby',              optionalAuth, getNearbyDevelopers)
router.get('/districts',                         getDistricts)
router.get('/districts/:district',               getDistrictSnapshot)
router.get('/recommendations',     optionalAuth, getRecommendations)

module.exports = router
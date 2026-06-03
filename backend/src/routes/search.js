const express = require('express')
const router = express.Router()
const { search, suggest, trending, related } = require('../controllers/searchController')
const { optionalAuth } = require('../middleware/auth')

router.get('/',          optionalAuth, search)
router.get('/suggest',               suggest)
router.get('/trending',              trending)
router.get('/related',               related)

module.exports = router
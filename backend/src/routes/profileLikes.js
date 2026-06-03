const express = require('express')
const router = express.Router()
const { toggleLike, getProfileLikes, getLeaderboard } = require('../controllers/profileLikeController')
const { protect, optionalAuth } = require('../middleware/auth')

router.get('/leaderboard',           getLeaderboard)
router.get('/:profileId',  optionalAuth, getProfileLikes)
router.post('/:profileId', protect,   toggleLike)

module.exports = router
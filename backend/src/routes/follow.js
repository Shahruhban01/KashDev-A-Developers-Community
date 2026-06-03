const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing,
} = require('../controllers/followController')

router.post('/:userId', protect, toggleFollow)
router.get('/:userId/status', protect, getFollowStatus)
router.get('/:userId/followers', getFollowers)
router.get('/:userId/following', getFollowing)

module.exports = router

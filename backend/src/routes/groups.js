const express = require('express')
const router = express.Router()
const {
  createGroup, getGroups, getGroupBySlug, joinGroup, leaveGroup, updateMemberRole,
} = require('../controllers/groupController')
const { protect } = require('../middleware/auth')

router.get('/',              getGroups)
router.post('/',    protect, createGroup)
router.get('/:slug',         getGroupBySlug)
router.post('/:id/join',  protect, joinGroup)
router.post('/:id/leave', protect, leaveGroup)
router.put('/:id/members', protect, updateMemberRole)

module.exports = router
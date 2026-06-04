const express = require('express')
const router  = express.Router()
const { protect }  = require('../middleware/auth')
const isAdmin      = require('../middleware/isAdmin')
const {
  joinWaitlist,
  getWaitlistCount,
  getWaitlist,
  getWaitlistStats,
  getWaitlistAnalytics,
  getWaitlistMember,
  updateWaitlistMember,
  addNote,
  deleteWaitlistMember,
  bulkAction,
  exportCsv,
} = require('../controllers/waitlistController')

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/',          joinWaitlist)
router.get('/count',      getWaitlistCount)

// ── Admin — all require valid JWT + admin role ─────────────────────────────
router.use(protect, isAdmin)

router.get('/',               getWaitlist)
router.get('/stats',          getWaitlistStats)
router.get('/analytics',      getWaitlistAnalytics)
router.get('/export/csv',     exportCsv)
router.post('/bulk',          bulkAction)
router.get('/:id',            getWaitlistMember)
router.put('/:id',            updateWaitlistMember)
router.post('/:id/notes',     addNote)
router.delete('/:id',         deleteWaitlistMember)

module.exports = router

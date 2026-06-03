const express = require('express')
const router = express.Router()
const { toggleBookmark, getBookmarks } = require('../controllers/bookmarkController')
const { protect } = require('../middleware/auth')

router.use(protect)
router.get('/',     getBookmarks)
router.post('/',    toggleBookmark)

module.exports = router
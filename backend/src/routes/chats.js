const express = require('express')
const router = express.Router()
const {
  getOrCreateChat, getMyChats, getChatMessages,
  sendMessageRequest, getMessageRequests, respondToRequest, archiveChat,
} = require('../controllers/chatController')
const { protect } = require('../middleware/auth')

router.use(protect)

router.get('/',                           getMyChats)
router.get('/requests',                   getMessageRequests)
router.post('/requests',                  sendMessageRequest)
router.put('/requests/:requestId',        respondToRequest)
router.get('/with/:userId',               getOrCreateChat)
router.get('/:chatId/messages',           getChatMessages)
router.put('/:chatId/archive',            archiveChat)

module.exports = router
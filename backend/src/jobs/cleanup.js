const ForumQuestion = require('../models/ForumQuestion')
const Message = require('../models/Message')

const startCleanupJobs = () => {
  console.log('🧹 Cleanup jobs started')

  // Run every 6 hours
  setInterval(async () => {
    try {
      // Permanently delete forum questions soft-deleted 30+ days ago
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const deletedQuestions = await ForumQuestion.deleteMany({
        isDeleted: true,
        deletedAt: { $lte: thirtyDaysAgo },
      })
      if (deletedQuestions.deletedCount > 0) {
        console.log(`🗑️  Purged ${deletedQuestions.deletedCount} deleted forum questions`)
      }

      // Delete auto-expiring messages
      const expiredMessages = await Message.deleteMany({
        autoDeleteAt: { $lte: new Date(), $ne: null },
      })
      if (expiredMessages.deletedCount > 0) {
        console.log(`🗑️  Purged ${expiredMessages.deletedCount} auto-delete messages`)
      }
    } catch (err) {
      console.error('Cleanup job error:', err.message)
    }
  }, 6 * 60 * 60 * 1000)
}

module.exports = { startCleanupJobs }
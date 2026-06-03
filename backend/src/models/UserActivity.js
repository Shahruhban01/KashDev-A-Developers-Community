const mongoose = require('mongoose')

const userActivitySchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['view_profile', 'view_project', 'like_project', 'save_opportunity',
           'ask_question', 'answer_question', 'upvote', 'search', 'follow',
           'bookmark'],
    required: true,
  },
  targetType: { type: String }, // 'user', 'project', 'opportunity', 'question'
  targetId:   { type: mongoose.Schema.Types.ObjectId },
  metadata:   { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true })

userActivitySchema.index({ user: 1, createdAt: -1 })
userActivitySchema.index({ type: 1 })
userActivitySchema.index({ targetType: 1, targetId: 1 })

// TTL — keep activity for 90 days
userActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 })

module.exports = mongoose.model('UserActivity', userActivitySchema)

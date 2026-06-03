const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type:      {
    type: String,
    enum: [
      'new_message', 'message_request', 'message_request_accepted',
      'group_invite', 'opportunity_application', 'application_status',
      'forum_answer', 'answer_accepted', 'profile_like', 'new_follower',
    ],
    required: true,
  },
  title:    { type: String, required: true },
  body:     { type: String, default: '' },
  link:     { type: String, default: '' },
  data:     { type: mongoose.Schema.Types.Mixed, default: {} },
  isRead:   { type: Boolean, default: false },
  readAt:   { type: Date },
}, { timestamps: true })

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })
// Auto-delete notifications after 60 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 })

module.exports = mongoose.model('Notification', notificationSchema)
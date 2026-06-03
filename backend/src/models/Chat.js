const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
  type: { type: String, enum: ['private', 'group'], default: 'private' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  mutedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

chatSchema.index({ participants: 1, type: 1 })
chatSchema.index({ lastActivity: -1 })

module.exports = mongoose.model('Chat', chatSchema)
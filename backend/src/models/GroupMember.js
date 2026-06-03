const mongoose = require('mongoose')

const groupMemberSchema = new mongoose.Schema({
  group:    { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role:     { type: String, enum: ['member', 'moderator', 'admin'], default: 'member' },
  isActive: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: false })

groupMemberSchema.index({ group: 1, user: 1 }, { unique: true })

module.exports = mongoose.model('GroupMember', groupMemberSchema)
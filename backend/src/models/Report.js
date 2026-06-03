const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
  reporter:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['question', 'answer', 'user', 'project'], required: true },
  targetId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  reason:     { type: String, enum: ['spam', 'harassment', 'off-topic', 'inappropriate', 'duplicate', 'other'], required: true },
  details:    { type: String, maxlength: 500, default: '' },
  status:     { type: String, enum: ['pending', 'reviewed', 'dismissed', 'actioned'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewNote: { type: String, default: '' },
}, { timestamps: true })

reportSchema.index({ status: 1 })
reportSchema.index({ targetType: 1, targetId: 1 })

module.exports = mongoose.model('Report', reportSchema)
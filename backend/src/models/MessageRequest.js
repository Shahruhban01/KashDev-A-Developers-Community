const mongoose = require('mongoose')

const messageRequestSchema = new mongoose.Schema({
  sender:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  initialMessage: { type: String, default: '' },
  status:         { type: String, enum: ['pending', 'accepted', 'rejected', 'ignored'], default: 'pending' },
}, { timestamps: true })

messageRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true })

module.exports = mongoose.model('MessageRequest', messageRequestSchema)
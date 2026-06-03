const mongoose = require('mongoose')

const reactionSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emoji: { type: String },
}, { _id: false })

const messageSchema = new mongoose.Schema({
  chat:        { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:     { type: String, default: '' },
  contentType: { type: String, enum: ['text', 'image', 'document', 'link', 'emoji', 'system'], default: 'text' },
  replyTo:     { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  reactions:   [reactionSchema],
  readBy:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isEdited:    { type: Boolean, default: false },
  editedAt:    { type: Date },
  isDeleted:   { type: Boolean, default: false },
  deletedFor:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  autoDeleteAt:{ type: Date, default: null },
}, { timestamps: true })

messageSchema.index({ chat: 1, createdAt: -1 })
messageSchema.index({ sender: 1 })
messageSchema.index({ autoDeleteAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('Message', messageSchema)
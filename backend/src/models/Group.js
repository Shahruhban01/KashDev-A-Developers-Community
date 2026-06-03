const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  description: { type: String, default: '' },
  avatar:      { type: String, default: '' },
  type:        { type: String, enum: ['public', 'private'], default: 'public' },
  category:    { type: String, default: 'general' },
  tags:        [{ type: String }],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chat:        { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  memberCount: { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Group', groupSchema)
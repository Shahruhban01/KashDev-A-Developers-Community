const mongoose = require('mongoose')

const forumTagSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true, lowercase: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '', maxlength: 500 },
  color:       { type: String, default: '#5b8af0' },
  questionCount: { type: Number, default: 0 },
  weeklyCount:   { type: Number, default: 0 },
}, { timestamps: true })

forumTagSchema.index({ questionCount: -1 })
forumTagSchema.index({ name: 'text' })

module.exports = mongoose.model('ForumTag', forumTagSchema)
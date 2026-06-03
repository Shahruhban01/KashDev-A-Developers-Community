const mongoose = require('mongoose')

const bookmarkSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType:  { type: String, enum: ['developer', 'project', 'question', 'opportunity'], required: true },
  target:      { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetModel' },
  targetModel: { type: String, required: true },
}, { timestamps: true })

bookmarkSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true })
bookmarkSchema.index({ user: 1, targetType: 1 })

module.exports = mongoose.model('Bookmark', bookmarkSchema)

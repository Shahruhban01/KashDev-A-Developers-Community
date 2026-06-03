const mongoose = require('mongoose')

const forumAnswerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumQuestion', required: true },
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body:     { type: String, required: true, maxlength: 10000 },

  upvotes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  voteScore: { type: Number, default: 0 },

  isAccepted: { type: Boolean, default: false },
  isDeleted:  { type: Boolean, default: false },

  comments: [{
    author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    body:      { type: String, maxlength: 600 },
    createdAt: { type: Date, default: Date.now },
  }],

  reports:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
  reportCount: { type: Number, default: 0 },
}, { timestamps: true })

forumAnswerSchema.index({ question: 1, voteScore: -1 })
forumAnswerSchema.index({ author: 1 })
forumAnswerSchema.index({ isAccepted: 1 })

module.exports = mongoose.model('ForumAnswer', forumAnswerSchema)
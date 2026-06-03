const mongoose = require('mongoose')

const forumQuestionSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true, maxlength: 250 },
  body:    { type: String, required: true, maxlength: 10000 },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  tags:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'ForumTag' }],
  tagNames: { type: [String], default: [] }, // denormalized for fast queries

  // Voting
  upvotes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  voteScore: { type: Number, default: 0 },

  // Stats
  viewCount:    { type: Number, default: 0 },
  answerCount:  { type: Number, default: 0 },

  // State
  acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumAnswer', default: null },
  isLocked:       { type: Boolean, default: false },
  isPinned:       { type: Boolean, default: false },
  isClosed:       { type: Boolean, default: false },

  // Bookmarks / followers
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Moderation
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
  reportCount: { type: Number, default: 0 },

  // Scoring for hot/trending
  hotScore: { type: Number, default: 0 },
  lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true })

forumQuestionSchema.index({ voteScore: -1 })
forumQuestionSchema.index({ viewCount: -1 })
forumQuestionSchema.index({ hotScore: -1 })
forumQuestionSchema.index({ tagNames: 1 })
forumQuestionSchema.index({ author: 1 })
forumQuestionSchema.index({ lastActivityAt: -1 })
forumQuestionSchema.index({ title: 'text', body: 'text', tagNames: 'text' })

// Compute hot score (Wilson score approximation)
forumQuestionSchema.methods.computeHotScore = function () {
  const ageHours = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60)
  this.hotScore = (this.voteScore + this.answerCount * 2 + this.viewCount * 0.1) / Math.pow(ageHours + 2, 1.5)
  return this.hotScore
}

module.exports = mongoose.model('ForumQuestion', forumQuestionSchema)
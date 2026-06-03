// const mongoose = require('mongoose')

// const forumQuestionSchema = new mongoose.Schema({
//   title:   { type: String, required: true, trim: true, maxlength: 250 },
//   body:    { type: String, required: true, maxlength: 10000 },
//   author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

//   tags:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'ForumTag' }],
//   tagNames: { type: [String], default: [] }, // denormalized for fast queries

//   // Voting
//   upvotes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   voteScore: { type: Number, default: 0 },

//   // Stats
//   viewCount:    { type: Number, default: 0 },
//   answerCount:  { type: Number, default: 0 },

//   // State
//   acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumAnswer', default: null },
//   isLocked:       { type: Boolean, default: false },
//   isPinned:       { type: Boolean, default: false },
//   isClosed:       { type: Boolean, default: false },

//   // Bookmarks / followers
//   bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

//   // Moderation
//   reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
//   reportCount: { type: Number, default: 0 },

//   // Scoring for hot/trending
//   hotScore: { type: Number, default: 0 },
//   lastActivityAt: { type: Date, default: Date.now },
// }, { timestamps: true })

// forumQuestionSchema.index({ voteScore: -1 })
// forumQuestionSchema.index({ viewCount: -1 })
// forumQuestionSchema.index({ hotScore: -1 })
// forumQuestionSchema.index({ tagNames: 1 })
// forumQuestionSchema.index({ author: 1 })
// forumQuestionSchema.index({ lastActivityAt: -1 })
// forumQuestionSchema.index({ title: 'text', body: 'text', tagNames: 'text' })

// // Compute hot score (Wilson score approximation)
// forumQuestionSchema.methods.computeHotScore = function () {
//   const ageHours = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60)
//   this.hotScore = (this.voteScore + this.answerCount * 2 + this.viewCount * 0.1) / Math.pow(ageHours + 2, 1.5)
//   return this.hotScore
// }

// module.exports = mongoose.model('ForumQuestion', forumQuestionSchema)
const mongoose = require('mongoose')

const voteSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  value: { type: Number, enum: [1, -1] },
}, { _id: false })

const forumQuestionSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  body:        { type: String, required: true },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags:        [{ type: String }],
  votes:       [voteSchema],
  voteCount:   { type: Number, default: 0 },
  views:       { type: Number, default: 0 },
  answerCount: { type: Number, default: 0 },
  isSolved:    { type: Boolean, default: false },
  lastActivity:{ type: Date, default: Date.now },
  isDeleted:   { type: Boolean, default: false },
  deletedAt:   { type: Date },
  deletedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

forumQuestionSchema.index({ isDeleted: 1, createdAt: -1 })
forumQuestionSchema.index({ tags: 1 })
// Auto-purge soft-deleted questions after 30 days
forumQuestionSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { isDeleted: true } })

module.exports = mongoose.model('ForumQuestion', forumQuestionSchema)
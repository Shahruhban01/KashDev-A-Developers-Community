const mongoose = require('mongoose')

const searchHistorySchema = new mongoose.Schema({
  query:      { type: String, required: true, trim: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId:  { type: String, default: '' },
  parsedIntent: {
    skills:      { type: [String], default: [] },
    companies:   { type: [String], default: [] },
    cities:      { type: [String], default: [] },
    districts:   { type: [String], default: [] },
    experience:  { type: String, default: '' },
    openToWork:  { type: Boolean, default: false },
    isStudent:   { type: Boolean, default: false },
    openToMentor:{ type: Boolean, default: false },
    isFounder:   { type: Boolean, default: false },
    isFreelancer:{ type: Boolean, default: false },
    openSource:  { type: Boolean, default: false },
  },
  resultCount: { type: Number, default: 0 },
  clickedResults: [{ type: String }], // usernames clicked
}, { timestamps: true })

searchHistorySchema.index({ query: 1 })
searchHistorySchema.index({ user: 1 })
searchHistorySchema.index({ createdAt: -1 })

// Statics for trending
searchHistorySchema.statics.getTrending = async function (limit = 10) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // last 7 days
  return this.aggregate([
    { $match: { createdAt: { $gte: since }, query: { $ne: '' } } },
    { $group: { _id: '$query', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { query: '$_id', count: 1, _id: 0 } },
  ])
}

module.exports = mongoose.model('SearchHistory', searchHistorySchema)
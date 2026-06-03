const mongoose = require('mongoose')

const stageHistorySchema = new mongoose.Schema({
  stage:     { type: String },
  note:      { type: String, default: '' },
  changedAt: { type: Date, default: Date.now },
}, { _id: false })

const applicationSchema = new mongoose.Schema({
  opportunity:  { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  applicant:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter:  { type: String, default: '' },
  resumeUrl:    { type: String, default: '' },
  resumeName:   { type: String, default: '' },
  stage: {
    type: String,
    enum: ['applied', 'under_review', 'interview', 'selected', 'rejected'],
    default: 'applied',
  },
  stageHistory: [stageHistorySchema],
  isShortlisted:{ type: Boolean, default: false },
}, { timestamps: true })

applicationSchema.index({ opportunity: 1, applicant: 1 }, { unique: true })
applicationSchema.index({ applicant: 1 })

module.exports = mongoose.model('Application', applicationSchema)
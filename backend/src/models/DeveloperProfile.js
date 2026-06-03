const mongoose = require('mongoose')

const developerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  skills:     { type: [String], default: [] },
  company:    { type: String, default: '' },
  jobTitle:   { type: String, default: '' },
  experience: {
    type: String,
    enum: ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
    default: '0-1 years',
  },

  github:    { type: String, default: '' },
  linkedin:  { type: String, default: '' },
  portfolio: { type: String, default: '' },
  twitter:   { type: String, default: '' },

  // Work preferences
  openToWork:        { type: Boolean, default: false },
  openToFreelance:   { type: Boolean, default: false },
  openToMentor:      { type: Boolean, default: false },
  openToCollaborate: { type: Boolean, default: false },

  // Community status
  openSourceContributor: { type: Boolean, default: false },
  founderStatus:         { type: Boolean, default: false },
  hallOfFameCategory: {
    type: String,
    enum: ['', 'top-contributor', 'startup-founder', 'major-company', 'open-source'],
    default: '',
  },

  achievements: { type: [String], default: [] },
  profileViews: { type: Number, default: 0 },

  // Company history (for alumni tracking)
  companyHistory: [{
    company:   { type: String },
    jobTitle:  { type: String },
    startYear: { type: Number },
    endYear:   { type: Number },
    isCurrent: { type: Boolean, default: false },
  }],
}, { timestamps: true })

developerProfileSchema.index({ skills: 1 })
developerProfileSchema.index({ company: 1 })
developerProfileSchema.index({ openToWork: 1 })
developerProfileSchema.index({ openToMentor: 1 })
developerProfileSchema.index({ founderStatus: 1 })
developerProfileSchema.index({ openSourceContributor: 1 })

module.exports = mongoose.model('DeveloperProfile', developerProfileSchema)
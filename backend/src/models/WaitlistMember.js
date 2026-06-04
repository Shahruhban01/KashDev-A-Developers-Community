const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  text:      { type: String, required: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
}, { _id: true })

const waitlistMemberSchema = new mongoose.Schema({
  // Required fields
  full_name: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String, required: true, unique: true, trim: true, lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
  },
  location: { type: String, required: true, trim: true, maxlength: 100 },
  role: {
    type: String, required: true,
    enum: ['Student', 'Developer', 'Freelancer', 'Founder', 'Designer', 'Recruiter', 'Tech Enthusiast', 'Other'],
  },

  // Optional profile fields
  phone:             { type: String, trim: true, maxlength: 20, default: '' },
  github_url:        { type: String, trim: true, maxlength: 200, default: '' },
  linkedin_url:      { type: String, trim: true, maxlength: 200, default: '' },
  portfolio_url:     { type: String, trim: true, maxlength: 200, default: '' },
  company_or_college:{ type: String, trim: true, maxlength: 150, default: '' },
  skills:            { type: String, trim: true, maxlength: 500, default: '' },
  message:           { type: String, trim: true, maxlength: 1000, default: '' },

  // Admin management
  status: {
    type: String,
    enum: ['new', 'reviewed', 'approved', 'rejected', 'contacted'],
    default: 'new',
  },
  contacted:    { type: Boolean, default: false },
  contacted_at: { type: Date, default: null },
  notes:        { type: [noteSchema], default: [] },
  source:       { type: String, default: 'website', maxlength: 50 },
}, { timestamps: true })

// Indexes for efficient querying (email index auto-created by unique:true)
waitlistMemberSchema.index({ location: 1 })
waitlistMemberSchema.index({ role: 1 })
waitlistMemberSchema.index({ status: 1 })
waitlistMemberSchema.index({ createdAt: -1 })
waitlistMemberSchema.index({ contacted: 1 })
// Full-text search across name, email, skills, company, location
waitlistMemberSchema.index({ full_name: 'text', email: 'text', skills: 'text', company_or_college: 'text', location: 'text' })

module.exports = mongoose.model('WaitlistMember', waitlistMemberSchema)

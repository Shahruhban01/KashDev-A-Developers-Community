const mongoose = require('mongoose')

const companyProfileSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '', maxlength: 1000 },
  website:     { type: String, default: '' },
  logo:        { type: String, default: '' },
  industry:    { type: String, default: '' },
  type:        { type: String, enum: ['mnc', 'startup', 'research', 'government', 'freelance', 'other'], default: 'other' },
  headquarters:{ type: String, default: '' },
  tier:        { type: Number, default: 3 }, // 1=FAANG, 2=mid, 3=other — for sorting

  // Auto-computed stats (updated by cron/service)
  currentDevelopers: { type: Number, default: 0 },
  alumniCount:       { type: Number, default: 0 },
  topSkills:         { type: [String], default: [] },
}, { timestamps: true })

companyProfileSchema.index({ currentDevelopers: -1 })
companyProfileSchema.index({ name: 'text' })

// Seed well-known companies
companyProfileSchema.statics.seedKnown = async function () {
  const known = [
    { name: 'Google',     slug: 'google',     type: 'mnc', tier: 1, headquarters: 'Mountain View, CA', industry: 'Technology' },
    { name: 'Microsoft',  slug: 'microsoft',  type: 'mnc', tier: 1, headquarters: 'Redmond, WA',       industry: 'Technology' },
    { name: 'Amazon',     slug: 'amazon',     type: 'mnc', tier: 1, headquarters: 'Seattle, WA',       industry: 'Technology' },
    { name: 'Meta',       slug: 'meta',        type: 'mnc', tier: 1, headquarters: 'Menlo Park, CA',   industry: 'Technology' },
    { name: 'Apple',      slug: 'apple',       type: 'mnc', tier: 1, headquarters: 'Cupertino, CA',    industry: 'Technology' },
    { name: 'Adobe',      slug: 'adobe',       type: 'mnc', tier: 1, headquarters: 'San Jose, CA',     industry: 'Technology' },
    { name: 'IBM',        slug: 'ibm',         type: 'mnc', tier: 2, headquarters: 'Armonk, NY',       industry: 'Technology' },
    { name: 'Infosys',    slug: 'infosys',     type: 'mnc', tier: 2, headquarters: 'Bengaluru, India', industry: 'IT Services' },
    { name: 'TCS',        slug: 'tcs',         type: 'mnc', tier: 2, headquarters: 'Mumbai, India',    industry: 'IT Services' },
    { name: 'Wipro',      slug: 'wipro',       type: 'mnc', tier: 2, headquarters: 'Bengaluru, India', industry: 'IT Services' },
    { name: 'HCL',        slug: 'hcl',         type: 'mnc', tier: 2, headquarters: 'Noida, India',     industry: 'IT Services' },
    { name: 'Zoho',       slug: 'zoho',        type: 'mnc', tier: 2, headquarters: 'Chennai, India',   industry: 'Technology' },
    { name: 'Freelancer', slug: 'freelancer',  type: 'freelance', tier: 3, headquarters: 'Remote',     industry: 'Freelance' },
  ]
  for (const c of known) {
    await this.updateOne({ slug: c.slug }, { $setOnInsert: c }, { upsert: true })
  }
}

module.exports = mongoose.model('CompanyProfile', companyProfileSchema)

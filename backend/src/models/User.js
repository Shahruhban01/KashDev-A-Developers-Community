const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const locationSchema = new mongoose.Schema({
  country: { type: String, default: 'India' },
  state: { type: String, default: 'Jammu & Kashmir' },
  district: { type: String, default: '' },
  city: { type: String, default: '' },
  locality: { type: String, default: '' },
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
}, { _id: false })

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  username: {
    type: String, required: true, unique: true, trim: true, lowercase: true,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, underscores'],
    minlength: 3, maxlength: 30
  },
  email: {
    type: String, required: true, unique: true, trim: true, lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  password: { type: String, required: true, minlength: 6, select: false },
  bio: { type: String, maxlength: 300, default: '' },
  avatar: { type: String, default: '' },

  // Location (enhanced)
  location: { type: locationSchema, default: () => ({}) },
  locationString: { type: String, default: 'Kashmir, India' }, // legacy display field

  // Profile meta
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isFeatured: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isStudent: { type: Boolean, default: false },

  // Career
  interests: { type: [String], default: [] },
  careerGoals: { type: String, default: '' },

  // v3 additions:
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  reputation: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },

  // Reputation & gamification
  reputation: { type: Number, default: 0 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],

  // Saved items
  savedOpportunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' }],
  savedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  savedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ForumQuestion' }],

  // Feed preferences
  feedPreferences: {
    showNearby: { type: Boolean, default: true },
    showRecommended: { type: Boolean, default: true },
    showTrending: { type: Boolean, default: true },
  },
}, { timestamps: true })

// Indexes for search and location queries
userSchema.index({ 'location.district': 1 })
userSchema.index({ 'location.city': 1 })
userSchema.index({ reputation: -1 })
// userSchema.index({ name: 'text', bio: 'text' })
userSchema.index({ name: 'text', bio: 'text', username: 'text' })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password)
}

userSchema.methods.addReputation = async function (points) {
  this.reputation += points
  return this.save()
}

// Add after your schema definition, before module.exports
userSchema.virtual('locationDisplay').get(function () {
  if (this.locationString) return this.locationString
  const loc = this.location
  if (!loc) return 'Kashmir, India'
  return [loc.city, loc.district, loc.state, loc.country]
    .filter(Boolean)
    .join(', ') || 'Kashmir, India'
})

// Enable virtuals in toJSON/toObject so they appear in API responses
userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('User', userSchema)

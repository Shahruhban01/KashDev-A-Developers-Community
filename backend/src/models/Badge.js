const mongoose = require('mongoose')

const badgeSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  slug:        { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon:        { type: String, default: '🏅' },
  tier:        { type: String, enum: ['bronze', 'silver', 'gold'], default: 'bronze' },
  criteria: {
    type:      { type: String }, // 'reputation', 'questions', 'answers', 'projects', 'custom'
    threshold: { type: Number },
  },
}, { timestamps: true })

// Seed default badges
badgeSchema.statics.seedDefaults = async function () {
  const defaults = [
    { name: 'Contributor',         slug: 'contributor',         description: 'Made first contribution to the community', icon: '✍️', tier: 'bronze', criteria: { type: 'answers', threshold: 1 } },
    { name: 'Mentor',              slug: 'mentor',              description: 'Helped 10+ developers with answers',        icon: '🎓', tier: 'silver', criteria: { type: 'answers', threshold: 10 } },
    { name: 'Open Source Champion',slug: 'open-source-champion', description: 'Active open source contributor',          icon: '🌟', tier: 'gold',   criteria: { type: 'custom', threshold: 0 } },
    { name: 'Top Answerer',        slug: 'top-answerer',        description: 'Received 50+ upvotes on answers',          icon: '🏆', tier: 'gold',   criteria: { type: 'reputation', threshold: 500 } },
    { name: 'Community Leader',    slug: 'community-leader',    description: 'Reached 1000 reputation',                  icon: '👑', tier: 'gold',   criteria: { type: 'reputation', threshold: 1000 } },
    { name: 'First Question',      slug: 'first-question',      description: 'Asked first question',                     icon: '❓', tier: 'bronze', criteria: { type: 'questions', threshold: 1 } },
    { name: 'Curious Mind',        slug: 'curious-mind',        description: 'Asked 10 questions',                       icon: '🔍', tier: 'silver', criteria: { type: 'questions', threshold: 10 } },
    { name: 'Founder',             slug: 'founder',             description: 'Founded a startup',                        icon: '🚀', tier: 'gold',   criteria: { type: 'custom', threshold: 0 } },
  ]
  for (const badge of defaults) {
    await this.updateOne({ slug: badge.slug }, badge, { upsert: true })
  }
}

module.exports = mongoose.model('Badge', badgeSchema)
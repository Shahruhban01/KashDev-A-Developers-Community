require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const connectDB = require('../config/db')
const CompanyProfile = require('../models/CompanyProfile')
const Badge = require('../models/Badge')

const seed = async () => {
  await connectDB()
  await CompanyProfile.seedKnown()
  await Badge.seedDefaults()
  console.log('✅ Seed complete')
  process.exit(0)
}

seed()
// Run with: node src/scripts/seed.js
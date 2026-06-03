const mongoose = require('mongoose')

const profileLikeSchema = new mongoose.Schema({
  liker:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

profileLikeSchema.index({ liker: 1, profile: 1 }, { unique: true })
profileLikeSchema.index({ profile: 1 })

module.exports = mongoose.model('ProfileLike', profileLikeSchema)
const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Opportunity title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters'],
  },
  type: {
    type: String,
    required: true,
    enum: ['job', 'internship', 'freelance', 'cofounder'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  company: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: 'Remote',
  },
  salary: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
}, { timestamps: true });

opportunitySchema.index({ type: 1 });
opportunitySchema.index({ isActive: 1 });
opportunitySchema.index({ postedBy: 1 });
opportunitySchema.index({ title: 'text', description: 'text', company: 'text' })

module.exports = mongoose.model('Opportunity', opportunitySchema);
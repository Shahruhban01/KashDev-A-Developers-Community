const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  githubUrl: {
    type: String,
    default: '',
  },
  demoUrl: {
    type: String,
    default: '',
  },
  technologies: {
    type: [String],
    required: [true, 'At least one technology is required'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'wip'],
    default: 'active',
  },
}, { timestamps: true });

projectSchema.index({ owner: 1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ isFeatured: 1 });
projectSchema.index({ title: 'text', description: 'text' })


module.exports = mongoose.model('Project', projectSchema);
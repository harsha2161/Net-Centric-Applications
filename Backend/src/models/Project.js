const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    technologiesUsed: [
      {
        type: String,
        trim: true
      }
    ],
    coverImage: {
      type: String,
      default: ''
    },
    additionalImages: [
      {
        type: String
      }
    ],
    demoUrl: {
      type: String,
      default: ''
    },
    gitRepoUrl: {
      type: String,
      default: ''
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

module.exports = mongoose.model('Project', projectSchema);

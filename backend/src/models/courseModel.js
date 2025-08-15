const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  moduleCode: {
    type: String,
    required: true,
    unique: true
  },
  moduleTitle: {
    type: String,
    required: true
  },
  creditValue: {
    type: Number,
    required: true
  },
  prerequisites: [{
    type: String, // Module codes
    ref: 'Module'
  }],
  corequisites: [{
    type: String,
    ref: 'Module'
  }],
  summaryOfContents: {
    type: String,
    default: ''
  },
  intendedLearningOutcomes: [{
    type: String
  }],
  assessmentMethods: [{
    method: String,
    percentage: Number
  }],
  courseYear: {
    type: Number,
    min: 1,
    max: 4
  },
  semester: {
    type: String,
    enum: ['Autumn', 'Spring', 'Summer', 'Full Year'],
    default: 'Full Year'
  },
  isOptional: {
    type: Boolean,
    default: false
  },
  url: {
    type: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true,
    unique: true
  },
  degree: {
    type: String,
    enum: ['BSc', 'BA', 'BEng', 'MSc', 'MA', 'MEng', 'PhD', 'MRes'],
    required: true
  },
  department: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // Duration in years
    required: true
  },
  modules: {
    core: [{
      module: {
        type: String,
        ref: 'Module'
      },
      year: Number
    }],
    optional: [{
      module: {
        type: String,
        ref: 'Module'
      },
      year: Number
    }]
  },
  entryRequirements: {
    type: String
  },
  description: {
    type: String
  },
  url: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better performance
moduleSchema.index({ moduleCode: 1 });
moduleSchema.index({ moduleTitle: 'text' });
courseSchema.index({ courseCode: 1 });
courseSchema.index({ courseName: 'text' });

const Module = mongoose.model('Module', moduleSchema);
const Course = mongoose.model('Course', courseSchema);

module.exports = { Module, Course };

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    moduleTitle: {
        type: String,
        required: true
    },
    creditValue: {
        type: Number,
        required: true
    },
    prerequisites: {
        type: [String],
        default: []
    },
    summary: {
        type: String,
        required: true
    },
    intendedLearningOutcomes: {
        type: [String],
        required: true
    },
    assessmentMethods: {
        type: [String],
        required: true
    }
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
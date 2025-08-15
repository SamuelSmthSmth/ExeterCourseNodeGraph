const express = require('express');
const { Course, Module } = require('../models/courseModel');
const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const { search, degree, department } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } }
      ];
    }

    if (degree) {
      query.degree = degree;
    }

    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    const courses = await Course.find(query)
      .select('courseName courseCode degree department duration url')
      .sort({ courseName: 1 });

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
});

// Get specific course with modules
router.get('/:courseCode', async (req, res) => {
  try {
    const course = await Course.findOne({ courseCode: req.params.courseCode });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get all modules for this course
    const coreModuleCodes = course.modules.core.map(m => m.module);
    const optionalModuleCodes = course.modules.optional.map(m => m.module);
    const allModuleCodes = [...coreModuleCodes, ...optionalModuleCodes];

    const modules = await Module.find({ moduleCode: { $in: allModuleCodes } });

    res.json({
      success: true,
      data: {
        course,
        modules
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course details',
      error: error.message
    });
  }
});

// Get course modules with prerequisites (for graph visualization)
router.get('/:courseCode/graph', async (req, res) => {
  try {
    const course = await Course.findOne({ courseCode: req.params.courseCode });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get all modules for this course
    const coreModuleCodes = course.modules.core.map(m => m.module);
    const optionalModuleCodes = course.modules.optional.map(m => m.module);
    const allModuleCodes = [...coreModuleCodes, ...optionalModuleCodes];

    const modules = await Module.find({ moduleCode: { $in: allModuleCodes } });

    // Build nodes and edges for graph visualization
    const nodes = [
      // Course node
      {
        id: course.courseCode,
        label: course.courseName,
        type: 'course',
        data: {
          courseName: course.courseName,
          degree: course.degree,
          department: course.department,
          description: course.description
        }
      },
      // Module nodes
      ...modules.map(module => ({
        id: module.moduleCode,
        label: module.moduleTitle,
        type: 'module',
        data: {
          moduleCode: module.moduleCode,
          moduleTitle: module.moduleTitle,
          creditValue: module.creditValue,
          summaryOfContents: module.summaryOfContents,
          intendedLearningOutcomes: module.intendedLearningOutcomes,
          assessmentMethods: module.assessmentMethods,
          courseYear: module.courseYear,
          semester: module.semester,
          isOptional: module.isOptional
        }
      }))
    ];

    const edges = [];

    // Add edges from course to modules
    modules.forEach(module => {
      edges.push({
        id: `${course.courseCode}-${module.moduleCode}`,
        source: course.courseCode,
        target: module.moduleCode,
        type: coreModuleCodes.includes(module.moduleCode) ? 'core' : 'optional'
      });
    });

    // Add prerequisite edges between modules
    modules.forEach(module => {
      module.prerequisites.forEach(prereqCode => {
        if (allModuleCodes.includes(prereqCode)) {
          edges.push({
            id: `${prereqCode}-${module.moduleCode}`,
            source: prereqCode,
            target: module.moduleCode,
            type: 'prerequisite'
          });
        }
      });
    });

    res.json({
      success: true,
      data: {
        course,
        nodes,
        edges
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course graph data',
      error: error.message
    });
  }
});

module.exports = router;

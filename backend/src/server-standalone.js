const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const courseRoutes = require('./routes/courses');
const moduleRoutes = require('./routes/modules');
const { sampleCourses, sampleModules } = require('./scrapers/sampleData');

const app = express();
const PORT = process.env.PORT || 5000;

// Try to connect to database, but continue without it if it fails
let dbConnected = false;
connectDB().then(() => {
  dbConnected = true;
  console.log('Database connected successfully');
}).catch((error) => {
  console.log('Database connection failed, running with sample data only');
  console.log('To use full functionality, please set up MongoDB and restart the server');
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes - use database routes if connected, otherwise use sample data routes
if (dbConnected) {
  app.use('/api/courses', courseRoutes);
  app.use('/api/modules', moduleRoutes);
} else {
  // Sample data routes
  app.get('/api/courses', (req, res) => {
    const { search, degree, department } = req.query;
    let filteredCourses = [...sampleCourses];

    if (search) {
      filteredCourses = filteredCourses.filter(course =>
        course.courseName.toLowerCase().includes(search.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (degree) {
      filteredCourses = filteredCourses.filter(course => course.degree === degree);
    }

    if (department) {
      filteredCourses = filteredCourses.filter(course =>
        course.department.toLowerCase().includes(department.toLowerCase())
      );
    }

    res.json({
      success: true,
      count: filteredCourses.length,
      data: filteredCourses.map(course => ({
        courseName: course.courseName,
        courseCode: course.courseCode,
        degree: course.degree,
        department: course.department,
        duration: course.duration,
        url: course.url
      }))
    });
  });

  app.get('/api/courses/:courseCode', (req, res) => {
    const course = sampleCourses.find(c => c.courseCode === req.params.courseCode);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const coreModuleCodes = course.modules.core.map(m => m.module);
    const optionalModuleCodes = course.modules.optional.map(m => m.module);
    const allModuleCodes = [...coreModuleCodes, ...optionalModuleCodes];
    const modules = sampleModules.filter(m => allModuleCodes.includes(m.moduleCode));

    res.json({
      success: true,
      data: {
        course,
        modules
      }
    });
  });

  app.get('/api/courses/:courseCode/graph', (req, res) => {
    const course = sampleCourses.find(c => c.courseCode === req.params.courseCode);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const coreModuleCodes = course.modules.core.map(m => m.module);
    const optionalModuleCodes = course.modules.optional.map(m => m.module);
    const allModuleCodes = [...coreModuleCodes, ...optionalModuleCodes];
    const modules = sampleModules.filter(m => allModuleCodes.includes(m.moduleCode));

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
  });

  app.get('/api/modules/:moduleCode', (req, res) => {
    const module = sampleModules.find(m => m.moduleCode === req.params.moduleCode);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const prerequisites = sampleModules.filter(m => 
      module.prerequisites.includes(m.moduleCode)
    );

    const dependents = sampleModules.filter(m => 
      m.prerequisites.includes(module.moduleCode)
    );

    res.json({
      success: true,
      data: {
        module,
        prerequisites,
        dependents
      }
    });
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    database: dbConnected ? 'connected' : 'disconnected (using sample data)',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${dbConnected ? 'Connected' : 'Using sample data'}`);
  if (!dbConnected) {
    console.log('ℹ️  To enable full functionality, set up MongoDB and restart the server');
    console.log('ℹ️  See SETUP.md for detailed instructions');
  }
});

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

// Configure trust proxy for rate limiting (fix the X-Forwarded-For header error)
app.set('trust proxy', 1);

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow embedding for development
  contentSecurityPolicy: false // Disable CSP for development
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced rate limiting with better error handling
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator to avoid X-Forwarded-For issues
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Skip rate limiting for health checks
  skip: (req) => {
    return req.path === '/api/health' || req.path === '/api/status';
  }
});

app.use('/api/', limiter);

// Health check endpoint (should be available before other routes)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Database connection state
let dbConnected = false;
let dbConnectionAttempted = false;

// Attempt database connection with proper error handling
const attemptDatabaseConnection = async () => {
  if (!dbConnectionAttempted) {
    dbConnectionAttempted = true;
    try {
      await connectDB();
      dbConnected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.log('⚠️  Database connection failed, running with sample data only');
      console.log('ℹ️  To enable full functionality, set up MongoDB and restart the server');
      // Don't exit the process, just continue with sample data
    }
  }
};

// Start database connection attempt (non-blocking)
attemptDatabaseConnection();

// Enhanced sample data routes with better error handling
const createSampleDataRoutes = () => {
  // GET /api/courses - List all courses with filtering
  app.get('/api/courses', (req, res) => {
    try {
      const { search, degree, department, limit = 50, offset = 0 } = req.query;
      let filteredCourses = [...sampleCourses];

      // Apply filters
      if (search) {
        const searchTerm = search.toLowerCase();
        filteredCourses = filteredCourses.filter(course =>
          course.courseName.toLowerCase().includes(searchTerm) ||
          course.courseCode.toLowerCase().includes(searchTerm) ||
          (course.department && course.department.toLowerCase().includes(searchTerm))
        );
      }

      if (degree) {
        filteredCourses = filteredCourses.filter(course => 
          course.degree && course.degree.toLowerCase() === degree.toLowerCase()
        );
      }

      if (department) {
        filteredCourses = filteredCourses.filter(course =>
          course.department && course.department.toLowerCase().includes(department.toLowerCase())
        );
      }

      // Apply pagination
      const startIndex = parseInt(offset) || 0;
      const limitNum = Math.min(parseInt(limit) || 50, 100); // Max 100 per request
      const paginatedCourses = filteredCourses.slice(startIndex, startIndex + limitNum);

      res.json({
        success: true,
        count: paginatedCourses.length,
        total: filteredCourses.length,
        data: paginatedCourses.map(course => ({
          courseName: course.courseName || 'Unknown Course',
          courseCode: course.courseCode || 'Unknown Code',
          degree: course.degree || 'Unknown Degree',
          department: course.department || 'Unknown Department',
          duration: course.duration || 'Unknown Duration',
          url: course.url || '#'
        }))
      });
    } catch (error) {
      console.error('Error in /api/courses:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching courses',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // GET /api/courses/:courseCode - Get specific course details
  app.get('/api/courses/:courseCode', (req, res) => {
    try {
      const { courseCode } = req.params;
      const course = sampleCourses.find(c => 
        c.courseCode && c.courseCode.toLowerCase() === courseCode.toLowerCase()
      );
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Course with code '${courseCode}' not found`,
          suggestions: sampleCourses
            .slice(0, 3)
            .map(c => ({ courseCode: c.courseCode, courseName: c.courseName }))
        });
      }

      // Get related modules
      const coreModuleCodes = course.modules?.core?.map(m => m.module) || [];
      const optionalModuleCodes = course.modules?.optional?.map(m => m.module) || [];
      const allModuleCodes = [...coreModuleCodes, ...optionalModuleCodes];
      const modules = sampleModules.filter(m => 
        m.moduleCode && allModuleCodes.includes(m.moduleCode)
      );

      res.json({
        success: true,
        data: {
          course: {
            ...course,
            moduleCount: allModuleCodes.length,
            coreModuleCount: coreModuleCodes.length,
            optionalModuleCount: optionalModuleCodes.length
          },
          modules: modules.map(module => ({
            ...module,
            type: coreModuleCodes.includes(module.moduleCode) ? 'core' : 'optional'
          }))
        }
      });
    } catch (error) {
      console.error(`Error in /api/courses/${req.params.courseCode}:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching course details',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // GET /api/courses/:courseCode/graph - Get course graph data for visualization
  app.get('/api/courses/:courseCode/graph', (req, res) => {
    try {
      const { courseCode } = req.params;
      const course = sampleCourses.find(c => 
        c.courseCode && c.courseCode.toLowerCase() === courseCode.toLowerCase()
      );
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Course with code '${courseCode}' not found for graph generation`
        });
      }

      // Generate nodes and edges for React Flow
      const nodes = [];
      const edges = [];
      let nodeId = 1;

      // Helper function to create a node
      const createNode = (module, year, type = 'default', position = { x: 0, y: 0 }) => ({
        id: `node_${nodeId++}`,
        type: 'default',
        position,
        data: {
          label: `${module.moduleCode}\n${module.title || 'Module'}`,
          module,
          year,
          moduleType: type,
          credits: module.credits || 20,
          level: module.level || year
        },
        style: {
          background: type === 'core' ? '#667eea' : '#34d399',
          color: 'white',
          border: '2px solid #1f2937',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          textAlign: 'center',
          minWidth: '120px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      });

      // Process modules by year
      if (course.modules) {
        const modulesByYear = {};
        
        // Process core modules
        course.modules.core?.forEach(moduleRef => {
          const module = sampleModules.find(m => m.moduleCode === moduleRef.module);
          if (module) {
            const year = moduleRef.year || 1;
            if (!modulesByYear[year]) modulesByYear[year] = { core: [], optional: [] };
            modulesByYear[year].core.push(module);
          }
        });

        // Process optional modules
        course.modules.optional?.forEach(moduleRef => {
          const module = sampleModules.find(m => m.moduleCode === moduleRef.module);
          if (module) {
            const year = moduleRef.year || 1;
            if (!modulesByYear[year]) modulesByYear[year] = { core: [], optional: [] };
            modulesByYear[year].optional.push(module);
          }
        });

        // Create nodes with proper positioning
        Object.keys(modulesByYear).sort().forEach((year, yearIndex) => {
          const yearModules = modulesByYear[year];
          let moduleIndex = 0;

          // Add core modules
          yearModules.core.forEach(module => {
            nodes.push(createNode(module, year, 'core', {
              x: yearIndex * 300 + (moduleIndex % 3) * 150,
              y: Math.floor(moduleIndex / 3) * 100
            }));
            moduleIndex++;
          });

          // Add optional modules
          yearModules.optional.forEach(module => {
            nodes.push(createNode(module, year, 'optional', {
              x: yearIndex * 300 + (moduleIndex % 3) * 150,
              y: Math.floor(moduleIndex / 3) * 100 + 200
            }));
            moduleIndex++;
          });
        });

        // Create edges based on prerequisites
        nodes.forEach(node => {
          const module = node.data.module;
          if (module.prerequisites && module.prerequisites.length > 0) {
            module.prerequisites.forEach(prereq => {
              const sourceNode = nodes.find(n => 
                n.data.module.moduleCode === prereq
              );
              if (sourceNode) {
                edges.push({
                  id: `edge_${sourceNode.id}_${node.id}`,
                  source: sourceNode.id,
                  target: node.id,
                  type: 'smoothstep',
                  animated: true,
                  style: { stroke: '#9ca3af', strokeWidth: 2 },
                  markerEnd: { type: 'arrowclosed', color: '#9ca3af' }
                });
              }
            });
          }
        });
      }

      res.json({
        success: true,
        data: {
          course,
          nodes,
          edges,
          metadata: {
            totalNodes: nodes.length,
            totalEdges: edges.length,
            coreModules: nodes.filter(n => n.data.moduleType === 'core').length,
            optionalModules: nodes.filter(n => n.data.moduleType === 'optional').length,
            generatedAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error(`Error in /api/courses/${req.params.courseCode}/graph:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating course graph',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // GET /api/modules - List modules with filtering
  app.get('/api/modules', (req, res) => {
    try {
      const { search, level, credits, limit = 50, offset = 0 } = req.query;
      let filteredModules = [...sampleModules];

      if (search) {
        const searchTerm = search.toLowerCase();
        filteredModules = filteredModules.filter(module =>
          (module.title && module.title.toLowerCase().includes(searchTerm)) ||
          (module.moduleCode && module.moduleCode.toLowerCase().includes(searchTerm)) ||
          (module.description && module.description.toLowerCase().includes(searchTerm))
        );
      }

      if (level) {
        filteredModules = filteredModules.filter(module => 
          module.level && module.level.toString() === level.toString()
        );
      }

      if (credits) {
        filteredModules = filteredModules.filter(module => 
          module.credits && module.credits.toString() === credits.toString()
        );
      }

      // Apply pagination
      const startIndex = parseInt(offset) || 0;
      const limitNum = Math.min(parseInt(limit) || 50, 100);
      const paginatedModules = filteredModules.slice(startIndex, startIndex + limitNum);

      res.json({
        success: true,
        count: paginatedModules.length,
        total: filteredModules.length,
        data: paginatedModules
      });
    } catch (error) {
      console.error('Error in /api/modules:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching modules',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
};

// Set up routes (always use sample data routes for standalone mode)
createSampleDataRoutes();

// Additional utility routes
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    database: dbConnected ? 'connected' : 'sample-data',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Catch-all route for API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.path}' not found`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/status', 
      'GET /api/courses',
      'GET /api/courses/:courseCode',
      'GET /api/courses/:courseCode/graph',
      'GET /api/modules'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📅 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${dbConnected ? 'Connected' : 'Using sample data'}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  
  if (!dbConnected) {
    console.log('\nℹ️  To enable full functionality, set up MongoDB and restart the server');
    console.log('ℹ️  See SETUP.md for detailed instructions');
  }
  
  console.log('\n📋 Available endpoints:');
  console.log('   GET /api/health');
  console.log('   GET /api/status');
  console.log('   GET /api/courses');
  console.log('   GET /api/courses/:courseCode');
  console.log('   GET /api/courses/:courseCode/graph');
  console.log('   GET /api/modules');
  console.log('\n✅ Server ready for connections!');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Try stopping other servers or use a different port');
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

module.exports = app;

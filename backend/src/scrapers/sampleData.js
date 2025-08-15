const { Course, Module } = require('../models/courseModel');

// Sample data for testing when MongoDB is not available
const sampleCourses = [
  {
    courseName: "Mathematics",
    courseCode: "MATHBSC",
    degree: "BSc",
    department: "Mathematics and Statistics",
    duration: 3,
    description: "A comprehensive mathematics degree covering pure and applied mathematics, statistics, and computational methods.",
    url: "https://www.exeter.ac.uk/undergraduate/degrees/mathematics/mathematics/",
    modules: {
      core: [
        { module: "MTH1001", year: 1 },
        { module: "MTH1002", year: 1 },
        { module: "MTH2001", year: 2 },
        { module: "MTH2002", year: 2 },
        { module: "MTH3001", year: 3 }
      ],
      optional: [
        { module: "MTH2003", year: 2 },
        { module: "MTH3002", year: 3 },
        { module: "MTH3003", year: 3 }
      ]
    }
  },
  {
    courseName: "Computer Science",
    courseCode: "COMPBSC",
    degree: "BSc",
    department: "Computer Science",
    duration: 3,
    description: "A modern computer science degree covering programming, algorithms, software engineering, and artificial intelligence.",
    url: "https://www.exeter.ac.uk/undergraduate/degrees/computerscience/computerscience/",
    modules: {
      core: [
        { module: "ECM1400", year: 1 },
        { module: "ECM1410", year: 1 },
        { module: "ECM2400", year: 2 },
        { module: "ECM2410", year: 2 },
        { module: "ECM3400", year: 3 }
      ],
      optional: [
        { module: "ECM2420", year: 2 },
        { module: "ECM3410", year: 3 },
        { module: "ECM3420", year: 3 }
      ]
    }
  }
];

const sampleModules = [
  // Mathematics modules
  {
    moduleCode: "MTH1001",
    moduleTitle: "Calculus and Linear Algebra",
    creditValue: 20,
    prerequisites: [],
    summaryOfContents: "Introduction to differential and integral calculus, matrices and vector spaces.",
    intendedLearningOutcomes: [
      "Understand fundamental concepts of calculus",
      "Perform matrix operations and solve linear systems",
      "Apply calculus techniques to solve real-world problems"
    ],
    assessmentMethods: [
      { method: "Examination", percentage: 70 },
      { method: "Coursework", percentage: 30 }
    ],
    courseYear: 1,
    semester: "Full Year",
    isOptional: false
  },
  {
    moduleCode: "MTH1002",
    moduleTitle: "Probability and Statistics",
    creditValue: 20,
    prerequisites: [],
    summaryOfContents: "Basic probability theory, statistical distributions, hypothesis testing.",
    intendedLearningOutcomes: [
      "Calculate probabilities for various scenarios",
      "Understand statistical distributions",
      "Perform hypothesis tests"
    ],
    assessmentMethods: [
      { method: "Examination", percentage: 80 },
      { method: "Coursework", percentage: 20 }
    ],
    courseYear: 1,
    semester: "Full Year",
    isOptional: false
  },
  {
    moduleCode: "MTH2001",
    moduleTitle: "Analysis",
    creditValue: 20,
    prerequisites: ["MTH1001"],
    summaryOfContents: "Real analysis, sequences, series, continuity and differentiability.",
    intendedLearningOutcomes: [
      "Understand rigorous mathematical proofs",
      "Analyze convergence of sequences and series",
      "Apply analysis techniques to functions"
    ],
    assessmentMethods: [
      { method: "Examination", percentage: 100 }
    ],
    courseYear: 2,
    semester: "Autumn",
    isOptional: false
  },
  {
    moduleCode: "MTH2002",
    moduleTitle: "Abstract Algebra",
    creditValue: 20,
    prerequisites: ["MTH1001"],
    summaryOfContents: "Group theory, ring theory, field theory and their applications.",
    intendedLearningOutcomes: [
      "Understand abstract algebraic structures",
      "Prove theorems about groups and rings",
      "Apply algebraic concepts to problem solving"
    ],
    assessmentMethods: [
      { method: "Examination", percentage: 70 },
      { method: "Coursework", percentage: 30 }
    ],
    courseYear: 2,
    semester: "Spring",
    isOptional: false
  },
  {
    moduleCode: "MTH2003",
    moduleTitle: "Numerical Methods",
    creditValue: 15,
    prerequisites: ["MTH1001"],
    summaryOfContents: "Computational approaches to mathematical problems, programming with MATLAB.",
    intendedLearningOutcomes: [
      "Implement numerical algorithms",
      "Use MATLAB for mathematical computation",
      "Analyze numerical errors"
    ],
    assessmentMethods: [
      { method: "Coursework", percentage: 100 }
    ],
    courseYear: 2,
    semester: "Spring",
    isOptional: true
  },
  {
    moduleCode: "MTH3001",
    moduleTitle: "Complex Analysis",
    creditValue: 20,
    prerequisites: ["MTH2001"],
    summaryOfContents: "Functions of a complex variable, contour integration, residue theory.",
    intendedLearningOutcomes: [
      "Understand complex function theory",
      "Perform contour integration",
      "Apply residue calculus"
    ],
    assessmentMethods: [
      { method: "Examination", percentage: 100 }
    ],
    courseYear: 3,
    semester: "Autumn",
    isOptional: false
  },
  {
    moduleCode: "MTH3002",
    moduleTitle: "Differential Equations",
    creditValue: 20,
    prerequisites: ["MTH2001"],
    summaryOfContents: "Ordinary and partial differential equations, analytical and numerical solutions.",
    intendedLearningOutcomes: [
      "Solve various types of differential equations",
      "Understand existence and uniqueness theorems",
      "Apply differential equations to modeling"
    ],
    assessmentMethods: [
      { method: "Examination", percentage: 80 },
      { method: "Coursework", percentage: 20 }
    ],
    courseYear: 3,
    semester: "Spring",
    isOptional: true
  },
  {
    moduleCode: "MTH3003",
    moduleTitle: "Mathematical Modeling",
    creditValue: 15,
    prerequisites: ["MTH2001", "MTH1002"],
    summaryOfContents: "Mathematical modeling of real-world phenomena, optimization techniques.",
    intendedLearningOutcomes: [
      "Develop mathematical models",
      "Use optimization techniques",
      "Validate model solutions"
    ],
    assessmentMethods: [
      { method: "Coursework", percentage: 100 }
    ],
    courseYear: 3,
    semester: "Full Year",
    isOptional: true
  },

  // Computer Science modules
  {
    moduleCode: "ECM1400",
    moduleTitle: "Programming",
    creditValue: 20,
    prerequisites: [],
    summaryOfContents: "Introduction to programming using Python, fundamental algorithms and data structures.",
    intendedLearningOutcomes: [
      "Write programs in Python",
      "Understand basic algorithms",
      "Use fundamental data structures"
    ],
    assessmentMethods: [
      { method: "Coursework", percentage: 100 }
    ],
    courseYear: 1,
    semester: "Full Year",
    isOptional: false
  },
  {
    moduleCode: "ECM1410",
    moduleTitle: "Object-Oriented Programming",
    creditValue: 20,
    prerequisites: ["ECM1400"],
    summaryOfContents: "Object-oriented programming concepts, Java programming, software design patterns.",
    intendedLearningOutcomes: [
      "Understand OOP principles",
      "Program in Java",
      "Apply design patterns"
    ],
    assessmentMethods: [
      { method: "Coursework", percentage: 70 },
      { method: "Examination", percentage: 30 }
    ],
    courseYear: 1,
    semester: "Spring",
    isOptional: false
  },
  {
    moduleCode: "ECM2400",
    moduleTitle: "Database Systems",
    creditValue: 20,
    prerequisites: ["ECM1400"],
    summaryOfContents: "Database design, SQL, normalization, transaction processing.",
    intendedLearningOutcomes: [
      "Design relational databases",
      "Write complex SQL queries",
      "Understand transaction processing"
    ],
    assessmentMethods: [
      { method: "Examination", percentage: 50 },
      { method: "Coursework", percentage: 50 }
    ],
    courseYear: 2,
    semester: "Autumn",
    isOptional: false
  },
  {
    moduleCode: "ECM2410",
    moduleTitle: "Software Engineering",
    creditValue: 20,
    prerequisites: ["ECM1410"],
    summaryOfContents: "Software development lifecycle, requirements engineering, testing, project management.",
    intendedLearningOutcomes: [
      "Understand software development processes",
      "Apply software engineering principles",
      "Work effectively in teams"
    ],
    assessmentMethods: [
      { method: "Coursework", percentage: 100 }
    ],
    courseYear: 2,
    semester: "Spring",
    isOptional: false
  },
  {
    moduleCode: "ECM2420",
    moduleTitle: "Web Development",
    creditValue: 15,
    prerequisites: ["ECM1400"],
    summaryOfContents: "HTML, CSS, JavaScript, server-side programming, web frameworks.",
    intendedLearningOutcomes: [
      "Create dynamic web applications",
      "Understand client-server architecture",
      "Use modern web frameworks"
    ],
    assessmentMethods: [
      { method: "Coursework", percentage: 100 }
    ],
    courseYear: 2,
    semester: "Full Year",
    isOptional: true
  },
  {
    moduleCode: "ECM3400",
    moduleTitle: "Artificial Intelligence",
    creditValue: 20,
    prerequisites: ["ECM2400"],
    summaryOfContents: "AI algorithms, machine learning, neural networks, natural language processing.",
    intendedLearningOutcomes: [
      "Understand AI algorithms",
      "Implement machine learning models",
      "Apply AI to real problems"
    ],
    assessmentMethods: [
      { method: "Examination", percentage: 60 },
      { method: "Coursework", percentage: 40 }
    ],
    courseYear: 3,
    semester: "Autumn",
    isOptional: false
  },
  {
    moduleCode: "ECM3410",
    moduleTitle: "Computer Graphics",
    creditValue: 20,
    prerequisites: ["ECM1410"],
    summaryOfContents: "3D graphics, rendering algorithms, computer animation, graphics programming.",
    intendedLearningOutcomes: [
      "Understand 3D graphics principles",
      "Implement rendering algorithms",
      "Create interactive graphics applications"
    ],
    assessmentMethods: [
      { method: "Coursework", percentage: 100 }
    ],
    courseYear: 3,
    semester: "Spring",
    isOptional: true
  },
  {
    moduleCode: "ECM3420",
    moduleTitle: "Cybersecurity",
    creditValue: 15,
    prerequisites: ["ECM2400"],
    summaryOfContents: "Network security, cryptography, ethical hacking, security protocols.",
    intendedLearningOutcomes: [
      "Understand security threats",
      "Apply cryptographic techniques",
      "Implement security measures"
    ],
    assessmentMethods: [
      { method: "Examination", percentage: 50 },
      { method: "Coursework", percentage: 50 }
    ],
    courseYear: 3,
    semester: "Spring",
    isOptional: true
  }
];

async function loadSampleData() {
  try {
    console.log('Loading sample data...');
    
    // Clear existing data
    await Course.deleteMany({});
    await Module.deleteMany({});
    
    // Insert sample modules
    await Module.insertMany(sampleModules);
    console.log(`✅ Inserted ${sampleModules.length} sample modules`);
    
    // Insert sample courses
    await Course.insertMany(sampleCourses);
    console.log(`✅ Inserted ${sampleCourses.length} sample courses`);
    
    console.log('🎉 Sample data loaded successfully!');
  } catch (error) {
    console.error('❌ Error loading sample data:', error);
    throw error;
  }
}

module.exports = { loadSampleData, sampleCourses, sampleModules };

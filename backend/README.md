# Exeter Courses Backend

Backend API for scraping and serving University of Exeter course data.

## Features

- Web scraping of University of Exeter course and module data
- MongoDB storage for course and module information
- RESTful API for accessing course data
- Graph data endpoints for visualization
- Rate limiting and security middleware

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Make sure MongoDB is running locally or update the MONGODB_URI in .env

4. Run the scraper to populate the database:
```bash
npm run scrape
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Courses
- `GET /api/courses` - Get all courses (with optional search, degree, department filters)
- `GET /api/courses/:courseCode` - Get specific course with modules
- `GET /api/courses/:courseCode/graph` - Get course data formatted for graph visualization

### Modules
- `GET /api/modules` - Get all modules (with optional search, creditValue, year filters)
- `GET /api/modules/:moduleCode` - Get specific module with prerequisites and dependents
- `GET /api/modules/:moduleCode/prerequisites` - Get module prerequisite graph

### Health
- `GET /api/health` - Server health check

## Data Models

### Course
- courseName
- courseCode
- degree (BSc, BA, BEng, MSc, MA, MEng, PhD, MRes)
- department
- duration
- modules (core and optional)
- entryRequirements
- description
- url

### Module
- moduleCode
- moduleTitle
- creditValue
- prerequisites
- corequisites
- summaryOfContents
- intendedLearningOutcomes
- assessmentMethods
- courseYear
- semester
- isOptional

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run scrape` - Run the web scraper to update database

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
- Axios for HTTP requests
- Cheerio for HTML parsing
- Helmet for security
- CORS for cross-origin requests
- Rate limiting for API protection

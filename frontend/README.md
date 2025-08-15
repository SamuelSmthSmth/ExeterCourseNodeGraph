# Exeter Courses Frontend

React frontend application for visualizing University of Exeter course structures and module dependencies.

## Features

- Interactive node graph visualization using React Flow
- Course selection with search functionality
- Detailed module information sidebar
- Dynamic filtering - enable/disable modules to see pathway impact
- Responsive design for desktop and mobile
- Clean, minimalist UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (optional):
```bash
# Create .env file
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view in browser

## Components

### App.js
Main application component that manages global state and coordinates between components.

### CourseSelector.js
Dropdown component for searching and selecting courses with autocomplete functionality.

### NodeGraph.js
React Flow-based graph visualization component that displays courses and modules as interconnected nodes.

### Sidebar.js
Slide-out panel that displays detailed information about selected nodes and allows module toggling.

## Features

### Course Visualization
- Courses displayed as central nodes
- Modules displayed as connected nodes
- Different edge types for core/optional/prerequisite relationships

### Interactive Filtering
- Click modules to toggle them on/off
- See how disabling modules affects available pathways
- Visual feedback with opacity changes

### Detailed Information
- Click any node to see detailed information
- Module details include prerequisites, assessment methods, learning outcomes
- Course details include department, degree type, description

## Technologies

- React 18
- React Flow for graph visualization
- Axios for API communication
- CSS3 with custom styling
- Responsive design principles

## API Integration

The frontend consumes the following API endpoints:
- `GET /api/courses` - List all courses
- `GET /api/courses/:courseCode/graph` - Get course graph data
- `GET /api/modules/:moduleCode` - Get module details

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

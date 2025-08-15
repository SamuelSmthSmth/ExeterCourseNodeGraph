# University of Exeter Course Node Graph

A full-stack JavaScript application that scrapes and visualizes the University of Exeter's courses as an interactive node graph. The application allows users to explore course structures, module dependencies, and simulate academic pathways.

## 🎯 Features

### Backend
- **Web Scraping**: Automated scraping of University of Exeter course and module data
- **Data Storage**: MongoDB database for storing course structures and module details
- **REST API**: Express.js API for serving course data to the frontend
- **Graph Endpoints**: Specialized endpoints for graph visualization data

### Frontend
- **Interactive Visualization**: React Flow-based node graph showing courses and modules
- **Course Selection**: Searchable dropdown for selecting courses
- **Dynamic Filtering**: Enable/disable modules to see pathway impact
- **Detailed Information**: Sidebar with comprehensive module and course details
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or cloud instance)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SamuelSmthSmth/ExeterCourseNodeGraph.git
cd ExeterCourseNodeGraph
```

2. **Set up the backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
```

3. **Set up the frontend**
```bash
cd ../frontend
npm install
```

4. **Start MongoDB** (if running locally)
```bash
mongod
```

5. **Run the scraper** (first time only)
```bash
cd backend
npm run scrape
```

6. **Start the backend server**
```bash
npm run dev
```

7. **Start the frontend** (in a new terminal)
```bash
cd frontend
npm start
```

8. **Open the application**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Data Structure

### Course Model
- Course name and code
- Degree type (BSc, MSc, etc.)
- Department information
- Core and optional modules
- Prerequisites and dependencies

### Module Model
- Module code and title
- Credit values
- Prerequisites and corequisites
- Assessment methods
- Learning outcomes
- Content summaries

## 🗂️ Project Structure

```
ExeterCourseNodeGraph/
├── backend/
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # Express.js routes
│   │   ├── scrapers/       # Web scraping logic
│   │   ├── config/         # Database configuration
│   │   └── server.js       # Main server file
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   ├── styles/         # CSS styling
│   │   └── App.js          # Main React component
│   ├── public/
│   ├── package.json
│   └── README.md
└── README.md
```

## 🔧 API Endpoints

### Courses
- `GET /api/courses` - List all courses with filtering
- `GET /api/courses/:courseCode` - Get course details with modules
- `GET /api/courses/:courseCode/graph` - Get graph visualization data

### Modules  
- `GET /api/modules` - List all modules with filtering
- `GET /api/modules/:moduleCode` - Get module details
- `GET /api/modules/:moduleCode/prerequisites` - Get prerequisite graph

### Health
- `GET /api/health` - Server health check

## 🎨 User Interface

### Course Selection
- Searchable dropdown with course filtering
- Shows course name, degree type, and department
- Real-time search results

### Graph Visualization
- Course nodes (blue) connected to module nodes (green)
- Different edge types for core, optional, and prerequisite relationships
- Interactive zoom, pan, and selection
- Minimap for navigation

### Sidebar Information Panel
- Detailed course/module information
- Prerequisites and learning outcomes
- Assessment methods and credit values
- Module enable/disable functionality

### "What-If" Analysis
- Disable modules to simulate not taking them
- See impact on available future modules
- Visual feedback with opacity changes
- Explore different academic pathways

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Axios** - HTTP client for scraping
- **Cheerio** - HTML parsing
- **Helmet** - Security middleware
- **CORS** - Cross-origin requests

### Frontend
- **React 18** - UI framework
- **React Flow** - Graph visualization
- **Axios** - API communication
- **CSS3** - Styling
- **Create React App** - Build tooling

## 📝 Development

### Running the Scraper
The web scraper systematically crawls the University of Exeter website to extract:
- Course listings (undergraduate and postgraduate)
- Module information and relationships
- Prerequisites and dependencies
- Assessment methods and learning outcomes

```bash
cd backend
npm run scrape
```

### Development Mode
Both backend and frontend support hot reloading during development:

```bash
# Backend (with nodemon)
cd backend
npm run dev

# Frontend (with React dev server)
cd frontend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational purposes only. Please respect the University of Exeter's website and terms of service. The scraping functionality includes delays and rate limiting to be respectful of their servers.

## 🙏 Acknowledgments

- University of Exeter for providing comprehensive course information
- React Flow team for the excellent graph visualization library
- MongoDB team for the flexible database solution

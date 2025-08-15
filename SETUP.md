# Setup Guide

This guide will help you set up the University of Exeter Course Node Graph application.

## Prerequisites

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - You have two options:
   - **Local Installation**: [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - **Cloud Database**: [Create a free MongoDB Atlas account](https://www.mongodb.com/atlas/database)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies  
cd ../frontend
npm install
```

### 2. Set Up MongoDB

#### Option A: Local MongoDB
1. Install MongoDB Community Server
2. Start the MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a new cluster
3. Get your connection string
4. Update the `.env` file in the backend folder with your connection string

### 3. Configure Environment Variables

```bash
cd backend
cp .env.example .env
# Edit .env file with your MongoDB connection string if using Atlas
```

### 4. Load Sample Data

```bash
cd backend
node src/scrapers/loadSampleData.js
```

This will create sample course and module data for Mathematics and Computer Science degrees.

### 5. Start the Application

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 6. Access the Application

Open your browser and go to [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### MongoDB Connection Issues
- **Local MongoDB**: Make sure the MongoDB service is running
- **MongoDB Atlas**: Check your connection string and network access settings

### Port Conflicts
- Backend runs on port 5000
- Frontend runs on port 3000
- Make sure these ports are available

### Sample Data Not Loading
```bash
# Test MongoDB connection first
cd backend
node test-connection.js

# Then try loading sample data again
node src/scrapers/loadSampleData.js
```

## Using the Application

1. **Select a Course**: Use the dropdown to select "Mathematics BSc" or "Computer Science BSc"
2. **Explore the Graph**: Click on nodes to see detailed information
3. **Interactive Features**: 
   - Click on modules to view details in the sidebar
   - Use the "Disable Module" button to see how it affects pathways
   - Zoom and pan the graph to explore
4. **Prerequisites**: Red arrows show prerequisite relationships between modules

## Next Steps

- To scrape real University of Exeter data, run: `npm run scrape` (requires MongoDB)
- Customize the sample data in `backend/src/scrapers/sampleData.js`
- Add more courses and modules as needed

## Support

If you encounter issues:
1. Check that all services are running (MongoDB, backend server, frontend server)
2. Review the console logs for error messages
3. Ensure all dependencies are installed correctly

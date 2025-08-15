# Exeter Course Visualizer

## Overview
The Exeter Course Visualizer is a full-stack JavaScript application designed to scrape and visualize course data from the University of Exeter. The application features a backend built with Node.js that handles data scraping and management, and a frontend developed with React that provides an interactive visualization of the courses and their modules.

## Features
- **Data Scraping**: Automatically scrapes course information from the University of Exeter's website, including module titles, credit values, prerequisites, summaries, intended learning outcomes, and assessment methods.
- **Dynamic Visualization**: Displays course data in an interactive node graph, allowing users to explore courses and their relationships.
- **Detailed Information**: Users can click on nodes to view detailed information about courses and modules in a sidebar.
- **What-If Scenarios**: Users can enable or disable nodes to see how their academic choices impact future options.

## Project Structure
```
exeter-course-visualizer
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── models
│   │   ├── routes
│   │   ├── scraper
│   │   └── server.js
│   └── package.json
├── frontend
│   ├── public
│   ├── src
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- MongoDB (local or cloud instance)

### Backend Setup
1. Navigate to the `backend` directory:
   ```
   cd backend
   ```
2. Install the required dependencies:
   ```
   npm install
   ```
3. Start the backend server:
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```
2. Install the required dependencies:
   ```
   npm install
   ```
3. Start the frontend application:
   ```
   npm start
   ```

## Usage
- Access the frontend application in your browser at `http://localhost:3000`.
- Use the node graph to explore courses and modules. Click on any node to view detailed information in the sidebar.
- Experiment with enabling and disabling nodes to visualize different academic pathways.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
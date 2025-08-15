import React, { useState, useEffect } from 'react';
import CourseSelector from './components/CourseSelector';
import NodeGraph from './components/NodeGraph';
import Sidebar from './components/Sidebar';
import QuickActions from './components/QuickActions';
import { courseService } from './services/api';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationProvider, useNotifications } from './components/NotificationSystem';
import { SpinnerLoader, GraphSkeleton } from './components/LoadingStates';
import './styles/App.css';
import './styles/CourseSelector.css';

function AppContent() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { showSuccess, showError, showInfo } = useNotifications();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [disabledNodes, setDisabledNodes] = useState(new Set());
  const [appStats, setAppStats] = useState({
    totalCourses: 0,
    coursesLoaded: 0,
    graphsViewed: 0,
    lastActivity: null
  });

  // Load courses and stats on component mount
  useEffect(() => {
    loadCourses();
    loadAppStats();
  }, []);

  const loadAppStats = () => {
    const stats = JSON.parse(localStorage.getItem('appStats') || '{}');
    setAppStats(prev => ({ ...prev, ...stats }));
  };

  const updateAppStats = (updates) => {
    const newStats = { ...appStats, ...updates, lastActivity: new Date().toISOString() };
    setAppStats(newStats);
    localStorage.setItem('appStats', JSON.stringify(newStats));
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
      const coursesData = response || [];
      setCourses(coursesData);
      
      updateAppStats({ 
        totalCourses: coursesData.length,
        coursesLoaded: (appStats.coursesLoaded || 0) + 1 
      });
      
      if (coursesData.length > 0) {
        showSuccess(`Successfully loaded ${coursesData.length} courses!`, {
          duration: 3000
        });
      }
    } catch (error) {
      setError('Failed to load courses');
      showError('Unable to connect to the course database. Please check your connection and try again.', {
        action: {
          label: 'Retry',
          onClick: loadCourses
        }
      });
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (courseCode) => {
    try {
      setLoading(true);
      setError(null);
      
      showInfo(`Loading course data for ${courseCode}...`);
      
      const response = await courseService.getCourseGraph(courseCode);
      setSelectedCourse(response.course);
      setGraphData({
        nodes: response.nodes || [],
        edges: response.edges || []
      });
      setDisabledNodes(new Set());
      setSelectedNode(null);
      setSidebarOpen(false);
      
      updateAppStats({ 
        graphsViewed: (appStats.graphsViewed || 0) + 1 
      });
      
      showSuccess(`Loaded ${response.course.courseName} successfully!`, {
        duration: 2000
      });
    } catch (error) {
      setError('Failed to load course data');
      showError(`Failed to load course ${courseCode}. Please try again.`, {
        action: {
          label: 'Retry',
          onClick: () => handleCourseSelect(courseCode)
        }
      });
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setSidebarOpen(true);
  };

  const handleNodeToggle = (nodeId) => {
    const newDisabledNodes = new Set(disabledNodes);
    if (newDisabledNodes.has(nodeId)) {
      newDisabledNodes.delete(nodeId);
    } else {
      newDisabledNodes.add(nodeId);
    }
    setDisabledNodes(newDisabledNodes);
  };

  const handleRandomCourse = () => {
    if (courses.length > 0) {
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      handleCourseSelect(randomCourse.courseCode);
      showInfo(`Loading random course: ${randomCourse.courseName}`);
    }
  };

  const handleClearGraph = () => {
    setSelectedCourse(null);
    setGraphData({ nodes: [], edges: [] });
    setSelectedNode(null);
    setSidebarOpen(false);
    setDisabledNodes(new Set());
    showInfo('Graph cleared');
  };

  const handleZoomFit = () => {
    // This would trigger zoom-to-fit in ReactFlow
    showInfo('Fitting graph to view');
  };

  const handleToggleAnimations = (enabled) => {
    updateAppStats({ animationsEnabled: enabled });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedNode(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>University of Exeter Course Explorer</h1>
          <div className="header-stats">
            <span className="stat-item">
              📚 {appStats.totalCourses} courses
            </span>
            <span className="stat-item">
              👁️ {appStats.graphsViewed} views
            </span>
          </div>
        </div>
        
        <div className="header-controls">
          <CourseSelector
            courses={courses}
            selectedCourse={selectedCourse}
            onCourseSelect={handleCourseSelect}
            loading={loading}
          />
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? '☀️' : '🌙'} {isDarkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="graph-container">
          {loading ? (
            <div className="loading-container">
              <GraphSkeleton />
              <SpinnerLoader size="large" text="Loading course visualization..." />
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button className="retry-button" onClick={loadCourses}>
                Try Again
              </button>
            </div>
          ) : (
            <NodeGraph
              nodes={graphData.nodes}
              edges={graphData.edges}
              onNodeClick={handleNodeClick}
              disabledNodes={disabledNodes}
            />
          )}
        </div>

        <Sidebar
          isOpen={sidebarOpen}
          selectedNode={selectedNode}
          onClose={closeSidebar}
          onNodeToggle={handleNodeToggle}
          disabledNodes={disabledNodes}
          graphData={graphData}
          selectedCourse={selectedCourse}
        />

        <QuickActions
          selectedCourse={selectedCourse}
          graphData={graphData}
          onClearGraph={handleClearGraph}
          onRandomCourse={handleRandomCourse}
          onZoomFit={handleZoomFit}
          onToggleAnimations={handleToggleAnimations}
        />
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;

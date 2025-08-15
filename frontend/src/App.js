import React, { useState, useEffect } from 'react';
import CourseSelector from './components/CourseSelector';
import NodeGraph from './components/NodeGraph';
import Sidebar from './components/Sidebar';
import { courseService } from './services/api';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './styles/App.css';

function AppContent() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [disabledNodes, setDisabledNodes] = useState(new Set());

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
      setCourses(response.data || []);
    } catch (error) {
      setError('Failed to load courses');
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (courseCode) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await courseService.getCourseGraph(courseCode);
      setSelectedCourse(response.data.course);
      setGraphData({
        nodes: response.data.nodes || [],
        edges: response.data.edges || []
      });
      setDisabledNodes(new Set());
      setSelectedNode(null);
      setSidebarOpen(false);
    } catch (error) {
      setError('Failed to load course data');
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

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedNode(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>University of Exeter Course Explorer</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="graph-container">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading course data...</p>
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
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

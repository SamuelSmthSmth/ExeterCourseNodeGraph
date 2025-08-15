import React, { useState, useEffect, useCallback } from 'react';
import NodeGraph from './components/NodeGraph';
import { courseService } from './services/api';

// Enhanced Imports
import { EnhancedProviders, useTheme, useSettings, useKeyboardShortcuts, useCommandPalette, useAnalytics, usePerformance } from './contexts/EnhancedContexts';
import { EnhancedNotificationProvider, useNotifications } from './components/EnhancedNotificationSystem';
import { EnhancedCourseSelector, EnhancedQuickActions, ModernButton } from './components/EnhancedComponents';
import EnhancedSidebar from './components/EnhancedSidebar';
import { CommandPalette, SettingsPanel } from './components/EnhancedDialogs';
import { LoadingStateProvider, useLoadingState, SkeletonLoader, ProgressLoader, GraphSkeleton } from './components/EnhancedLoadingStates';

// Enhanced Styles
import './styles/EnhancedGlobal.css';
import './styles/ModernApp.css';
import './styles/App.css';
import './styles/CourseSelector.css';
import './styles/ObsidianGraph.css';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSetting } = useSettings();
  const { showSuccess, showError, showInfo, showWarning } = useNotifications();
  const { registerCommand, unregisterCommand } = useCommandPalette();
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const { track } = useAnalytics();
  const { startMonitoring, stopMonitoring, metrics } = usePerformance();
  const { setLoading: setGlobalLoading } = useLoadingState();
  
  // Core State
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Enhanced State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(settings.animations);
  const [physicsEnabled, setPhysicsEnabled] = useState(settings.physics);
  const [appStats, setAppStats] = useState({
    totalCourses: 0,
    coursesLoaded: 0,
    graphsViewed: 0,
    lastActivity: null,
    sessionStartTime: Date.now()
  });

  // Helper Functions
  const loadAppStats = () => {
    const stats = JSON.parse(localStorage.getItem('appStats') || '{}');
    setAppStats(prev => ({ ...prev, ...stats }));
  };

  const updateAppStats = (updates) => {
    const newStats = { ...appStats, ...updates, lastActivity: new Date().toISOString() };
    setAppStats(newStats);
    localStorage.setItem('appStats', JSON.stringify(newStats));
  };

  // Core Functions
  const loadCourses = async () => {
    try {
      setLoading(true);
      setGlobalLoading(true);
      setError(null);
      
      track('courses_load_started');
      
      const data = await courseService.getCourses();
      setCourses(data);
      
      updateAppStats({ 
        totalCourses: data.length,
        coursesLoaded: appStats.coursesLoaded + 1 
      });
      
      showSuccess(`Loaded ${data.length} courses successfully!`, {
        title: 'Courses Loaded',
        duration: 3000
      });
      
      track('courses_loaded', { count: data.length });
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError(err.message);
      showError('Failed to load courses. Please check your connection and try again.', {
        title: 'Loading Error',
        duration: 5000
      });
      track('courses_load_error', { error: err.message });
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleCourseSelect = async (courseCode) => {
    if (!courseCode) return;
    
    try {
      setLoading(true);
      setGlobalLoading(true);
      setError(null);
      
      track('course_selected', { courseCode });
      
      const course = courses.find(c => c.courseCode === courseCode);
      setSelectedCourse(course);
      
      showInfo(`Loading graph for ${course?.courseName || courseCode}...`, {
        title: 'Loading Graph',
        duration: 2000
      });
      
      const data = await courseService.getCourseGraph(courseCode);
      setGraphData(data);
      
      updateAppStats({ 
        graphsViewed: appStats.graphsViewed + 1 
      });
      
      showSuccess(`Loaded graph with ${data.nodes?.length || 0} modules and ${data.edges?.length || 0} connections`, {
        title: 'Graph Loaded',
        duration: 3000
      });
      
      track('graph_loaded', { 
        courseCode, 
        nodeCount: data.nodes?.length || 0,
        edgeCount: data.edges?.length || 0 
      });
    } catch (err) {
      console.error('Failed to load course graph:', err);
      setError(err.message);
      showError(`Failed to load graph for ${courseCode}. Please try again.`, {
        title: 'Graph Loading Error',
        duration: 5000
      });
      track('graph_load_error', { courseCode, error: err.message });
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    setSidebarOpen(true);
    track('node_clicked', { nodeId: node.id, moduleCode: node.moduleCode });
  }, [track]);

  const handleRandomCourse = useCallback(() => {
    if (courses.length === 0) {
      showWarning('No courses available for random selection');
      return;
    }
    
    const randomCourse = courses[Math.floor(Math.random() * courses.length)];
    handleCourseSelect(randomCourse.courseCode);
    track('random_course_selected', { courseCode: randomCourse.courseCode });
  }, [courses, showWarning, track]);

  const toggleAnimations = useCallback(() => {
    const newValue = !animationsEnabled;
    setAnimationsEnabled(newValue);
    updateSetting('animations', newValue);
    showInfo(`Animations ${newValue ? 'enabled' : 'disabled'}`);
    track('animations_toggled', { enabled: newValue });
  }, [animationsEnabled, updateSetting, showInfo, track]);

  const togglePhysics = useCallback(() => {
    const newValue = !physicsEnabled;
    setPhysicsEnabled(newValue);
    updateSetting('physics', newValue);
    showInfo(`Physics ${newValue ? 'enabled' : 'disabled'}`);
    track('physics_toggled', { enabled: newValue });
  }, [physicsEnabled, updateSetting, showInfo, track]);

  const handleZoomFit = useCallback(() => {
    // This would trigger zoom to fit in the graph component
    track('zoom_fit_triggered');
    showSuccess('Zoomed to fit all nodes');
  }, [track, showSuccess]);

  const handleExportGraph = useCallback(() => {
    // This would trigger export functionality
    track('graph_export_initiated');
    showInfo('Graph export feature coming soon!');
  }, [track, showInfo]);

  const handleClearGraph = useCallback(() => {
    setGraphData({ nodes: [], edges: [] });
    setSelectedCourse(null);
    setSelectedNode(null);
    setSidebarOpen(false);
    track('graph_cleared');
    showInfo('Graph cleared');
  }, [track, showInfo]);

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedNode(null);
  };

  const handleNavigateToNode = (node) => {
    setSelectedNode(node);
    track('node_navigated', { nodeId: node.id });
  };

  // Enhanced Effects
  
  // Register keyboard shortcuts
  useEffect(() => {
    registerShortcut('ctrl+k', () => {
      track('shortcut_used', { shortcut: 'command_palette' });
    }, 'Open command palette');
    
    registerShortcut('ctrl+,', () => {
      setSettingsOpen(true);
      track('shortcut_used', { shortcut: 'settings' });
    }, 'Open settings');
    
    registerShortcut('space', () => {
      setPhysicsEnabled(!physicsEnabled);
      track('shortcut_used', { shortcut: 'toggle_physics' });
    }, 'Toggle physics');
    
    registerShortcut('r', () => {
      handleRandomCourse();
      track('shortcut_used', { shortcut: 'random_course' });
    }, 'Random course');
    
    registerShortcut('f', () => {
      handleZoomFit();
      track('shortcut_used', { shortcut: 'zoom_fit' });
    }, 'Zoom to fit');
    
    registerShortcut('escape', () => {
      setSidebarOpen(false);
      setSettingsOpen(false);
      track('shortcut_used', { shortcut: 'close_panels' });
    }, 'Close panels');

    return () => {
      unregisterShortcut('ctrl+k');
      unregisterShortcut('ctrl+,');
      unregisterShortcut('space');
      unregisterShortcut('r');
      unregisterShortcut('f');
      unregisterShortcut('escape');
    };
  }, [registerShortcut, unregisterShortcut, physicsEnabled, track, handleRandomCourse, handleZoomFit]);

  // Register commands
  useEffect(() => {
    registerCommand('toggle-theme', {
      name: 'Toggle Theme',
      description: 'Switch between light and dark theme',
      icon: '🌙',
      keywords: ['theme', 'dark', 'light'],
      action: () => {
        toggleTheme();
        track('command_executed', { command: 'toggle_theme' });
      }
    });

    registerCommand('random-course', {
      name: 'Random Course',
      description: 'Select a random course to explore',
      icon: '🎲',
      keywords: ['random', 'course', 'explore'],
      action: handleRandomCourse
    });

    registerCommand('clear-graph', {
      name: 'Clear Graph',
      description: 'Clear the current graph',
      icon: '🧹',
      keywords: ['clear', 'reset', 'graph'],
      action: handleClearGraph
    });

    registerCommand('open-settings', {
      name: 'Open Settings',
      description: 'Open application settings',
      icon: '⚙️',
      shortcut: 'Ctrl+,',
      keywords: ['settings', 'preferences', 'config'],
      action: () => setSettingsOpen(true)
    });

    return () => {
      unregisterCommand('toggle-theme');
      unregisterCommand('random-course');
      unregisterCommand('clear-graph');
      unregisterCommand('open-settings');
    };
  }, [registerCommand, unregisterCommand, toggleTheme, track, handleRandomCourse, handleClearGraph]);

  // Sync settings with state
  useEffect(() => {
    setAnimationsEnabled(settings.animations);
    setPhysicsEnabled(settings.physics);
  }, [settings]);

  // Load courses and stats on component mount
  useEffect(() => {
    loadCourses();
    loadAppStats();
    startMonitoring();
    
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  return (
    <div className="app modern-app" data-theme={theme}>
      {/* Performance Monitor (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: 'var(--space-4)',
          left: 'var(--space-4)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: 'var(--space-2)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem',
          zIndex: 10001,
          fontFamily: 'monospace'
        }}>
          FPS: {metrics.fps} | Memory: {metrics.memory}MB | Nodes: {graphData.nodes.length}
        </div>
      )}

      {/* Enhanced Header */}
      <header className="app-header modern-header">
        <div className="header-content">
          <div className="brand-section">
            <h1 className="app-title">
              <span className="title-icon">🎓</span>
              University of Exeter
              <span className="title-subtitle">Course Explorer</span>
            </h1>
            
            {/* Live Stats */}
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-icon">📚</span>
                <span className="stat-value">{appStats.totalCourses}</span>
                <span className="stat-label">courses</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🔍</span>
                <span className="stat-value">{appStats.graphsViewed}</span>
                <span className="stat-label">explored</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⚡</span>
                <span className="stat-value">{metrics.fps}</span>
                <span className="stat-label">fps</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Controls */}
          <div className="header-controls">
            <EnhancedCourseSelector
              courses={courses}
              selectedCourse={selectedCourse}
              onCourseSelect={handleCourseSelect}
              loading={loading}
              placeholder="Search and select a course..."
              showRecent={true}
              showFavorites={true}
            />
            
            <div className="control-group">
              <ModernButton
                variant="ghost"
                size="md"
                onClick={toggleTheme}
                icon={theme === 'dark' ? '☀️' : '🌙'}
              >
                {theme === 'dark' ? 'Light' : 'Dark'}
              </ModernButton>
              
              <ModernButton
                variant="outline"
                size="md"
                onClick={() => setSettingsOpen(true)}
                icon="⚙️"
              >
                Settings
              </ModernButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Progress Indicator */}
        {loading && (
          <div className="loading-overlay">
            <ProgressLoader 
              progress={75} 
              text="Loading course visualization..." 
              showPercentage={true}
            />
          </div>
        )}

        {/* Graph Container */}
        <div className="graph-container">
          {error ? (
            <div className="error-container modern-error">
              <div className="error-content">
                <div className="error-icon">⚠️</div>
                <h3 className="error-title">Oops! Something went wrong</h3>
                <p className="error-message">{error}</p>
                <div className="error-actions">
                  <ModernButton
                    variant="primary"
                    onClick={loadCourses}
                    icon="🔄"
                  >
                    Try Again
                  </ModernButton>
                  <ModernButton
                    variant="ghost"
                    onClick={() => setError(null)}
                  >
                    Dismiss
                  </ModernButton>
                </div>
              </div>
            </div>
          ) : graphData.nodes.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-content">
                <div className="empty-icon">🎯</div>
                <h3 className="empty-title">Ready to explore?</h3>
                <p className="empty-message">
                  Select a course from the dropdown above to visualize its module relationships and dependencies.
                </p>
                <ModernButton
                  variant="primary"
                  onClick={handleRandomCourse}
                  icon="🎲"
                  disabled={courses.length === 0}
                >
                  Explore Random Course
                </ModernButton>
              </div>
            </div>
          ) : (
            <NodeGraph
              nodes={graphData.nodes}
              edges={graphData.edges}
              onNodeClick={handleNodeClick}
              animationsEnabled={animationsEnabled}
              physicsEnabled={physicsEnabled}
            />
          )}
        </div>

        {/* Enhanced Sidebar */}
        <EnhancedSidebar
          selectedNode={selectedNode}
          onClose={closeSidebar}
          graphData={graphData}
          onNavigateToNode={handleNavigateToNode}
          isVisible={sidebarOpen}
        />

        {/* Enhanced Quick Actions */}
        <EnhancedQuickActions
          graphData={graphData}
          selectedCourse={selectedCourse}
          onRandomCourse={handleRandomCourse}
          onClearGraph={handleClearGraph}
          onZoomFit={handleZoomFit}
          onToggleAnimations={toggleAnimations}
          onExportGraph={handleExportGraph}
          onTogglePhysics={togglePhysics}
          animationsEnabled={animationsEnabled}
          physicsEnabled={physicsEnabled}
        />
      </main>

      {/* Enhanced Dialogs */}
      <CommandPalette />
      <SettingsPanel 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <EnhancedProviders>
      <LoadingStateProvider>
        <EnhancedNotificationProvider>
          <AppContent />
        </EnhancedNotificationProvider>
      </LoadingStateProvider>
    </EnhancedProviders>
  );
}

export default App;

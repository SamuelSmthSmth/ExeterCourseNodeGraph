import React, { useState, useEffect, useCallback, useRef } from 'react';
import NodeGraph from './components/NodeGraph';
import { courseService } from './services/api';

// Enhanced Imports
import {
  EnhancedProviders,
  useTheme,
  useSettings,
  useKeyboardShortcuts,
  useCommandPalette,
  useAnalytics,
  usePerformance,
  useNotifications
} from './contexts/EnhancedContexts';
import { EnhancedLoadingStates } from './components/EnhancedLoadingStates';
import {
  ModernButton,
  EnhancedCourseSelector,
  EnhancedQuickActions
} from './components/EnhancedComponents';
import { EnhancedSidebar } from './components/EnhancedSidebar';
import { CommandPalette, SettingsPanel } from './components/EnhancedDialogs';
import { GraphMinimap, AdvancedSearchPanel } from './components/AdvancedFeatures';
import { LearningPathBuilder, AIRecommendations } from './components/IntelligentFeatures';
import { ProgressDashboard, NetworkVisualization } from './components/DataVisualization';

// Enhanced Styles
import './styles/EnhancedGlobal.css';
import './styles/ModernApp.css';
import './styles/UltimateFeatures.css';
import './styles/App.css';
import './styles/CourseSelector.css';
import './styles/ObsidianGraph.css';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSetting } = useSettings();
  const { showSuccess, showError, showInfo, showWarning } = useNotifications();
  const { registerCommand, unregisterCommand } = useCommandPalette();
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const { trackEvent } = useAnalytics();
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
  const [currentView, setCurrentView] = useState('graph'); // 'graph', 'progress', 'network', 'ai'
  
  // New Feature States
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [learningPathOpen, setLearningPathOpen] = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [learningPaths, setLearningPaths] = useState([]);
  const [userProgress, setUserProgress] = useState({
    completedCourses: [],
    currentCourses: [],
    plannedCourses: [],
    totalCredits: 0,
    targetCredits: 120,
    gpa: 3.42,
    streakDays: 7
  });
  
  // Graph viewport for minimap
  const [viewportBounds, setViewportBounds] = useState({
    x: 0, y: 0, width: 800, height: 600
  });
  const [graphBounds, setGraphBounds] = useState({
    x: -1000, y: -1000, width: 2000, height: 2000
  });

  const [appStats, setAppStats] = useState({
    totalCourses: 0,
    coursesLoaded: 0,
    graphsViewed: 0,
    lastActivity: null,
    sessionStartTime: Date.now()
  });

  // Performance monitoring
  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  // Track app statistics
  useEffect(() => {
    setAppStats(prev => ({
      ...prev,
      totalCourses: courses.length,
      lastActivity: Date.now()
    }));
  }, [courses]);

  // Load initial data
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setGlobalLoading(true);
        
        const coursesData = await courseService.getAllCourses();
        setCourses(coursesData);
        
        setAppStats(prev => ({
          ...prev,
          coursesLoaded: coursesData.length
        }));
        
        showSuccess(`Loaded ${coursesData.length} courses successfully!`);
        trackEvent('courses_loaded', { count: coursesData.length });
        
      } catch (error) {
        console.error('Error loading courses:', error);
        setError(error.message);
        showError('Failed to load courses. Please try again.');
        trackEvent('courses_load_error', { error: error.message });
      } finally {
        setLoading(false);
        setGlobalLoading(false);
      }
    };

    loadCourses();
  }, [setGlobalLoading, showSuccess, showError, trackEvent]);

  // Load graph data when course is selected
  useEffect(() => {
    const loadGraphData = async () => {
      if (!selectedCourse) {
        setGraphData({ nodes: [], edges: [] });
        return;
      }

      try {
        setLoading(true);
        setGlobalLoading(true);
        
        const data = await courseService.getCourseGraph(selectedCourse.id);
        setGraphData(data);
        
        setAppStats(prev => ({
          ...prev,
          graphsViewed: prev.graphsViewed + 1
        }));
        
        trackEvent('graph_loaded', { 
          courseId: selectedCourse.id, 
          nodeCount: data.nodes.length,
          edgeCount: data.edges.length 
        });
        
      } catch (error) {
        console.error('Error loading graph data:', error);
        setError(error.message);
        showError('Failed to load course dependencies.');
        trackEvent('graph_load_error', { 
          courseId: selectedCourse.id, 
          error: error.message 
        });
      } finally {
        setLoading(false);
        setGlobalLoading(false);
      }
    };

    loadGraphData();
  }, [selectedCourse, setGlobalLoading, showError, trackEvent]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const shortcuts = [
      {
        key: 'Escape',
        action: () => {
          if (settingsOpen) setSettingsOpen(false);
          else if (advancedSearchOpen) setAdvancedSearchOpen(false);
          else if (learningPathOpen) setLearningPathOpen(false);
          else if (sidebarOpen) setSidebarOpen(false);
          else setSelectedNode(null);
        },
        description: 'Close dialogs or clear selection'
      },
      {
        key: 's',
        ctrl: true,
        action: () => setAdvancedSearchOpen(true),
        description: 'Open advanced search'
      },
      {
        key: 'p',
        ctrl: true,
        action: () => setLearningPathOpen(true),
        description: 'Open learning path builder'
      },
      {
        key: '1',
        action: () => setCurrentView('graph'),
        description: 'Switch to graph view'
      },
      {
        key: '2',
        action: () => setCurrentView('progress'),
        description: 'Switch to progress view'
      },
      {
        key: '3',
        action: () => setCurrentView('network'),
        description: 'Switch to network view'
      },
      {
        key: '4',
        action: () => setCurrentView('ai'),
        description: 'Switch to AI recommendations'
      },
      {
        key: 'i',
        action: () => setSidebarOpen(!sidebarOpen),
        description: 'Toggle sidebar'
      },
      {
        key: 't',
        action: () => {
          toggleTheme();
          showInfo(`Switched to ${theme === 'dark' ? 'light' : 'dark'} theme`);
        },
        description: 'Toggle theme'
      }
    ];

    shortcuts.forEach(shortcut => registerShortcut(shortcut));
    
    return () => {
      shortcuts.forEach(shortcut => unregisterShortcut(shortcut.key));
    };
  }, [
    registerShortcut, 
    unregisterShortcut, 
    settingsOpen, 
    advancedSearchOpen,
    learningPathOpen,
    sidebarOpen, 
    toggleTheme, 
    theme, 
    showInfo
  ]);

  // Enhanced command palette commands
  useEffect(() => {
    const commands = [
      {
        id: 'open-search',
        label: 'Open Advanced Search',
        action: () => setAdvancedSearchOpen(true),
        keywords: ['search', 'find', 'filter']
      },
      {
        id: 'create-path',
        label: 'Create Learning Path',
        action: () => setLearningPathOpen(true),
        keywords: ['path', 'learning', 'plan', 'curriculum']
      },
      {
        id: 'view-graph',
        label: 'Switch to Graph View',
        action: () => setCurrentView('graph'),
        keywords: ['graph', 'network', 'visualization']
      },
      {
        id: 'view-progress',
        label: 'Switch to Progress Dashboard',
        action: () => setCurrentView('progress'),
        keywords: ['progress', 'dashboard', 'stats', 'analytics']
      },
      {
        id: 'view-network',
        label: 'Switch to Network Visualization',
        action: () => setCurrentView('network'),
        keywords: ['network', 'interactive', 'physics']
      },
      {
        id: 'view-ai',
        label: 'Switch to AI Recommendations',
        action: () => setCurrentView('ai'),
        keywords: ['ai', 'recommendations', 'suggestions', 'machine learning']
      },
      {
        id: 'toggle-sidebar',
        label: 'Toggle Sidebar',
        action: () => setSidebarOpen(!sidebarOpen),
        keywords: ['sidebar', 'panel', 'details']
      },
      {
        id: 'clear-selection',
        label: 'Clear Selection',
        action: () => {
          setSelectedNode(null);
          setHighlightedNodes(new Set());
        },
        keywords: ['clear', 'deselect', 'reset']
      },
      {
        id: 'reset-viewport',
        label: 'Reset Viewport',
        action: () => {
          setViewportBounds({ x: 0, y: 0, width: 800, height: 600 });
          showInfo('Viewport reset to center');
        },
        keywords: ['reset', 'center', 'viewport', 'zoom']
      }
    ];

    commands.forEach(command => registerCommand(command));
    
    return () => {
      commands.forEach(command => unregisterCommand(command.id));
    };
  }, [
    registerCommand, 
    unregisterCommand, 
    sidebarOpen, 
    showInfo
  ]);

  // Handle course selection
  const handleCourseSelect = useCallback((course) => {
    setSelectedCourse(course);
    setSelectedNode(null);
    setHighlightedNodes(new Set());
    trackEvent('course_selected', { courseId: course.id, courseName: course.name });
  }, [trackEvent]);

  // Handle node selection
  const handleNodeSelect = useCallback((node) => {
    setSelectedNode(node);
    setSidebarOpen(true);
    trackEvent('node_selected', { nodeId: node.id, nodeType: node.type });
  }, [trackEvent]);

  // Handle learning path creation
  const handlePathCreated = useCallback((path) => {
    setLearningPaths(prev => [...prev, path]);
    showSuccess(`Learning path "${path.name}" created successfully!`);
    trackEvent('learning_path_created', { 
      pathId: path.id, 
      moduleCount: path.modules.length,
      totalCredits: path.modules.reduce((sum, mod) => sum + (mod.credits || 0), 0)
    });
  }, [showSuccess, trackEvent]);

  // Handle viewport changes for minimap
  const handleViewportChange = useCallback((newViewport) => {
    setViewportBounds(newViewport);
  }, []);

  // Render main content based on current view
  const renderMainContent = () => {
    if (loading && currentView === 'graph') {
      return <EnhancedLoadingStates.GraphSkeleton />;
    }

    switch (currentView) {
      case 'progress':
        return (
          <ProgressDashboard
            userProgress={userProgress}
            courses={courses}
            learningPaths={learningPaths}
            goals={[]}
          />
        );
      
      case 'network':
        return (
          <NetworkVisualization
            graphData={graphData}
            selectedNode={selectedNode}
            onNodeSelect={handleNodeSelect}
            highlightedNodes={highlightedNodes}
          />
        );
      
      case 'ai':
        return (
          <AIRecommendations
            userProfile={{}}
            completedCourses={userProgress.completedCourses}
            currentCourses={userProgress.currentCourses}
            graphData={graphData}
            onCourseSelect={(course) => {
              // Convert course recommendation to node selection
              const node = graphData.nodes.find(n => n.id === course.id);
              if (node) handleNodeSelect(node);
            }}
          />
        );
      
      case 'graph':
      default:
        return (
          <div className="graph-container">
            {selectedCourse ? (
              <>
                <NodeGraph
                  graphData={graphData}
                  onNodeSelect={handleNodeSelect}
                  selectedNode={selectedNode}
                  animationsEnabled={animationsEnabled}
                  physicsEnabled={physicsEnabled}
                  highlightedNodes={highlightedNodes}
                  onViewportChange={handleViewportChange}
                />
                
                {/* Graph Minimap */}
                <GraphMinimap
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  viewportBounds={viewportBounds}
                  graphBounds={graphBounds}
                  onViewportChange={handleViewportChange}
                  selectedNode={selectedNode}
                />
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-content">
                  <div className="empty-state-icon">🎓</div>
                  <h2>Welcome to Course Navigator</h2>
                  <p>Select a course to visualize its dependencies and explore learning paths</p>
                  <ModernButton
                    variant="primary"
                    size="large"
                    onClick={() => setAdvancedSearchOpen(true)}
                  >
                    🔍 Find Courses
                  </ModernButton>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`app ${theme}`}>
      {/* Enhanced Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">
              <span className="title-icon">🎓</span>
              Course Navigator
              <span className="title-beta">ULTIMATE</span>
            </h1>
            <div className="header-stats">
              <span className="stat-item">
                📚 {courses.length} courses
              </span>
              <span className="stat-item">
                🎯 {graphData.nodes.length} modules
              </span>
              <span className="stat-item">
                ⚡ {metrics?.fps || 60}fps
              </span>
            </div>
          </div>

          <div className="header-center">
            <div className="view-switcher">
              <button
                className={`view-button ${currentView === 'graph' ? 'active' : ''}`}
                onClick={() => setCurrentView('graph')}
                title="Graph View (1)"
              >
                🌐 Graph
              </button>
              <button
                className={`view-button ${currentView === 'progress' ? 'active' : ''}`}
                onClick={() => setCurrentView('progress')}
                title="Progress Dashboard (2)"
              >
                📊 Progress
              </button>
              <button
                className={`view-button ${currentView === 'network' ? 'active' : ''}`}
                onClick={() => setCurrentView('network')}
                title="Network View (3)"
              >
                🕸️ Network
              </button>
              <button
                className={`view-button ${currentView === 'ai' ? 'active' : ''}`}
                onClick={() => setCurrentView('ai')}
                title="AI Recommendations (4)"
              >
                🤖 AI
              </button>
            </div>
          </div>

          <div className="header-right">
            <EnhancedQuickActions
              selectedCourse={selectedCourse}
              selectedNode={selectedNode}
              onOpenSearch={() => setAdvancedSearchOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
              onCreatePath={() => setLearningPathOpen(true)}
            />
            
            <ModernButton
              variant="ghost"
              size="small"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={`${sidebarOpen ? 'Close' : 'Open'} sidebar (I)`}
            >
              <span className={`sidebar-toggle-icon ${sidebarOpen ? 'open' : ''}`}>
                📋
              </span>
            </ModernButton>
            
            <ModernButton
              variant="ghost"
              size="small"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme (T)`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </ModernButton>
          </div>
        </div>

        {/* Course Selector */}
        <div className="course-selector-container">
          <EnhancedCourseSelector
            courses={courses}
            selectedCourse={selectedCourse}
            onCourseSelect={handleCourseSelect}
            loading={loading}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        <div className="main-content">
          {renderMainContent()}
        </div>

        {/* Enhanced Sidebar */}
        <EnhancedSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          selectedNode={selectedNode}
          graphData={graphData}
          selectedCourse={selectedCourse}
          courses={courses}
          onNodeSelect={handleNodeSelect}
          userProgress={userProgress}
          learningPaths={learningPaths}
        />
      </main>

      {/* Enhanced Dialogs */}
      <CommandPalette />
      
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        appStats={appStats}
        performanceMetrics={metrics}
      />

      <AdvancedSearchPanel
        isOpen={advancedSearchOpen}
        onClose={() => setAdvancedSearchOpen(false)}
        courses={courses}
        graphData={graphData}
        onFilterChange={() => {}}
        onHighlightNodes={setHighlightedNodes}
      />

      <LearningPathBuilder
        isOpen={learningPathOpen}
        onClose={() => setLearningPathOpen(false)}
        courses={courses}
        graphData={graphData}
        onPathCreated={handlePathCreated}
        existingPaths={learningPaths}
      />

      {/* Loading States */}
      <EnhancedLoadingStates />
    </div>
  );
}

// Main App Component with Enhanced Providers
function App() {
  return (
    <EnhancedProviders>
      <AppContent />
    </EnhancedProviders>
  );
}

export default App;

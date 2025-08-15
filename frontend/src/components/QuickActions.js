import React, { useState } from 'react';
import ModernButton from './ModernButton';
import { useNotifications } from './NotificationSystem';
import './QuickActions.css';

const QuickActions = ({ 
  selectedCourse, 
  graphData, 
  onClearGraph, 
  onRandomCourse,
  onExportGraph,
  onZoomFit,
  onToggleAnimations 
}) => {
  const { showSuccess, showInfo } = useNotifications();
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const handleExportGraph = () => {
    if (!selectedCourse || !graphData.nodes.length) {
      showInfo('Please select a course first to export the graph');
      return;
    }
    
    // Create export data
    const exportData = {
      course: selectedCourse,
      nodes: graphData.nodes,
      edges: graphData.edges,
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0'
    };
    
    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCourse.courseCode}-graph.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Graph exported successfully!');
    onExportGraph?.();
  };

  const handleToggleAnimations = () => {
    const newState = !animationsEnabled;
    setAnimationsEnabled(newState);
    document.documentElement.style.setProperty(
      '--animation-speed', 
      newState ? '1' : '0'
    );
    onToggleAnimations?.(newState);
    showInfo(`Animations ${newState ? 'enabled' : 'disabled'}`);
  };

  const actions = [
    {
      icon: '🎯',
      label: 'Fit to View',
      onClick: onZoomFit,
      disabled: !graphData.nodes.length,
      tooltip: 'Center and fit all nodes in view'
    },
    {
      icon: '🎲',
      label: 'Random Course',
      onClick: onRandomCourse,
      tooltip: 'Load a random course'
    },
    {
      icon: '🗑️',
      label: 'Clear',
      onClick: onClearGraph,
      disabled: !selectedCourse,
      variant: 'danger',
      tooltip: 'Clear current course'
    },
    {
      icon: '💾',
      label: 'Export',
      onClick: handleExportGraph,
      disabled: !selectedCourse,
      variant: 'success',
      tooltip: 'Export graph as JSON'
    },
    {
      icon: animationsEnabled ? '⏸️' : '▶️',
      label: animationsEnabled ? 'Pause Animations' : 'Enable Animations',
      onClick: handleToggleAnimations,
      variant: 'ghost',
      tooltip: 'Toggle graph animations'
    }
  ];

  return (
    <div className={`quick-actions ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="quick-actions-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Collapse actions' : 'Expand actions'}
      >
        <span className={`toggle-icon ${isExpanded ? 'rotated' : ''}`}>⚡</span>
      </button>
      
      <div className="quick-actions-panel">
        <div className="actions-grid">
          {actions.map((action, index) => (
            <ModernButton
              key={index}
              variant={action.variant || 'secondary'}
              size="small"
              disabled={action.disabled}
              onClick={action.onClick}
              title={action.tooltip}
              className="action-button"
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </ModernButton>
          ))}
        </div>
        
        {selectedCourse && (
          <div className="course-info">
            <div className="course-badge">
              <span className="badge-icon">📚</span>
              <span className="badge-text">{selectedCourse.courseCode}</span>
            </div>
            <div className="graph-stats">
              <span className="stat">
                {graphData.nodes.length} modules
              </span>
              <span className="stat">
                {graphData.edges.length} connections
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActions;

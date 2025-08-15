import React from 'react';
import PerformanceDashboard from './PerformanceDashboard';

const Sidebar = ({ isOpen, selectedNode, onClose, onNodeToggle, disabledNodes, graphData, selectedCourse }) => {
  if (!isOpen) {
    return null;
  }

  // Show performance dashboard when no specific node is selected
  if (!selectedNode) {
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>📊 Course Analytics</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <PerformanceDashboard 
          graphData={graphData} 
          selectedCourse={selectedCourse} 
        />
      </div>
    );
  }

  const isDisabled = disabledNodes.has(selectedNode.id);

  const renderCourseDetails = () => (
    <div className="node-details">
      <div className="detail-section">
        <h4>Course Information</h4>
        <div className="detail-item">
          <label>Degree:</label>
          <span>{selectedNode.data.degree}</span>
        </div>
        <div className="detail-item">
          <label>Department:</label>
          <span>{selectedNode.data.department}</span>
        </div>
        {selectedNode.data.description && (
          <div className="detail-item">
            <label>Description:</label>
            <p>{selectedNode.data.description}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderModuleDetails = () => (
    <div className="node-details">
      <div className="detail-section">
        <h4>Module Information</h4>
        <div className="detail-item">
          <label>Module Code:</label>
          <span>{selectedNode.data.moduleCode}</span>
        </div>
        <div className="detail-item">
          <label>Credit Value:</label>
          <span>{selectedNode.data.creditValue} credits</span>
        </div>
        {selectedNode.data.courseYear && (
          <div className="detail-item">
            <label>Year:</label>
            <span>Year {selectedNode.data.courseYear}</span>
          </div>
        )}
        {selectedNode.data.semester && (
          <div className="detail-item">
            <label>Semester:</label>
            <span>{selectedNode.data.semester}</span>
          </div>
        )}
        <div className="detail-item">
          <label>Type:</label>
          <span>{selectedNode.data.isOptional ? 'Optional' : 'Core'}</span>
        </div>
      </div>

      {selectedNode.data.summaryOfContents && (
        <div className="detail-section">
          <h4>Summary of Contents</h4>
          <p>{selectedNode.data.summaryOfContents}</p>
        </div>
      )}

      {selectedNode.data.intendedLearningOutcomes && 
       selectedNode.data.intendedLearningOutcomes.length > 0 && (
        <div className="detail-section">
          <h4>Intended Learning Outcomes</h4>
          <ul>
            {selectedNode.data.intendedLearningOutcomes.map((outcome, index) => (
              <li key={index}>{outcome}</li>
            ))}
          </ul>
        </div>
      )}

      {selectedNode.data.assessmentMethods && 
       selectedNode.data.assessmentMethods.length > 0 && (
        <div className="detail-section">
          <h4>Assessment Methods</h4>
          <ul>
            {selectedNode.data.assessmentMethods.map((assessment, index) => (
              <li key={index}>
                {assessment.method}: {assessment.percentage}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>{selectedNode.label}</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="sidebar-content">
          {selectedNode.type === 'course' ? renderCourseDetails() : renderModuleDetails()}

          {selectedNode.type === 'module' && (
            <div className="sidebar-actions">
              <button
                className={`toggle-button ${isDisabled ? 'disabled' : 'enabled'}`}
                onClick={() => onNodeToggle(selectedNode.id)}
              >
                {isDisabled ? 'Enable Module' : 'Disable Module'}
              </button>
              <p className="action-description">
                {isDisabled 
                  ? 'This module is currently disabled. Click to enable it and see its connections.'
                  : 'Click to disable this module and simulate not taking it. This will show how it affects your pathway.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
    </>
  );
};

export default Sidebar;

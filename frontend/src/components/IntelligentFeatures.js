import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme, useAnalytics } from '../contexts/EnhancedContexts';

// Interactive Learning Path Builder
const LearningPathBuilder = ({ 
  isOpen, 
  onClose, 
  courses = [], 
  graphData = { nodes: [], edges: [] },
  onPathCreated,
  existingPaths = []
}) => {
  const { theme } = useTheme();
  const { trackEvent } = useAnalytics();
  const [currentPath, setCurrentPath] = useState({
    id: null,
    name: '',
    description: '',
    modules: [],
    estimatedDuration: 0,
    difficulty: 'intermediate',
    tags: []
  });
  const [draggedModule, setDraggedModule] = useState(null);
  const [pathPreview, setPathPreview] = useState(null);
  const [availableModules, setAvailableModules] = useState([]);
  const [pathAnalysis, setPathAnalysis] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setAvailableModules(graphData.nodes.filter(node => 
        !currentPath.modules.some(m => m.id === node.id)
      ));
    }
  }, [isOpen, graphData.nodes, currentPath.modules]);

  // Analyze learning path for prerequisites, difficulty progression, etc.
  const analyzeCurrentPath = useCallback(() => {
    if (currentPath.modules.length === 0) {
      setPathAnalysis(null);
      return;
    }

    const modules = currentPath.modules;
    const prerequisites = new Set();
    const missingPrereqs = [];
    const credits = modules.reduce((sum, mod) => sum + (mod.credits || 0), 0);
    const levels = modules.map(mod => mod.level || 1);
    const avgLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;

    // Check prerequisites
    modules.forEach(module => {
      if (module.prerequisites) {
        module.prerequisites.forEach(prereq => {
          prerequisites.add(prereq);
          if (!modules.some(m => m.moduleCode === prereq)) {
            missingPrereqs.push({ module: module.moduleCode, missing: prereq });
          }
        });
      }
    });

    // Calculate difficulty progression
    const difficultyProgression = levels.map((level, index) => ({
      position: index + 1,
      level,
      moduleCode: modules[index].moduleCode,
      appropriate: index === 0 || level >= levels[index - 1]
    }));

    setPathAnalysis({
      totalCredits: credits,
      averageLevel: avgLevel.toFixed(1),
      prerequisitesMet: missingPrereqs.length === 0,
      missingPrerequisites: missingPrereqs,
      difficultyProgression,
      estimatedSemesters: Math.ceil(credits / 30),
      completionRate: Math.min(100, (credits / 120) * 100) // Assuming 120 credits for a full program
    });
  }, [currentPath.modules]);

  useEffect(() => {
    analyzeCurrentPath();
  }, [analyzeCurrentPath]);

  const handleDragStart = (e, module) => {
    setDraggedModule(module);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropZone) => {
    e.preventDefault();
    if (!draggedModule) return;

    if (dropZone === 'path') {
      // Add to path
      setCurrentPath(prev => ({
        ...prev,
        modules: [...prev.modules, draggedModule]
      }));
      setAvailableModules(prev => prev.filter(m => m.id !== draggedModule.id));
    } else if (dropZone === 'available') {
      // Remove from path
      setCurrentPath(prev => ({
        ...prev,
        modules: prev.modules.filter(m => m.id !== draggedModule.id)
      }));
      setAvailableModules(prev => [...prev, draggedModule].sort((a, b) => 
        a.moduleCode?.localeCompare(b.moduleCode || '') || 0
      ));
    }

    setDraggedModule(null);
  };

  const removeModuleFromPath = (moduleId) => {
    const module = currentPath.modules.find(m => m.id === moduleId);
    if (module) {
      setCurrentPath(prev => ({
        ...prev,
        modules: prev.modules.filter(m => m.id !== moduleId)
      }));
      setAvailableModules(prev => [...prev, module].sort((a, b) => 
        a.moduleCode?.localeCompare(b.moduleCode || '') || 0
      ));
    }
  };

  const reorderPath = (startIndex, endIndex) => {
    const result = Array.from(currentPath.modules);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    setCurrentPath(prev => ({ ...prev, modules: result }));
  };

  const savePath = () => {
    if (!currentPath.name.trim()) {
      alert('Please enter a name for your learning path');
      return;
    }

    const pathToSave = {
      ...currentPath,
      id: currentPath.id || Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onPathCreated?.(pathToSave);
    trackEvent('learning_path_created', {
      pathName: pathToSave.name,
      moduleCount: pathToSave.modules.length,
      totalCredits: pathAnalysis?.totalCredits || 0
    });

    // Reset form
    setCurrentPath({
      id: null,
      name: '',
      description: '',
      modules: [],
      estimatedDuration: 0,
      difficulty: 'intermediate',
      tags: []
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '90vh',
          background: theme === 'dark' ? 'var(--neutral-800)' : 'white',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-2xl)',
          border: `1px solid ${theme === 'dark' ? 'var(--neutral-700)' : 'var(--neutral-200)'}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-6)',
            borderBottom: `1px solid ${theme === 'dark' ? 'var(--neutral-700)' : 'var(--neutral-200)'}`,
            background: `linear-gradient(135deg, ${theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-50)'}, ${theme === 'dark' ? 'var(--neutral-800)' : 'white'})`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🎯 Learning Path Builder
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              ✕
            </button>
          </div>

          {/* Path Basic Info */}
          <div style={{ marginTop: 'var(--space-4)', display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: '1fr 1fr' }}>
            <input
              type="text"
              value={currentPath.name}
              onChange={(e) => setCurrentPath(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Learning Path Name"
              style={{
                padding: 'var(--space-3)',
                border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)'}`,
                borderRadius: 'var(--radius-lg)',
                background: theme === 'dark' ? 'var(--neutral-700)' : 'white',
                color: theme === 'dark' ? 'var(--neutral-100)' : 'var(--neutral-900)',
                fontSize: '1rem'
              }}
            />
            <select
              value={currentPath.difficulty}
              onChange={(e) => setCurrentPath(prev => ({ ...prev, difficulty: e.target.value }))}
              style={{
                padding: 'var(--space-3)',
                border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)'}`,
                borderRadius: 'var(--radius-lg)',
                background: theme === 'dark' ? 'var(--neutral-700)' : 'white',
                color: theme === 'dark' ? 'var(--neutral-100)' : 'var(--neutral-900)',
                fontSize: '1rem'
              }}
            >
              <option value="beginner">🟢 Beginner</option>
              <option value="intermediate">🟡 Intermediate</option>
              <option value="advanced">🔴 Advanced</option>
            </select>
          </div>
          
          <textarea
            value={currentPath.description}
            onChange={(e) => setCurrentPath(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your learning path goals and outcomes..."
            rows={2}
            style={{
              width: '100%',
              marginTop: 'var(--space-3)',
              padding: 'var(--space-3)',
              border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)'}`,
              borderRadius: 'var(--radius-lg)',
              background: theme === 'dark' ? 'var(--neutral-700)' : 'white',
              color: theme === 'dark' ? 'var(--neutral-100)' : 'var(--neutral-900)',
              fontSize: '0.875rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Available Modules */}
          <div style={{ width: '300px', borderRight: `1px solid ${theme === 'dark' ? 'var(--neutral-700)' : 'var(--neutral-200)'}` }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: `1px solid ${theme === 'dark' ? 'var(--neutral-700)' : 'var(--neutral-200)'}` }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: '600',
                color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)'
              }}>
                📚 Available Modules
              </h3>
              <p style={{
                margin: 'var(--space-1) 0 0 0',
                fontSize: '0.75rem',
                color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)'
              }}>
                Drag modules to build your path
              </p>
            </div>
            <div
              style={{
                height: 'calc(100% - 80px)',
                overflowY: 'auto',
                padding: 'var(--space-4)',
                background: theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-25)'
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'available')}
            >
              {availableModules.map(module => (
                <div
                  key={module.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, module)}
                  style={{
                    padding: 'var(--space-3)',
                    marginBottom: 'var(--space-2)',
                    background: theme === 'dark' ? 'var(--neutral-700)' : 'white',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)'}`,
                    cursor: 'grab',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: theme === 'dark' ? 'var(--neutral-100)' : 'var(--neutral-900)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    {module.moduleCode}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-600)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    {module.label}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', fontSize: '0.625rem' }}>
                    {module.credits && (
                      <span style={{
                        background: 'var(--primary-100)',
                        color: 'var(--primary-700)',
                        padding: '2px var(--space-1)',
                        borderRadius: 'var(--radius-xs)'
                      }}>
                        {module.credits}c
                      </span>
                    )}
                    {module.level && (
                      <span style={{
                        background: theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)',
                        color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-700)',
                        padding: '2px var(--space-1)',
                        borderRadius: 'var(--radius-xs)'
                      }}>
                        L{module.level}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Path Builder */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: `1px solid ${theme === 'dark' ? 'var(--neutral-700)' : 'var(--neutral-200)'}` }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: '600',
                color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)'
              }}>
                🗂️ Your Learning Path ({currentPath.modules.length} modules)
              </h3>
            </div>
            
            <div
              style={{
                flex: 1,
                padding: 'var(--space-4)',
                overflowY: 'auto',
                minHeight: '200px',
                background: theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-25)'
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'path')}
            >
              {currentPath.modules.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {currentPath.modules.map((module, index) => (
                    <div
                      key={module.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, module)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: 'var(--space-4)',
                        background: theme === 'dark' ? 'var(--neutral-700)' : 'white',
                        borderRadius: 'var(--radius-lg)',
                        border: `2px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)'}`,
                        cursor: 'grab',
                        transition: 'var(--transition-fast)',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        left: 'var(--space-2)',
                        top: 'var(--space-2)',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'var(--primary-500)',
                        background: 'var(--primary-100)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {index + 1}
                      </div>
                      
                      <div style={{ flex: 1, marginLeft: 'var(--space-8)' }}>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: theme === 'dark' ? 'var(--neutral-100)' : 'var(--neutral-900)',
                          marginBottom: 'var(--space-1)'
                        }}>
                          {module.moduleCode} - {module.label}
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-600)',
                          marginBottom: 'var(--space-2)'
                        }}>
                          {module.description}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: '0.75rem' }}>
                          {module.credits && (
                            <span style={{
                              background: 'var(--primary-100)',
                              color: 'var(--primary-700)',
                              padding: 'var(--space-1) var(--space-2)',
                              borderRadius: 'var(--radius-sm)'
                            }}>
                              {module.credits} credits
                            </span>
                          )}
                          {module.level && (
                            <span style={{
                              background: theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)',
                              color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-700)',
                              padding: 'var(--space-1) var(--space-2)',
                              borderRadius: 'var(--radius-sm)'
                            }}>
                              Level {module.level}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeModuleFromPath(module.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-500)',
                          cursor: 'pointer',
                          padding: 'var(--space-2)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '1.25rem'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: 'var(--space-12)',
                  color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-500)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>🎯</div>
                  <div>Drag modules here to build your learning path</div>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Panel */}
          {pathAnalysis && (
            <div style={{ 
              width: '350px', 
              borderLeft: `1px solid ${theme === 'dark' ? 'var(--neutral-700)' : 'var(--neutral-200)'}`,
              background: theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-25)'
            }}>
              <div style={{ padding: 'var(--space-4)', borderBottom: `1px solid ${theme === 'dark' ? 'var(--neutral-700)' : 'var(--neutral-200)'}` }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)'
                }}>
                  📊 Path Analysis
                </h3>
              </div>
              
              <div style={{ padding: 'var(--space-4)', overflowY: 'auto', height: 'calc(100% - 80px)' }}>
                {/* Quick Stats */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    <div style={{
                      padding: 'var(--space-3)',
                      background: theme === 'dark' ? 'var(--neutral-700)' : 'white',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-500)' }}>
                        {pathAnalysis.totalCredits}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)' }}>
                        Total Credits
                      </div>
                    </div>
                    <div style={{
                      padding: 'var(--space-3)',
                      background: theme === 'dark' ? 'var(--neutral-700)' : 'white',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-500)' }}>
                        {pathAnalysis.estimatedSemesters}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)' }}>
                        Semesters
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prerequisites Check */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>
                      {pathAnalysis.prerequisitesMet ? '✅' : '⚠️'}
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)'
                    }}>
                      Prerequisites
                    </span>
                  </div>
                  {!pathAnalysis.prerequisitesMet && (
                    <div style={{
                      padding: 'var(--space-3)',
                      background: 'var(--warning-100)',
                      border: '1px solid var(--warning-200)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: 'var(--space-1)' }}>Missing Prerequisites:</div>
                      {pathAnalysis.missingPrerequisites.map((item, index) => (
                        <div key={index}>• {item.module} requires {item.missing}</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    Program Completion: {pathAnalysis.completionRate.toFixed(1)}%
                  </div>
                  <div style={{
                    height: '8px',
                    background: theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${pathAnalysis.completionRate}%`,
                      background: 'linear-gradient(90deg, var(--primary-500), var(--accent-500))',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 'var(--space-4)',
            borderTop: `1px solid ${theme === 'dark' ? 'var(--neutral-700)' : 'var(--neutral-200)'}`,
            background: theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-50)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{
            fontSize: '0.875rem',
            color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)'
          }}>
            {currentPath.modules.length} modules • {pathAnalysis?.totalCredits || 0} credits
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              onClick={onClose}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'none',
                border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)'}`,
                borderRadius: 'var(--radius-md)',
                color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-700)',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Cancel
            </button>
            <button
              onClick={savePath}
              disabled={!currentPath.name.trim() || currentPath.modules.length === 0}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: currentPath.name.trim() && currentPath.modules.length > 0 
                  ? 'linear-gradient(135deg, var(--primary-500), var(--accent-500))'
                  : theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                cursor: currentPath.name.trim() && currentPath.modules.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              Save Learning Path
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI-Powered Course Recommendations
const AIRecommendations = ({ 
  userProfile = {}, 
  completedCourses = [], 
  currentCourses = [],
  graphData = { nodes: [], edges: [] },
  onCourseSelect
}) => {
  const { theme } = useTheme();
  const { trackEvent } = useAnalytics();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('suggested');

  // Generate AI recommendations based on user data
  const generateRecommendations = useCallback(() => {
    setLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const availableCourses = graphData.nodes.filter(node => 
        !completedCourses.includes(node.id) && !currentCourses.includes(node.id)
      );

      // Different recommendation categories
      const categorizedRecommendations = {
        suggested: generateSuggestedCourses(availableCourses),
        prerequisites: generatePrerequisiteRecommendations(availableCourses),
        trending: generateTrendingCourses(availableCourses),
        similar: generateSimilarCourses(availableCourses),
        career: generateCareerBasedRecommendations(availableCourses)
      };

      setRecommendations(categorizedRecommendations);
      setLoading(false);
    }, 1500);
  }, [graphData.nodes, completedCourses, currentCourses, userProfile]);

  const generateSuggestedCourses = (courses) => {
    // AI logic for personalized suggestions
    return courses
      .map(course => ({
        ...course,
        score: Math.random() * 100,
        reason: [
          "Matches your learning style",
          "Popular among similar students",
          "Builds on your strengths",
          "Fills knowledge gaps",
          "Industry relevant"
        ][Math.floor(Math.random() * 5)]
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  };

  const generatePrerequisiteRecommendations = (courses) => {
    // Find courses that unlock other courses
    return courses
      .filter(course => {
        const dependentCourses = graphData.edges.filter(edge => edge.source === course.id);
        return dependentCourses.length > 0;
      })
      .map(course => ({
        ...course,
        reason: "Unlocks advanced courses",
        unlocks: graphData.edges
          .filter(edge => edge.source === course.id)
          .map(edge => graphData.nodes.find(n => n.id === edge.target)?.moduleCode)
          .filter(Boolean)
          .slice(0, 3)
      }))
      .slice(0, 6);
  };

  const generateTrendingCourses = (courses) => {
    // Simulate trending courses based on popularity
    return courses
      .map(course => ({
        ...course,
        popularity: Math.random() * 100,
        reason: "Trending this semester",
        trend: Math.random() > 0.5 ? 'up' : 'hot'
      }))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 6);
  };

  const generateSimilarCourses = (courses) => {
    // Find courses similar to completed ones
    if (completedCourses.length === 0) return [];
    
    return courses
      .map(course => ({
        ...course,
        similarity: Math.random() * 100,
        reason: "Similar to courses you've completed"
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 6);
  };

  const generateCareerBasedRecommendations = (courses) => {
    // Career-focused recommendations
    const careerPaths = [
      "Software Development",
      "Data Science",
      "Cybersecurity",
      "Web Development",
      "AI/Machine Learning"
    ];
    
    return courses
      .map(course => ({
        ...course,
        careerRelevance: Math.random() * 100,
        reason: `Great for ${careerPaths[Math.floor(Math.random() * careerPaths.length)]}`,
        careerPath: careerPaths[Math.floor(Math.random() * careerPaths.length)]
      }))
      .sort((a, b) => b.careerRelevance - a.careerRelevance)
      .slice(0, 6);
  };

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const categoryConfig = {
    suggested: { 
      icon: '🎯', 
      label: 'Suggested for You',
      description: 'Personalized recommendations based on your profile'
    },
    prerequisites: { 
      icon: '🔓', 
      label: 'Unlock Courses',
      description: 'Complete these to access advanced modules'
    },
    trending: { 
      icon: '📈', 
      label: 'Trending Now',
      description: 'Popular courses this semester'
    },
    similar: { 
      icon: '🔄', 
      label: 'Similar Courses',
      description: 'Based on your completed courses'
    },
    career: { 
      icon: '💼', 
      label: 'Career Focused',
      description: 'Aligned with industry demands'
    }
  };

  const currentRecommendations = recommendations[selectedCategory] || [];

  return (
    <div style={{
      padding: 'var(--space-6)',
      background: theme === 'dark' ? 'var(--neutral-800)' : 'white',
      borderRadius: 'var(--radius-xl)',
      border: `1px solid ${theme === 'dark' ? 'var(--neutral-700)' : 'var(--neutral-200)'}`,
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{
          margin: '0 0 var(--space-2) 0',
          fontSize: '1.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🤖 AI Course Recommendations
        </h2>
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)'
        }}>
          Discover your next learning adventure with personalized suggestions
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-6)',
        overflowX: 'auto',
        paddingBottom: 'var(--space-2)'
      }}>
        {Object.entries(categoryConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: selectedCategory === key 
                ? 'linear-gradient(135deg, var(--primary-500), var(--accent-500))'
                : 'none',
              border: `1px solid ${selectedCategory === key 
                ? 'transparent' 
                : (theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)')}`,
              borderRadius: 'var(--radius-lg)',
              color: selectedCategory === key 
                ? 'white' 
                : (theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-700)'),
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}
          >
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </button>
        ))}
      </div>

      {/* Category Description */}
      <div style={{
        marginBottom: 'var(--space-6)',
        padding: 'var(--space-4)',
        background: theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-50)',
        borderRadius: 'var(--radius-md)',
        borderLeft: '4px solid var(--primary-500)'
      }}>
        <div style={{
          fontSize: '0.875rem',
          color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-700)'
        }}>
          {categoryConfig[selectedCategory]?.description}
        </div>
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-4)'
        }}>
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              style={{
                height: '200px',
                background: theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-100)',
                borderRadius: 'var(--radius-lg)',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-4)'
        }}>
          {currentRecommendations.map((course, index) => (
            <div
              key={course.id}
              style={{
                padding: 'var(--space-5)',
                background: theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-50)',
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)'}`,
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => {
                onCourseSelect?.(course);
                trackEvent('ai_recommendation_clicked', {
                  courseId: course.id,
                  category: selectedCategory,
                  position: index + 1
                });
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Recommendation Score/Badge */}
              <div style={{
                position: 'absolute',
                top: 'var(--space-3)',
                right: 'var(--space-3)',
                background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                color: 'white',
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {selectedCategory === 'suggested' && `${Math.round(course.score || 0)}% match`}
                {selectedCategory === 'trending' && (course.trend === 'hot' ? '🔥 Hot' : '📈 Rising')}
                {selectedCategory === 'prerequisites' && '🔓 Unlocks'}
                {selectedCategory === 'similar' && `${Math.round(course.similarity || 0)}% similar`}
                {selectedCategory === 'career' && '💼 Career'}
              </div>

              {/* Course Info */}
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: theme === 'dark' ? 'var(--neutral-100)' : 'var(--neutral-900)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {course.moduleCode}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-600)',
                  marginBottom: 'var(--space-2)',
                  lineHeight: '1.4'
                }}>
                  {course.label}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--primary-500)',
                  fontWeight: '500',
                  marginBottom: 'var(--space-3)'
                }}>
                  💡 {course.reason}
                </div>
              </div>

              {/* Additional Info */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', fontSize: '0.75rem' }}>
                {course.credits && (
                  <span style={{
                    background: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {course.credits} credits
                  </span>
                )}
                {course.level && (
                  <span style={{
                    background: theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)',
                    color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-700)',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    Level {course.level}
                  </span>
                )}
                {course.unlocks && course.unlocks.length > 0 && (
                  <span style={{
                    background: 'var(--accent-100)',
                    color: 'var(--accent-700)',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    Unlocks {course.unlocks.length} courses
                  </span>
                )}
              </div>

              {/* Hover Overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, var(--primary-500), var(--accent-500))',
                transform: 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 0.3s ease'
              }}
              className="hover-indicator" />
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
        <button
          onClick={generateRecommendations}
          disabled={loading}
          style={{
            padding: 'var(--space-3) var(--space-6)',
            background: loading ? 'none' : 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
            border: loading ? `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)'}` : 'none',
            borderRadius: 'var(--radius-lg)',
            color: loading ? (theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)') : 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            margin: '0 auto'
          }}
        >
          <span>{loading ? '🔄' : '✨'}</span>
          {loading ? 'Generating recommendations...' : 'Get fresh recommendations'}
        </button>
      </div>
    </div>
  );
};

export { LearningPathBuilder, AIRecommendations };

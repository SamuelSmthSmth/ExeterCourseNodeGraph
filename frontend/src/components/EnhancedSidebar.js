import React, { useState, useRef, useEffect } from 'react';

// Enhanced Modern Sidebar with Advanced Features
const EnhancedSidebar = ({ 
  selectedNode, 
  onClose, 
  graphData, 
  onNavigateToNode,
  isVisible = false 
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const sidebarRef = useRef(null);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        onClose?.();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  // Click outside to close (optional behavior)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        // Optionally close on outside click
        // onClose?.();
      }
    };
    
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!isVisible || !selectedNode) return null;

  // Get connected nodes
  const connectedNodes = graphData?.edges
    ?.filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id)
    ?.map(edge => {
      const nodeId = edge.source === selectedNode.id ? edge.target : edge.source;
      return graphData.nodes.find(node => node.id === nodeId);
    })
    ?.filter(Boolean) || [];

  // Filter connected nodes based on search
  const filteredConnectedNodes = connectedNodes.filter(node =>
    node.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.moduleCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get module statistics
  const moduleStats = {
    totalModules: connectedNodes.length,
    prerequisiteModules: connectedNodes.filter(node => 
      graphData?.edges?.some(edge => 
        edge.target === selectedNode.id && edge.source === node.id
      )
    ).length,
    dependentModules: connectedNodes.filter(node => 
      graphData?.edges?.some(edge => 
        edge.source === selectedNode.id && edge.target === node.id
      )
    ).length
  };

  const tabs = [
    { id: 'details', label: '📋 Details', icon: '📋' },
    { id: 'connections', label: '🔗 Connections', icon: '🔗' },
    { id: 'analytics', label: '📊 Analytics', icon: '📊' }
  ];

  const sidebarStyles = {
    position: 'fixed',
    top: 0,
    right: isExpanded ? 0 : '-350px',
    width: '400px',
    height: '100vh',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    borderLeft: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '-10px 0 25px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'var(--font-body)'
  };

  return (
    <div ref={sidebarRef} style={sidebarStyles}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-6)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--purple-600) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Module Details
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--neutral-600)',
                transition: 'var(--transition-fast)'
              }}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <span style={{ fontSize: '1.2rem' }}>
                {isExpanded ? '⏪' : '⏩'}
              </span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--neutral-600)',
                transition: 'var(--transition-fast)'
              }}
              title="Close sidebar"
            >
              <span style={{ fontSize: '1.2rem' }}>✕</span>
            </button>
          </div>
        </div>

        {/* Module Title */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--neutral-900)',
            marginBottom: 'var(--space-2)'
          }}>
            {selectedNode.moduleCode || selectedNode.id}
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--neutral-600)',
            lineHeight: 1.5
          }}>
            {selectedNode.label || selectedNode.moduleName || 'Module Title'}
          </div>
          {selectedNode.credits && (
            <div style={{
              marginTop: 'var(--space-2)',
              display: 'inline-block',
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              color: 'white',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {selectedNode.credits} Credits
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        background: 'rgba(248, 250, 252, 0.5)'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: 'var(--space-3) var(--space-4)',
              border: 'none',
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, var(--primary-50) 0%, var(--purple-50) 100%)' 
                : 'transparent',
              color: activeTab === tab.id ? 'var(--primary-700)' : 'var(--neutral-600)',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.id ? '600' : '500',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary-500)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)'
            }}
          >
            <span>{tab.icon}</span>
            <span className="tab-label">{tab.label.split(' ')[1] || tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 'var(--space-6)'
      }}>
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Basic Information */}
            <div>
              <h3 style={{
                margin: '0 0 var(--space-4) 0',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--neutral-900)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <span>📝</span> Information
              </h3>
              <div style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)'
              }}>
                {[
                  { label: 'Module Code', value: selectedNode.moduleCode || selectedNode.id },
                  { label: 'Module Name', value: selectedNode.label || selectedNode.moduleName },
                  { label: 'Credits', value: selectedNode.credits ? `${selectedNode.credits} credits` : 'Not specified' },
                  { label: 'Level', value: selectedNode.level || 'Not specified' },
                  { label: 'Department', value: selectedNode.department || 'Not specified' },
                  { label: 'Semester', value: selectedNode.semester || 'Not specified' }
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-2) 0',
                    borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--neutral-600)',
                      fontWeight: '500'
                    }}>
                      {item.label}:
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--neutral-900)',
                      fontWeight: '600',
                      textAlign: 'right'
                    }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {selectedNode.description && (
              <div>
                <h3 style={{
                  margin: '0 0 var(--space-4) 0',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--neutral-900)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}>
                  <span>📄</span> Description
                </h3>
                <div style={{
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: 'var(--neutral-700)'
                }}>
                  {selectedNode.description}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search connected modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  paddingRight: 'var(--space-10)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem',
                  background: 'white',
                  outline: 'none',
                  transition: 'var(--transition-fast)'
                }}
              />
              <div style={{
                position: 'absolute',
                right: 'var(--space-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--neutral-400)'
              }}>
                🔍
              </div>
            </div>

            {/* Connection Stats */}
            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--space-4)'
            }}>
              {[
                { label: 'Total', value: moduleStats.totalModules, icon: '🔗', color: 'var(--blue-500)' },
                { label: 'Prerequisites', value: moduleStats.prerequisiteModules, icon: '⬅️', color: 'var(--orange-500)' },
                { label: 'Dependents', value: moduleStats.dependentModules, icon: '➡️', color: 'var(--green-500)' }
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.5rem',
                    color: stat.color,
                    marginBottom: 'var(--space-1)'
                  }}>
                    {stat.icon}
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--neutral-900)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--neutral-600)',
                    fontWeight: '500'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Connected Modules List */}
            <div>
              <h4 style={{
                margin: '0 0 var(--space-3) 0',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--neutral-900)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Connected Modules</span>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--neutral-500)',
                  fontWeight: '400'
                }}>
                  {filteredConnectedNodes.length} of {connectedNodes.length}
                </span>
              </h4>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {filteredConnectedNodes.length > 0 ? (
                  filteredConnectedNodes.map(node => {
                    const isPrerequisite = graphData?.edges?.some(edge => 
                      edge.target === selectedNode.id && edge.source === node.id
                    );
                    const isDependent = graphData?.edges?.some(edge => 
                      edge.source === selectedNode.id && edge.target === node.id
                    );
                    
                    return (
                      <div
                        key={node.id}
                        onClick={() => onNavigateToNode?.(node)}
                        style={{
                          background: 'white',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--space-3)',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'var(--neutral-900)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            {node.moduleCode || node.id}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--neutral-600)',
                            lineHeight: 1.3
                          }}>
                            {node.label || node.moduleName}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)'
                        }}>
                          {isPrerequisite && (
                            <span title="Prerequisite" style={{
                              fontSize: '0.875rem',
                              color: 'var(--orange-500)'
                            }}>
                              ⬅️
                            </span>
                          )}
                          {isDependent && (
                            <span title="Dependent" style={{
                              fontSize: '0.875rem',
                              color: 'var(--green-500)'
                            }}>
                              ➡️
                            </span>
                          )}
                          <span style={{
                            fontSize: '0.875rem',
                            color: 'var(--neutral-400)'
                          }}>
                            →
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-8)',
                    color: 'var(--neutral-500)'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>
                      {searchTerm ? '🔍' : '🔗'}
                    </div>
                    <div>
                      {searchTerm 
                        ? `No modules found matching "${searchTerm}"`
                        : 'No connected modules found'
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Network Analysis */}
            <div>
              <h3 style={{
                margin: '0 0 var(--space-4) 0',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--neutral-900)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <span>🌐</span> Network Analysis
              </h3>
              <div style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
              }}>
                {[
                  {
                    label: 'Centrality Score',
                    value: ((connectedNodes.length / Math.max(graphData?.nodes?.length || 1, 1)) * 100).toFixed(1) + '%',
                    description: 'How central this module is in the network',
                    color: 'var(--blue-500)'
                  },
                  {
                    label: 'Prerequisite Depth',
                    value: moduleStats.prerequisiteModules,
                    description: 'Number of prerequisite modules',
                    color: 'var(--orange-500)'
                  },
                  {
                    label: 'Dependency Impact',
                    value: moduleStats.dependentModules,
                    description: 'Number of modules that depend on this',
                    color: 'var(--green-500)'
                  },
                  {
                    label: 'Connection Ratio',
                    value: `${connectedNodes.length}/${graphData?.nodes?.length || 0}`,
                    description: 'Connected nodes vs total nodes',
                    color: 'var(--purple-500)'
                  }
                ].map(metric => (
                  <div key={metric.label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-3)',
                    background: 'rgba(248, 250, 252, 0.5)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(226, 232, 240, 0.8)'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--neutral-900)',
                        marginBottom: 'var(--space-1)'
                      }}>
                        {metric.label}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--neutral-600)'
                      }}>
                        {metric.description}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: metric.color
                    }}>
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Path Suggestions */}
            <div>
              <h3 style={{
                margin: '0 0 var(--space-4) 0',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--neutral-900)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <span>🎯</span> Learning Path
              </h3>
              <div style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                border: '1px solid rgba(226, 232, 240, 0.8)'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)'
                }}>
                  {moduleStats.prerequisiteModules > 0 && (
                    <div style={{
                      padding: 'var(--space-3)',
                      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(249, 115, 22, 0.2)'
                    }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--orange-700)',
                        marginBottom: 'var(--space-1)'
                      }}>
                        📚 Prerequisites Required
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--orange-600)'
                      }}>
                        Complete {moduleStats.prerequisiteModules} prerequisite module{moduleStats.prerequisiteModules !== 1 ? 's' : ''} before taking this module
                      </div>
                    </div>
                  )}
                  
                  {moduleStats.dependentModules > 0 && (
                    <div style={{
                      padding: 'var(--space-3)',
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(74, 222, 128, 0.1) 100%)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--green-700)',
                        marginBottom: 'var(--space-1)'
                      }}>
                        🚀 Unlocks Future Modules
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--green-600)'
                      }}>
                        This module opens {moduleStats.dependentModules} advanced module{moduleStats.dependentModules !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                  
                  {moduleStats.prerequisiteModules === 0 && moduleStats.dependentModules === 0 && (
                    <div style={{
                      padding: 'var(--space-3)',
                      background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(209, 213, 219, 0.1) 100%)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(156, 163, 175, 0.2)',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--neutral-600)'
                      }}>
                        🏝️ Standalone Module
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--neutral-500)',
                        marginTop: 'var(--space-1)'
                      }}>
                        This module has no prerequisites or dependents
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSidebar;

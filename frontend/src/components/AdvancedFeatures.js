import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/EnhancedContexts';

// Interactive Graph Minimap Component
const GraphMinimap = ({ 
  nodes = [], 
  edges = [], 
  viewportBounds = { x: 0, y: 0, width: 800, height: 600 },
  graphBounds = { x: -1000, y: -1000, width: 2000, height: 2000 },
  onViewportChange,
  selectedNode,
  className = ''
}) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const minimapRef = useRef(null);
  const MINIMAP_SIZE = 200;

  // Calculate scale factors
  const scaleX = MINIMAP_SIZE / graphBounds.width;
  const scaleY = MINIMAP_SIZE / graphBounds.height;
  const scale = Math.min(scaleX, scaleY);

  // Transform coordinates from graph space to minimap space
  const transformToMinimap = (x, y) => ({
    x: (x - graphBounds.x) * scale,
    y: (y - graphBounds.y) * scale
  });

  // Transform coordinates from minimap space to graph space
  const transformToGraph = (x, y) => ({
    x: x / scale + graphBounds.x,
    y: y / scale + graphBounds.y
  });

  const handleMouseDown = (e) => {
    if (!minimapRef.current) return;
    
    const rect = minimapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x: clickX, y: clickY });
    
    // Center viewport on click position
    const graphPos = transformToGraph(clickX, clickY);
    onViewportChange?.({
      x: graphPos.x - viewportBounds.width / 2,
      y: graphPos.y - viewportBounds.height / 2,
      width: viewportBounds.width,
      height: viewportBounds.height
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !minimapRef.current) return;
    
    const rect = minimapRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const graphPos = transformToGraph(currentX, currentY);
    onViewportChange?.({
      x: graphPos.x - viewportBounds.width / 2,
      y: graphPos.y - viewportBounds.height / 2,
      width: viewportBounds.width,
      height: viewportBounds.height
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Calculate viewport rectangle in minimap coordinates
  const viewportRect = {
    x: (viewportBounds.x - graphBounds.x) * scale,
    y: (viewportBounds.y - graphBounds.y) * scale,
    width: viewportBounds.width * scale,
    height: viewportBounds.height * scale
  };

  return (
    <div
      className={`graph-minimap ${className}`}
      style={{
        position: 'fixed',
        bottom: 'var(--space-4)',
        left: 'var(--space-4)',
        width: `${MINIMAP_SIZE}px`,
        height: `${MINIMAP_SIZE}px`,
        background: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: `2px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        cursor: 'pointer',
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      <svg
        ref={minimapRef}
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        onMouseDown={handleMouseDown}
        style={{ display: 'block' }}
      >
        {/* Render edges */}
        <g opacity="0.3">
          {edges.map((edge, index) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const source = transformToMinimap(sourceNode.x || 0, sourceNode.y || 0);
            const target = transformToMinimap(targetNode.x || 0, targetNode.y || 0);

            return (
              <line
                key={`edge-${index}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Render nodes */}
        <g>
          {nodes.map((node) => {
            const pos = transformToMinimap(node.x || 0, node.y || 0);
            const isSelected = selectedNode?.id === node.id;
            
            return (
              <circle
                key={node.id}
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? "4" : "2"}
                fill={isSelected ? '#f59e0b' : (theme === 'dark' ? '#3b82f6' : '#1d4ed8')}
                stroke={isSelected ? '#ffffff' : 'none'}
                strokeWidth={isSelected ? "1" : "0"}
              />
            );
          })}
        </g>

        {/* Viewport rectangle */}
        <rect
          x={Math.max(0, Math.min(MINIMAP_SIZE - viewportRect.width, viewportRect.x))}
          y={Math.max(0, Math.min(MINIMAP_SIZE - viewportRect.height, viewportRect.y))}
          width={Math.min(MINIMAP_SIZE, viewportRect.width)}
          height={Math.min(MINIMAP_SIZE, viewportRect.height)}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="4,2"
          opacity="0.8"
        />
      </svg>

      {/* Minimap label */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--space-2)',
          left: 'var(--space-2)',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          pointerEvents: 'none'
        }}
      >
        🗺️ Map
      </div>

      {/* Node count indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 'var(--space-2)',
          right: 'var(--space-2)',
          fontSize: '0.6rem',
          fontWeight: '500',
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
          pointerEvents: 'none'
        }}
      >
        {nodes.length} nodes
      </div>
    </div>
  );
};

// Advanced Search and Filter Panel
const AdvancedSearchPanel = ({ 
  isOpen, 
  onClose, 
  courses = [], 
  graphData = { nodes: [], edges: [] },
  onFilterChange,
  onHighlightNodes 
}) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    nodeTypes: [],
    creditRange: [0, 60],
    semester: 'all',
    level: 'all',
    prerequisites: 'all',
    department: 'all'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());

  // Extract unique values for filter options
  const departments = [...new Set(graphData.nodes.map(n => n.department).filter(Boolean))];
  const levels = [...new Set(graphData.nodes.map(n => n.level).filter(Boolean))];
  const semesters = [...new Set(graphData.nodes.map(n => n.semester).filter(Boolean))];

  // Advanced search function
  const performSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHighlightedNodes(new Set());
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = graphData.nodes.filter(node => {
      const matchesText = (
        node.label?.toLowerCase().includes(term) ||
        node.moduleCode?.toLowerCase().includes(term) ||
        node.description?.toLowerCase().includes(term) ||
        node.department?.toLowerCase().includes(term)
      );

      const matchesFilters = (
        (filters.department === 'all' || node.department === filters.department) &&
        (filters.level === 'all' || node.level === filters.level) &&
        (filters.semester === 'all' || node.semester === filters.semester) &&
        (node.credits >= filters.creditRange[0] && node.credits <= filters.creditRange[1])
      );

      return matchesText && matchesFilters;
    });

    setSearchResults(results);
    const resultIds = new Set(results.map(n => n.id));
    setHighlightedNodes(resultIds);
    onHighlightNodes?.(resultIds);
  }, [searchTerm, filters, graphData.nodes, onHighlightNodes]);

  useEffect(() => {
    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [performSearch]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
          maxWidth: '800px',
          height: '80vh',
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
            background: theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-50)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '700',
              color: theme === 'dark' ? 'var(--neutral-100)' : 'var(--neutral-900)'
            }}>
              🔍 Advanced Search & Filters
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

          {/* Search Input */}
          <div style={{ marginTop: 'var(--space-4)', position: 'relative' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search modules, descriptions, codes..."
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                paddingLeft: 'var(--space-12)',
                border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)'}`,
                borderRadius: 'var(--radius-lg)',
                fontSize: '1rem',
                background: theme === 'dark' ? 'var(--neutral-700)' : 'white',
                color: theme === 'dark' ? 'var(--neutral-100)' : 'var(--neutral-900)',
                outline: 'none'
              }}
            />
            <div style={{
              position: 'absolute',
              left: 'var(--space-4)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-500)'
            }}>
              🔍
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Filters Sidebar */}
          <div
            style={{
              width: '300px',
              padding: 'var(--space-6)',
              borderRight: `1px solid ${theme === 'dark' ? 'var(--neutral-700)' : 'var(--neutral-200)'}`,
              overflowY: 'auto'
            }}
          >
            <h3 style={{
              margin: '0 0 var(--space-4) 0',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)'
            }}>
              Filters
            </h3>

            {/* Department Filter */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-700)',
                marginBottom: 'var(--space-2)'
              }}>
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => updateFilter('department', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: theme === 'dark' ? 'var(--neutral-700)' : 'white',
                  color: theme === 'dark' ? 'var(--neutral-100)' : 'var(--neutral-900)'
                }}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-700)',
                marginBottom: 'var(--space-2)'
              }}>
                Level
              </label>
              <select
                value={filters.level}
                onChange={(e) => updateFilter('level', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: theme === 'dark' ? 'var(--neutral-700)' : 'white',
                  color: theme === 'dark' ? 'var(--neutral-100)' : 'var(--neutral-900)'
                }}
              >
                <option value="all">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </div>

            {/* Credit Range */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-700)',
                marginBottom: 'var(--space-2)'
              }}>
                Credits: {filters.creditRange[0]} - {filters.creditRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={filters.creditRange[1]}
                onChange={(e) => updateFilter('creditRange', [filters.creditRange[0], parseInt(e.target.value)])}
                style={{ width: '100%' }}
              />
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setFilters({
                  nodeTypes: [],
                  creditRange: [0, 60],
                  semester: 'all',
                  level: 'all',
                  prerequisites: 'all',
                  department: 'all'
                });
                setSearchTerm('');
                setHighlightedNodes(new Set());
                onHighlightNodes?.(new Set());
              }}
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-3)',
                background: 'none',
                border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)'}`,
                borderRadius: 'var(--radius-md)',
                color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-700)',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Clear All Filters
            </button>
          </div>

          {/* Results */}
          <div style={{ flex: 1, padding: 'var(--space-6)', overflowY: 'auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: '600',
                color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)'
              }}>
                Search Results
              </h3>
              <span style={{
                fontSize: '0.875rem',
                color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)'
              }}>
                {searchResults.length} results
              </span>
            </div>

            {searchResults.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {searchResults.map(node => (
                  <div
                    key={node.id}
                    style={{
                      padding: 'var(--space-4)',
                      background: theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-50)',
                      borderRadius: 'var(--radius-lg)',
                      border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)'}`,
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
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
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: theme === 'dark' ? 'var(--neutral-100)' : 'var(--neutral-900)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      {node.moduleCode} - {node.label}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-600)',
                      marginBottom: 'var(--space-2)'
                    }}>
                      {node.description}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: 'var(--space-2)',
                      fontSize: '0.75rem'
                    }}>
                      {node.credits && (
                        <span style={{
                          background: 'var(--primary-100)',
                          color: 'var(--primary-700)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          {node.credits} credits
                        </span>
                      )}
                      {node.department && (
                        <span style={{
                          background: theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)',
                          color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-700)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          {node.department}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-8)',
                color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-500)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>🔍</div>
                <div>No results found for "{searchTerm}"</div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-8)',
                color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-500)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>🎯</div>
                <div>Start typing to search modules</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { GraphMinimap, AdvancedSearchPanel };

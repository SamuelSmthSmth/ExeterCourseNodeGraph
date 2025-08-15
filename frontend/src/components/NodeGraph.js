import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3-force';
import * as d3Selection from 'd3-selection';
import * as d3Drag from 'd3-drag';

// Custom Obsidian-style Node Component
const ObsidianNode = ({ node, onNodeClick, isDisabled, isDragging, position }) => {
  const nodeRef = useRef(null);
  
  const getNodeColor = () => {
    if (isDisabled) return '#64748b';
    if (node.data.moduleType === 'core') return '#8b5cf6';
    if (node.data.moduleType === 'optional') return '#06b6d4';
    return '#10b981'; // default
  };

  const getNodeSize = () => {
    if (node.data.moduleType === 'core') return 60;
    if (node.data.moduleType === 'optional') return 50;
    return 45;
  };

  const handleClick = () => {
    if (onNodeClick && !isDisabled) {
      onNodeClick(node);
    }
  };

  return (
    <g
      ref={nodeRef}
      transform={`translate(${position.x}, ${position.y})`}
      style={{ cursor: isDisabled ? 'default' : 'pointer' }}
      onClick={handleClick}
      className={`obsidian-node ${isDragging ? 'dragging' : ''} ${isDisabled ? 'disabled' : ''}`}
    >
      {/* Outer glow effect */}
      <circle
        r={getNodeSize() + 8}
        fill={getNodeColor()}
        opacity={isDisabled ? 0.1 : 0.2}
        className="node-glow"
      />
      
      {/* Main node circle */}
      <circle
        r={getNodeSize()}
        fill={getNodeColor()}
        stroke="#ffffff"
        strokeWidth={isDisabled ? 1 : 2}
        opacity={isDisabled ? 0.4 : 0.9}
        className="node-main"
        style={{
          filter: isDragging ? 'brightness(1.2)' : 'none',
          transition: isDragging ? 'none' : 'all 0.2s ease'
        }}
      />
      
      {/* Node text with better contrast */}
      <text
        textAnchor="middle"
        dy="0.3em"
        className="module-code"
        style={{ 
          fontSize: '12px',
          fontWeight: '700',
          fill: isDisabled ? '#94a3b8' : '#ffffff',
          textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)',
          pointerEvents: 'none', 
          userSelect: 'none',
          opacity: isDisabled ? 0.6 : 1
        }}
      >
        {node.data.module?.moduleCode || node.label}
      </text>
      
      {/* Additional info text with better contrast */}
      {node.data.module?.moduleTitle && (
        <text
          textAnchor="middle"
          dy="1.8em"
          className="module-title"
          style={{ 
            fontSize: '9px',
            fontWeight: '500',
            fill: isDisabled ? '#94a3b8' : '#e2e8f0',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',
            pointerEvents: 'none', 
            userSelect: 'none',
            opacity: isDisabled ? 0.4 : 1
          }}
        >
          {node.data.module.moduleTitle.length > 20 
            ? node.data.module.moduleTitle.substring(0, 20) + '...'
            : node.data.module.moduleTitle}
        </text>
      )}
    </g>
  );
};

// Custom Edge Component
const ObsidianEdge = ({ edge, sourcePos, targetPos, isDisabled }) => {
  const getEdgeColor = () => {
    if (isDisabled) return '#64748b';
    return '#6366f1';
  };

  const getEdgeWidth = () => {
    return isDisabled ? 1 : 2;
  };

  return (
    <g className="obsidian-edge">
      {/* Edge glow */}
      <line
        x1={sourcePos.x}
        y1={sourcePos.y}
        x2={targetPos.x}
        y2={targetPos.y}
        stroke={getEdgeColor()}
        strokeWidth={getEdgeWidth() + 4}
        opacity={isDisabled ? 0.05 : 0.1}
        className="edge-glow"
      />
      
      {/* Main edge */}
      <line
        x1={sourcePos.x}
        y1={sourcePos.y}
        x2={targetPos.x}
        y2={targetPos.y}
        stroke={getEdgeColor()}
        strokeWidth={getEdgeWidth()}
        opacity={isDisabled ? 0.3 : 0.6}
        className="edge-main"
        markerEnd="url(#arrowhead)"
      />
    </g>
  );
};

const NodeGraph = ({ nodes, edges, onNodeClick: onNodeClickProp, disabledNodes }) => {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [nodePositions, setNodePositions] = useState(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);

  // Initialize physics simulation
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    const width = dimensions.width;
    const height = dimensions.height;

    // Create simulation with forces
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(150).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-800).distanceMax(300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(70).strength(0.7))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

    // Update node positions on tick
    simulation.on('tick', () => {
      const newPositions = new Map();
      nodes.forEach(node => {
        newPositions.set(node.id, { x: node.x || 0, y: node.y || 0 });
      });
      setNodePositions(newPositions);
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, dimensions]);

  // Set up drag behavior
  useEffect(() => {
    if (!svgRef.current || !simulationRef.current) return;

    const svg = d3Selection.select(svgRef.current);
    const simulation = simulationRef.current;

    const dragHandler = d3Drag.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        setIsDragging(true);
        setDraggedNode(d.id);
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        setIsDragging(false);
        setDraggedNode(null);
      });

    // Apply drag to all node groups
    svg.selectAll('.obsidian-node')
      .data(nodes)
      .call(dragHandler);

  }, [nodes, nodePositions]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="graph-placeholder">
        <div className="placeholder-content">
          <h3>No Course Selected</h3>
          <p>Select a course from the dropdown above to view its module graph.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="obsidian-graph-container" style={{ width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        {/* Define arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6366f1"
              opacity="0.6"
            />
          </marker>
        </defs>

        {/* Render edges first (so they appear behind nodes) */}
        {edges.map(edge => {
          const sourcePos = nodePositions.get(edge.source) || { x: 0, y: 0 };
          const targetPos = nodePositions.get(edge.target) || { x: 0, y: 0 };
          const isDisabled = disabledNodes.has(edge.source) || disabledNodes.has(edge.target);
          
          return (
            <ObsidianEdge
              key={edge.id}
              edge={edge}
              sourcePos={sourcePos}
              targetPos={targetPos}
              isDisabled={isDisabled}
            />
          );
        })}

        {/* Render nodes */}
        {nodes.map(node => {
          const position = nodePositions.get(node.id) || { x: 0, y: 0 };
          const isDisabled = disabledNodes.has(node.id);
          const isCurrentlyDragging = draggedNode === node.id;
          
          return (
            <ObsidianNode
              key={node.id}
              node={node}
              position={position}
              onNodeClick={onNodeClickProp}
              isDisabled={isDisabled}
              isDragging={isCurrentlyDragging}
            />
          );
        })}
      </svg>
      
      {/* Physics controls overlay */}
      <div className="physics-controls">
        <button
          onClick={() => {
            if (simulationRef.current) {
              simulationRef.current.alpha(0.5).restart();
            }
          }}
          className="physics-button"
        >
          🔄 Restart Physics
        </button>
      </div>
    </div>
  );
};

export default NodeGraph;

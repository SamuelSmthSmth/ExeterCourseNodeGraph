import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

const NodeGraph = ({ nodes, edges, onNodeClick, disabledNodes }) => {
  // Transform data for ReactFlow
  const reactFlowNodes = useMemo(() => {
    return nodes.map(node => ({
      id: node.id,
      type: node.type === 'course' ? 'input' : 'default',
      data: { 
        label: node.label,
        ...node.data,
        onClick: () => onNodeClick(node)
      },
      position: { x: 0, y: 0 }, // Will be auto-layouted
      className: `node-${node.type} ${disabledNodes.has(node.id) ? 'disabled' : ''}`,
      style: {
        background: node.type === 'course' ? '#4F46E5' : disabledNodes.has(node.id) ? '#9CA3AF' : '#10B981',
        color: 'white',
        border: '2px solid #374151',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
        opacity: disabledNodes.has(node.id) ? 0.5 : 1,
        cursor: 'pointer'
      }
    }));
  }, [nodes, disabledNodes, onNodeClick]);

  const reactFlowEdges = useMemo(() => {
    return edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: edge.type === 'prerequisite',
      style: {
        stroke: edge.type === 'prerequisite' ? '#EF4444' : edge.type === 'core' ? '#4F46E5' : '#10B981',
        strokeWidth: 2,
        opacity: disabledNodes.has(edge.source) || disabledNodes.has(edge.target) ? 0.3 : 1
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.type === 'prerequisite' ? '#EF4444' : edge.type === 'core' ? '#4F46E5' : '#10B981'
      },
      label: edge.type === 'prerequisite' ? 'Prerequisite' : edge.type === 'core' ? 'Core' : 'Optional'
    }));
  }, [edges, disabledNodes]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Update nodes when props change
  React.useEffect(() => {
    setNodes(reactFlowNodes);
  }, [reactFlowNodes, setNodes]);

  // Update edges when props change
  React.useEffect(() => {
    setEdges(reactFlowEdges);
  }, [reactFlowEdges, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback((event, node) => {
    if (node.data.onClick) {
      node.data.onClick();
    }
  }, []);

  // Auto-layout function (simple hierarchical layout)
  const layoutNodes = useCallback(() => {
    const courseNodes = flowNodes.filter(node => node.type === 'input');
    const moduleNodes = flowNodes.filter(node => node.type === 'default');
    
    const layoutedNodes = [];
    
    // Position course node at the top center
    courseNodes.forEach((node, index) => {
      layoutedNodes.push({
        ...node,
        position: { x: 400, y: 50 }
      });
    });

    // Position module nodes in a grid below
    moduleNodes.forEach((node, index) => {
      const cols = Math.ceil(Math.sqrt(moduleNodes.length));
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      layoutedNodes.push({
        ...node,
        position: { 
          x: 100 + col * 200, 
          y: 200 + row * 100 
        }
      });
    });

    setNodes(layoutedNodes);
  }, [flowNodes, setNodes]);

  // Auto-layout when nodes change
  React.useEffect(() => {
    if (flowNodes.length > 0) {
      layoutNodes();
    }
  }, [flowNodes.length]); // Only run when number of nodes changes

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
    <div className="node-graph" style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap
          nodeStrokeColor="#374151"
          nodeColor={(node) => {
            if (node.type === 'input') return '#4F46E5';
            return disabledNodes.has(node.id) ? '#9CA3AF' : '#10B981';
          }}
          nodeBorderRadius={2}
        />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default NodeGraph;

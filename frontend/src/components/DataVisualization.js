import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme, useAnalytics } from '../contexts/EnhancedContexts';

// Interactive Progress Dashboard
const ProgressDashboard = ({ 
  userProgress = {},
  courses = [],
  learningPaths = [],
  goals = []
}) => {
  const { theme } = useTheme();
  const { trackEvent } = useAnalytics();
  const [selectedTimeframe, setSelectedTimeframe] = useState('semester');
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationPhase(1), 100);
    return () => clearTimeout(timer);
  }, []);

  const progressData = {
    completed: userProgress.completedCourses?.length || 0,
    inProgress: userProgress.currentCourses?.length || 0,
    planned: userProgress.plannedCourses?.length || 0,
    totalCredits: userProgress.totalCredits || 0,
    targetCredits: userProgress.targetCredits || 120,
    gpa: userProgress.gpa || 0,
    streakDays: userProgress.streakDays || 0
  };

  const completionPercentage = (progressData.totalCredits / progressData.targetCredits) * 100;

  // Generate weekly progress data (simulated)
  const generateWeeklyProgress = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      week: `W${i + 1}`,
      study: Math.floor(Math.random() * 40) + 10,
      assignments: Math.floor(Math.random() * 8) + 2,
      reviews: Math.floor(Math.random() * 15) + 5
    }));
  };

  const weeklyData = generateWeeklyProgress();

  return (
    <div style={{
      padding: 'var(--space-6)',
      background: theme === 'dark' ? 'var(--neutral-800)' : 'white',
      borderRadius: 'var(--radius-xl)',
      border: `1px solid ${theme === 'dark' ? 'var(--neutral-700)' : 'var(--neutral-200)'}`,
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)'
      }}>
        <div>
          <h2 style={{
            margin: '0 0 var(--space-1) 0',
            fontSize: '1.75rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            📊 Learning Progress
          </h2>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)'
          }}>
            Track your academic journey and achievements
          </p>
        </div>
        
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)'}`,
            borderRadius: 'var(--radius-md)',
            background: theme === 'dark' ? 'var(--neutral-700)' : 'white',
            color: theme === 'dark' ? 'var(--neutral-100)' : 'var(--neutral-900)',
            fontSize: '0.875rem'
          }}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="semester">This Semester</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)'
      }}>
        {/* Overall Progress */}
        <div style={{
          padding: 'var(--space-5)',
          background: `linear-gradient(135deg, ${theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-50)'}, ${theme === 'dark' ? 'var(--neutral-700)' : 'white'})`,
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)'}`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-3)'
          }}>
            <span style={{
              fontSize: '2rem',
              background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🎯
            </span>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: theme === 'dark' ? 'var(--neutral-100)' : 'var(--neutral-900)',
                opacity: animationPhase ? 1 : 0,
                transform: animationPhase ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.8s ease'
              }}>
                {completionPercentage.toFixed(1)}%
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)'
              }}>
                Program Complete
              </div>
            </div>
          </div>
          
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)',
            marginBottom: 'var(--space-2)'
          }}>
            Overall Progress
          </div>
          
          <div style={{
            height: '8px',
            background: theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginBottom: 'var(--space-2)'
          }}>
            <div style={{
              height: '100%',
              width: animationPhase ? `${completionPercentage}%` : '0%',
              background: 'linear-gradient(90deg, var(--primary-500), var(--accent-500))',
              transition: 'width 1.2s ease-out 0.3s',
              borderRadius: 'var(--radius-full)'
            }} />
          </div>
          
          <div style={{
            fontSize: '0.875rem',
            color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-600)'
          }}>
            {progressData.totalCredits} of {progressData.targetCredits} credits
          </div>
        </div>

        {/* Courses Status */}
        <div style={{
          padding: 'var(--space-5)',
          background: `linear-gradient(135deg, ${theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-50)'}, ${theme === 'dark' ? 'var(--neutral-700)' : 'white'})`,
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)'}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 'var(--space-4)'
          }}>
            <span style={{ fontSize: '1.5rem', marginRight: 'var(--space-2)' }}>📚</span>
            <div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)'
              }}>
                Course Status
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.875rem',
                color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-600)'
              }}>
                Completed
              </span>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--success-500)'
              }}>
                {progressData.completed}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.875rem',
                color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-600)'
              }}>
                In Progress
              </span>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--warning-500)'
              }}>
                {progressData.inProgress}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.875rem',
                color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-600)'
              }}>
                Planned
              </span>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--info-500)'
              }}>
                {progressData.planned}
              </span>
            </div>
          </div>
        </div>

        {/* GPA Card */}
        <div style={{
          padding: 'var(--space-5)',
          background: `linear-gradient(135deg, ${theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-50)'}, ${theme === 'dark' ? 'var(--neutral-700)' : 'white'})`,
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)'}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>🏆</div>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: progressData.gpa >= 3.5 ? 'var(--success-500)' : 
                   progressData.gpa >= 3.0 ? 'var(--warning-500)' : 'var(--error-500)',
            marginBottom: 'var(--space-1)'
          }}>
            {progressData.gpa.toFixed(2)}
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)'
          }}>
            Current GPA
          </div>
        </div>

        {/* Study Streak */}
        <div style={{
          padding: 'var(--space-5)',
          background: `linear-gradient(135deg, ${theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-50)'}, ${theme === 'dark' ? 'var(--neutral-700)' : 'white'})`,
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)'}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>🔥</div>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'var(--accent-500)',
            marginBottom: 'var(--space-1)'
          }}>
            {progressData.streakDays}
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)'
          }}>
            Day Streak
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div style={{
        padding: 'var(--space-5)',
        background: theme === 'dark' ? 'var(--neutral-750)' : 'var(--neutral-50)',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)'}`,
        marginBottom: 'var(--space-6)'
      }}>
        <h3 style={{
          margin: '0 0 var(--space-4) 0',
          fontSize: '1.25rem',
          fontWeight: '600',
          color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)'
        }}>
          📈 Weekly Activity
        </h3>
        
        <div style={{ height: '200px', position: 'relative' }}>
          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={`${y}%`}
                x2="100%"
                y2={`${y}%`}
                stroke={theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)'}
                strokeWidth="1"
                opacity="0.3"
              />
            ))}
            
            {/* Study hours line */}
            <polyline
              fill="none"
              stroke="var(--primary-500)"
              strokeWidth="3"
              points={weeklyData.map((data, index) => 
                `${(index / (weeklyData.length - 1)) * 100}%,${100 - (data.study / 50) * 100}%`
              ).join(' ')}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))'
              }}
            />
            
            {/* Data points */}
            {weeklyData.map((data, index) => (
              <circle
                key={index}
                cx={`${(index / (weeklyData.length - 1)) * 100}%`}
                cy={`${100 - (data.study / 50) * 100}%`}
                r="4"
                fill="var(--primary-500)"
                stroke="white"
                strokeWidth="2"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                }}
              />
            ))}
          </svg>
          
          {/* X-axis labels */}
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)'
          }}>
            {weeklyData.map((data, index) => (
              <span key={index}>{data.week}</span>
            ))}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: 'var(--primary-500)',
              borderRadius: '50%'
            }} />
            <span style={{ color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-600)' }}>
              Study Hours
            </span>
          </div>
        </div>
      </div>

      {/* Achievements and Goals */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-6)'
      }}>
        {/* Recent Achievements */}
        <div>
          <h3 style={{
            margin: '0 0 var(--space-4) 0',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)'
          }}>
            🏅 Recent Achievements
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { icon: '🎯', title: 'Course Completed', desc: 'Finished CS101 with distinction', time: '2 days ago' },
              { icon: '🔥', title: '7-Day Streak', desc: 'Maintained consistent study schedule', time: '1 week ago' },
              { icon: '📚', title: 'Quiz Master', desc: 'Scored 95% on Data Structures quiz', time: '2 weeks ago' }
            ].map((achievement, index) => (
              <div
                key={index}
                style={{
                  padding: 'var(--space-4)',
                  background: theme === 'dark' ? 'var(--neutral-750)' : 'white',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)'
                }}
              >
                <div style={{
                  fontSize: '1.5rem',
                  background: 'var(--success-100)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {achievement.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    {achievement.title}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    {achievement.desc}
                  </div>
                  <div style={{
                    fontSize: '0.625rem',
                    color: theme === 'dark' ? 'var(--neutral-500)' : 'var(--neutral-500)'
                  }}>
                    {achievement.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Goals */}
        <div>
          <h3 style={{
            margin: '0 0 var(--space-4) 0',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)'
          }}>
            🎯 Current Goals
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { title: 'Complete Algorithm Course', progress: 75, target: '100%', due: 'Next week' },
              { title: 'Maintain 3.5+ GPA', progress: 88, target: '3.5', due: 'This semester' },
              { title: 'Study 20 hours/week', progress: 60, target: '20h', due: 'Weekly' }
            ].map((goal, index) => (
              <div
                key={index}
                style={{
                  padding: 'var(--space-4)',
                  background: theme === 'dark' ? 'var(--neutral-750)' : 'white',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)'}`
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-2)'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)'
                  }}>
                    {goal.title}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)'
                  }}>
                    {goal.progress}%
                  </div>
                </div>
                
                <div style={{
                  height: '6px',
                  background: theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-200)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  marginBottom: 'var(--space-2)'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${goal.progress}%`,
                    background: goal.progress >= 80 ? 'var(--success-500)' : 
                               goal.progress >= 50 ? 'var(--warning-500)' : 'var(--error-500)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: theme === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-600)'
                }}>
                  <span>Target: {goal.target}</span>
                  <span>Due: {goal.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive Network Visualization
const NetworkVisualization = ({ 
  graphData = { nodes: [], edges: [] },
  selectedNode = null,
  onNodeSelect,
  highlightedNodes = new Set(),
  className = ''
}) => {
  const { theme } = useTheme();
  const { trackEvent } = useAnalytics();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);

  // Physics simulation state
  const [simulation, setSimulation] = useState({
    nodes: [],
    edges: [],
    isRunning: false
  });

  // Initialize simulation
  useEffect(() => {
    if (!graphData.nodes.length) return;

    const simulationNodes = graphData.nodes.map(node => ({
      ...node,
      x: node.x || Math.random() * 800,
      y: node.y || Math.random() * 600,
      vx: 0,
      vy: 0,
      fx: null,
      fy: null
    }));

    setSimulation({
      nodes: simulationNodes,
      edges: graphData.edges,
      isRunning: true
    });
  }, [graphData]);

  // Physics simulation loop
  useEffect(() => {
    if (!simulation.isRunning) return;

    const animate = () => {
      const { nodes, edges } = simulation;
      
      // Apply forces
      nodes.forEach(node => {
        if (node.fx !== null) {
          node.x = node.fx;
          node.vx = 0;
        }
        if (node.fy !== null) {
          node.y = node.fy;
          node.vy = 0;
        }

        // Damping
        node.vx *= 0.99;
        node.vy *= 0.99;

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Boundary constraints
        node.x = Math.max(50, Math.min(750, node.x));
        node.y = Math.max(50, Math.min(550, node.y));
      });

      // Repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i];
          const node2 = nodes[j];
          const dx = node2.x - node1.x;
          const dy = node2.y - node1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100 && distance > 0) {
            const force = (100 - distance) / distance * 0.1;
            const fx = dx * force;
            const fy = dy * force;
            
            if (node1.fx === null) node1.vx -= fx;
            if (node1.fy === null) node1.vy -= fy;
            if (node2.fx === null) node2.vx += fx;
            if (node2.fy === null) node2.vy += fy;
          }
        }
      }

      // Spring forces for connected nodes
      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const targetDistance = 120;
          
          if (distance > 0) {
            const force = (distance - targetDistance) / distance * 0.05;
            const fx = dx * force;
            const fy = dy * force;
            
            if (source.fx === null) source.vx += fx;
            if (source.fy === null) source.vy += fy;
            if (target.fx === null) target.vx -= fx;
            if (target.fy === null) target.vy -= fy;
          }
        }
      });

      drawNetwork();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulation]);

  const drawNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Apply camera transform
    ctx.save();
    ctx.translate(width / 2 + cameraPosition.x, height / 2 + cameraPosition.y);
    ctx.scale(cameraPosition.zoom, cameraPosition.zoom);
    ctx.translate(-width / 2, -height / 2);

    // Draw edges
    ctx.strokeStyle = theme === 'dark' ? 'rgba(156, 163, 175, 0.4)' : 'rgba(107, 114, 128, 0.4)';
    ctx.lineWidth = 2;
    
    simulation.edges.forEach(edge => {
      const source = simulation.nodes.find(n => n.id === edge.source);
      const target = simulation.nodes.find(n => n.id === edge.target);
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    simulation.nodes.forEach(node => {
      const isSelected = selectedNode?.id === node.id;
      const isHighlighted = highlightedNodes.has(node.id);
      const isHovered = hoveredNode?.id === node.id;
      
      let radius = 20;
      let fillColor = theme === 'dark' ? '#3b82f6' : '#1d4ed8';
      
      if (isSelected) {
        radius = 25;
        fillColor = '#f59e0b';
      } else if (isHighlighted) {
        radius = 22;
        fillColor = '#10b981';
      } else if (isHovered) {
        radius = 23;
        fillColor = '#8b5cf6';
      }

      // Node shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      
      // Node body
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      
      ctx.restore();
      
      // Node border
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = theme === 'dark' ? 'white' : 'black';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const text = node.moduleCode || node.label || node.id;
      ctx.fillText(text, node.x, node.y);
      
      // Credits badge
      if (node.credits) {
        ctx.save();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(node.x + radius - 5, node.y - radius + 5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px system-ui';
        ctx.fillText(node.credits.toString(), node.x + radius - 5, node.y - radius + 5);
        ctx.restore();
      }
    });

    ctx.restore();
  };

  // Mouse event handlers
  const getNodeAtPosition = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const canvasX = (x - rect.left - canvas.width / 2 - cameraPosition.x) / cameraPosition.zoom + canvas.width / 2;
    const canvasY = (y - rect.top - canvas.height / 2 - cameraPosition.y) / cameraPosition.zoom + canvas.height / 2;
    
    return simulation.nodes.find(node => {
      const dx = canvasX - node.x;
      const dy = canvasY - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= (selectedNode?.id === node.id ? 25 : 20);
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging && draggedNode) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - canvas.width / 2 - cameraPosition.x) / cameraPosition.zoom + canvas.width / 2;
      const y = (e.clientY - rect.top - canvas.height / 2 - cameraPosition.y) / cameraPosition.zoom + canvas.height / 2;
      
      draggedNode.fx = x;
      draggedNode.fy = y;
      return;
    }

    const node = getNodeAtPosition(e.clientX, e.clientY);
    setHoveredNode(node);
    
    if (canvasRef.current) {
      canvasRef.current.style.cursor = node ? 'pointer' : 'default';
    }
  };

  const handleMouseDown = (e) => {
    const node = getNodeAtPosition(e.clientX, e.clientY);
    if (node) {
      setDraggedNode(node);
      setIsDragging(true);
      node.fx = node.x;
      node.fy = node.y;
    }
  };

  const handleMouseUp = (e) => {
    if (draggedNode && !isDragging) {
      // This was a click, not a drag
      onNodeSelect?.(draggedNode);
      trackEvent('node_selected', { nodeId: draggedNode.id });
    }
    
    if (draggedNode) {
      draggedNode.fx = null;
      draggedNode.fy = null;
    }
    
    setDraggedNode(null);
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setCameraPosition(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(3, prev.zoom * zoomFactor))
    }));
  };

  return (
    <div
      className={`network-visualization ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '600px',
        background: theme === 'dark' ? 'var(--neutral-900)' : 'var(--neutral-50)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: `2px solid ${theme === 'dark' ? 'var(--neutral-700)' : 'var(--neutral-200)'}`,
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: 'var(--space-4)',
        right: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)'
      }}>
        <button
          onClick={() => setCameraPosition(prev => ({ ...prev, zoom: prev.zoom * 1.2 }))}
          style={{
            width: '40px',
            height: '40px',
            background: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: theme === 'dark' ? 'white' : 'black',
            cursor: 'pointer',
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          +
        </button>
        <button
          onClick={() => setCameraPosition(prev => ({ ...prev, zoom: prev.zoom * 0.8 }))}
          style={{
            width: '40px',
            height: '40px',
            background: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: theme === 'dark' ? 'white' : 'black',
            cursor: 'pointer',
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          −
        </button>
        <button
          onClick={() => setCameraPosition({ x: 0, y: 0, zoom: 1 })}
          style={{
            width: '40px',
            height: '40px',
            background: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: theme === 'dark' ? 'white' : 'black',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🎯
        </button>
      </div>

      {/* Node Info Tooltip */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          top: 'var(--space-4)',
          left: 'var(--space-4)',
          padding: 'var(--space-3) var(--space-4)',
          background: theme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)'}`,
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(8px)',
          minWidth: '200px'
        }}>
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: theme === 'dark' ? 'white' : 'black',
            marginBottom: 'var(--space-2)'
          }}>
            {hoveredNode.moduleCode || hoveredNode.label}
          </div>
          {hoveredNode.description && (
            <div style={{
              fontSize: '0.875rem',
              color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-600)',
              marginBottom: 'var(--space-2)'
            }}>
              {hoveredNode.description}
            </div>
          )}
          <div style={{
            display: 'flex',
            gap: 'var(--space-2)',
            fontSize: '0.75rem'
          }}>
            {hoveredNode.credits && (
              <span style={{
                background: 'var(--primary-500)',
                color: 'white',
                padding: '2px var(--space-1)',
                borderRadius: 'var(--radius-xs)'
              }}>
                {hoveredNode.credits} credits
              </span>
            )}
            {hoveredNode.level && (
              <span style={{
                background: 'var(--accent-500)',
                color: 'white',
                padding: '2px var(--space-1)',
                borderRadius: 'var(--radius-xs)'
              }}>
                Level {hoveredNode.level}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 'var(--space-4)',
        left: 'var(--space-4)',
        padding: 'var(--space-3)',
        background: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${theme === 'dark' ? 'var(--neutral-600)' : 'var(--neutral-300)'}`,
        fontSize: '0.75rem'
      }}>
        <div style={{
          color: theme === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-800)',
          fontWeight: '600',
          marginBottom: 'var(--space-2)'
        }}>
          Network Legend
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          color: theme === 'dark' ? 'var(--neutral-300)' : 'var(--neutral-600)'
        }}>
          <div>• Drag nodes to rearrange</div>
          <div>• Scroll to zoom</div>
          <div>• Click to select</div>
        </div>
      </div>
    </div>
  );
};

export { ProgressDashboard, NetworkVisualization };

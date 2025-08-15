import React, { useState, useEffect } from 'react';
import '../styles/PerformanceDashboard.css';

const PerformanceDashboard = ({ graphData, selectedCourse }) => {
  const [stats, setStats] = useState({
    totalModules: 0,
    prerequisites: 0,
    yearDistribution: {},
    completionRate: 0,
    difficulty: 'Unknown'
  });

  useEffect(() => {
    if (graphData.nodes && graphData.edges) {
      calculateStats();
    }
  }, [graphData, selectedCourse]);

  const calculateStats = () => {
    const modules = graphData.nodes.filter(node => node.type === 'module');
    const courses = graphData.nodes.filter(node => node.type === 'course');
    
    // Calculate year distribution
    const yearDist = {};
    modules.forEach(module => {
      const yearMatch = module.label.match(/\\d/);
      const year = yearMatch ? `Year ${yearMatch[0]}` : 'Other';
      yearDist[year] = (yearDist[year] || 0) + 1;
    });

    // Calculate difficulty based on prerequisites
    const avgPrereqs = graphData.edges.length / Math.max(modules.length, 1);
    let difficulty = 'Easy';
    if (avgPrereqs > 2) difficulty = 'Hard';
    else if (avgPrereqs > 1) difficulty = 'Medium';

    // Simulate completion rate
    const completionRate = Math.round(75 + Math.random() * 20);

    setStats({
      totalModules: modules.length,
      totalCourses: courses.length,
      prerequisites: graphData.edges.length,
      yearDistribution: yearDist,
      completionRate,
      difficulty,
      avgPrerequisites: avgPrereqs.toFixed(1)
    });
  };

  return (
    <div className="performance-dashboard">
      <h3>📊 Course Analytics</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalModules}</div>
          <div className="stat-label">Total Modules</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.prerequisites}</div>
          <div className="stat-label">Prerequisites</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.completionRate}%</div>
          <div className="stat-label">Success Rate</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.difficulty}</div>
          <div className="stat-label">Difficulty</div>
        </div>
      </div>

      <div className="year-distribution">
        <h4>Year Distribution</h4>
        <div className="year-bars">
          {Object.entries(stats.yearDistribution).map(([year, count]) => (
            <div key={year} className="year-bar">
              <div className="bar-label">{year}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{
                    width: `${(count / Math.max(...Object.values(stats.yearDistribution))) * 100}%`
                  }}
                ></div>
              </div>
              <div className="bar-value">{count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="insights">
        <h4>🎯 Quick Insights</h4>
        <ul>
          <li>Average {stats.avgPrerequisites} prerequisites per module</li>
          <li>Most modules in {Object.keys(stats.yearDistribution).reduce((a, b) => 
            stats.yearDistribution[a] > stats.yearDistribution[b] ? a : b, 'Year 1')}</li>
          <li>{stats.difficulty} difficulty level overall</li>
          <li>{stats.totalModules > 6 ? 'Comprehensive' : 'Focused'} curriculum</li>
        </ul>
      </div>
    </div>
  );
};

export default PerformanceDashboard;

import React from 'react';
import './LoadingStates.css';

export const SkeletonLoader = ({ width = '100%', height = '20px', className = '' }) => (
  <div 
    className={`skeleton-loader ${className}`}
    style={{ width, height }}
  />
);

export const CourseCardSkeleton = () => (
  <div className="course-card-skeleton">
    <SkeletonLoader height="24px" width="200px" />
    <SkeletonLoader height="16px" width="120px" />
    <SkeletonLoader height="16px" width="80px" />
  </div>
);

export const GraphSkeleton = () => (
  <div className="graph-skeleton">
    <div className="graph-skeleton-nodes">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton-node" style={{
          left: `${20 + (i % 3) * 30}%`,
          top: `${30 + Math.floor(i / 3) * 40}%`
        }}>
          <SkeletonLoader width="80px" height="40px" />
        </div>
      ))}
    </div>
    <div className="graph-skeleton-info">
      <SkeletonLoader height="20px" width="150px" />
      <SkeletonLoader height="16px" width="100px" />
    </div>
  </div>
);

export const PulseLoader = ({ size = 'medium', color = 'primary' }) => (
  <div className={`pulse-loader pulse-${size} pulse-${color}`}>
    <div className="pulse-dot"></div>
    <div className="pulse-dot"></div>
    <div className="pulse-dot"></div>
  </div>
);

export const SpinnerLoader = ({ size = 'medium', text = '' }) => (
  <div className="spinner-container">
    <div className={`modern-spinner spinner-${size}`}>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
    {text && <p className="spinner-text">{text}</p>}
  </div>
);

export const ProgressBar = ({ progress = 0, text = '', animated = true }) => (
  <div className="progress-container">
    {text && <div className="progress-text">{text}</div>}
    <div className="progress-bar">
      <div 
        className={`progress-fill ${animated ? 'animated' : ''}`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  </div>
);

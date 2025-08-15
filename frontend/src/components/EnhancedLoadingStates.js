import React, { useState, useEffect, useCallback, useRef } from 'react';

// Enhanced Loading Components with Modern Design
export const SkeletonLoader = ({ width = '100%', height = '20px', className = '' }) => (
  <div 
    className={`skeleton-loader ${className}`}
    style={{ 
      width, 
      height,
      background: 'linear-gradient(90deg, var(--neutral-200) 25%, var(--neutral-100) 50%, var(--neutral-200) 75%)',
      backgroundSize: '200% 100%',
      borderRadius: 'var(--radius-md)',
      animation: 'skeleton-shimmer 1.5s ease-in-out infinite'
    }}
  />
);

export const PulseLoader = ({ size = 40, color = 'var(--primary-500)', className = '' }) => (
  <div className={`pulse-loader ${className}`} style={{ width: size, height: size }}>
    <div 
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: color,
        animation: 'pulse-scale 1.5s ease-in-out infinite'
      }}
    />
  </div>
);

export const SpinnerLoader = ({ size = 40, thickness = 4, color = 'var(--primary-500)', className = '' }) => (
  <div 
    className={`spinner-loader ${className}`}
    style={{
      width: size,
      height: size,
      border: `${thickness}px solid var(--neutral-200)`,
      borderTop: `${thickness}px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}
  />
);

export const DotsLoader = ({ size = 8, color = 'var(--primary-500)', className = '' }) => (
  <div className={`dots-loader ${className}`} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
    {[0, 1, 2].map(i => (
      <div
        key={i}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          animation: `dots-bounce 1.4s ease-in-out infinite both`,
          animationDelay: `${i * 0.16}s`
        }}
      />
    ))}
  </div>
);

export const ProgressLoader = ({ progress = 0, height = 4, color = 'var(--primary-500)', className = '' }) => (
  <div 
    className={`progress-loader ${className}`}
    style={{
      width: '100%',
      height,
      background: 'var(--neutral-200)',
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden'
    }}
  >
    <div 
      style={{
        width: `${progress}%`,
        height: '100%',
        background: `linear-gradient(90deg, ${color}, var(--accent-500))`,
        borderRadius: 'var(--radius-full)',
        transition: 'width 0.3s ease-out',
        position: 'relative'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          animation: 'progress-shimmer 1.5s ease-in-out infinite'
        }}
      />
    </div>
  </div>
);

export const WaveLoader = ({ color = 'var(--primary-500)', className = '' }) => (
  <div className={`wave-loader ${className}`} style={{ display: 'flex', gap: '2px', alignItems: 'end' }}>
    {[0, 1, 2, 3, 4].map(i => (
      <div
        key={i}
        style={{
          width: '3px',
          height: '20px',
          background: color,
          borderRadius: 'var(--radius-full)',
          animation: `wave-scale 1.2s ease-in-out infinite`,
          animationDelay: `${i * 0.1}s`
        }}
      />
    ))}
  </div>
);

// Enhanced Skeleton Components for Specific Content
export const GraphSkeleton = ({ className = '' }) => (
  <div className={`graph-skeleton ${className}`} style={{ padding: 'var(--space-8)' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonLoader width="200px" height="32px" />
        <SkeletonLoader width="100px" height="24px" />
      </div>
      
      {/* Graph area skeleton */}
      <div style={{ position: 'relative', height: '400px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-2xl)' }}>
        {/* Fake nodes */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--neutral-200)',
              left: `${20 + (i % 3) * 30}%`,
              top: `${20 + Math.floor(i / 3) * 40}%`,
              animation: `skeleton-pulse 2s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
        
        {/* Fake connections */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '2px',
              height: '60px',
              background: 'var(--neutral-300)',
              left: `${35 + i * 15}%`,
              top: `${30 + i * 10}%`,
              transform: `rotate(${i * 30}deg)`,
              animation: `skeleton-pulse 2s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>
      
      {/* Stats skeleton */}
      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <SkeletonLoader width="120px" height="60px" />
        <SkeletonLoader width="120px" height="60px" />
        <SkeletonLoader width="120px" height="60px" />
      </div>
    </div>
  </div>
);

export const CourseListSkeleton = ({ count = 5, className = '' }) => (
  <div className={`course-list-skeleton ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
    {[...Array(count)].map((_, i) => (
      <div 
        key={i} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-3)', 
          padding: 'var(--space-4)',
          background: 'var(--neutral-50)',
          borderRadius: 'var(--radius-lg)',
          animation: `skeleton-fade-in 0.5s ease-out`,
          animationDelay: `${i * 0.1}s`,
          animationFillMode: 'both'
        }}
      >
        <SkeletonLoader width="50px" height="50px" style={{ borderRadius: '50%' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <SkeletonLoader width="70%" height="20px" />
          <SkeletonLoader width="50%" height="16px" />
          <SkeletonLoader width="30%" height="14px" />
        </div>
      </div>
    ))}
  </div>
);

export const SidebarSkeleton = ({ className = '' }) => (
  <div className={`sidebar-skeleton ${className}`} style={{ padding: 'var(--space-6)' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonLoader width="150px" height="28px" />
        <SkeletonLoader width="24px" height="24px" style={{ borderRadius: '50%' }} />
      </div>
      
      {/* Content sections */}
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <SkeletonLoader width="100px" height="20px" />
          <SkeletonLoader width="100%" height="16px" />
          <SkeletonLoader width="80%" height="16px" />
          <SkeletonLoader width="60%" height="16px" />
        </div>
      ))}
    </div>
  </div>
);

// Enhanced Loading States with Context
export const LoadingStateProvider = ({ children }) => {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [progress, setProgress] = useState(0);
  
  const showLoading = useCallback((message = 'Loading...') => {
    setLoadingMessage(message);
    setGlobalLoading(true);
    setProgress(0);
  }, []);
  
  const hideLoading = useCallback(() => {
    setGlobalLoading(false);
    setProgress(100);
    setTimeout(() => setProgress(0), 300);
  }, []);
  
  const updateProgress = useCallback((value) => {
    setProgress(Math.max(0, Math.min(100, value)));
  }, []);
  
  return (
    <LoadingContext.Provider value={{ 
      globalLoading, 
      loadingMessage, 
      progress,
      showLoading, 
      hideLoading, 
      updateProgress 
    }}>
      {children}
      {globalLoading && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fade-in 0.3s ease-out'
          }}
        >
          <div 
            style={{
              background: 'white',
              padding: 'var(--space-8)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-2xl)',
              textAlign: 'center',
              minWidth: '300px',
              animation: 'scale-in 0.3s ease-out'
            }}
          >
            <SpinnerLoader size={50} />
            <p style={{ marginTop: 'var(--space-4)', fontSize: '1.1rem', fontWeight: '500' }}>
              {loadingMessage}
            </p>
            {progress > 0 && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <ProgressLoader progress={progress} height={6} />
                <p style={{ marginTop: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--neutral-600)' }}>
                  {progress}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

// Context for loading states
const LoadingContext = React.createContext();

export const useLoading = () => {
  const context = React.useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingStateProvider');
  }
  return context;
};

// CSS styles that should be added to a stylesheet
export const LoadingStyles = `
@keyframes skeleton-shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@keyframes skeleton-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-scale {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes dots-bounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

@keyframes progress-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes wave-scale {
  0%, 40%, 100% { transform: scaleY(0.4); }
  20% { transform: scaleY(1); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.skeleton-loader,
.pulse-loader,
.spinner-loader,
.dots-loader,
.progress-loader,
.wave-loader {
  will-change: transform, opacity;
}
`;

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNotifications } from './EnhancedNotificationSystem';

// Enhanced Modern Button Component
const ModernButton = ({ 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  pulse = false,
  className = '',
  children,
  onClick,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const getButtonStyles = () => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      border: 'none',
      borderRadius: 'var(--radius-lg)',
      fontFamily: 'var(--font-body)',
      fontWeight: '600',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: 'all var(--transition-normal)',
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none',
      textDecoration: 'none',
      width: fullWidth ? '100%' : 'auto',
      transform: isPressed ? 'scale(0.98)' : 'scale(1)',
      opacity: disabled ? 0.6 : 1
    };

    // Size variations
    const sizeStyles = {
      xs: { padding: 'var(--space-1) var(--space-2)', fontSize: '0.75rem', minHeight: '28px' },
      sm: { padding: 'var(--space-2) var(--space-3)', fontSize: '0.8rem', minHeight: '32px' },
      md: { padding: 'var(--space-3) var(--space-4)', fontSize: '0.875rem', minHeight: '40px' },
      lg: { padding: 'var(--space-4) var(--space-6)', fontSize: '1rem', minHeight: '48px' },
      xl: { padding: 'var(--space-5) var(--space-8)', fontSize: '1.125rem', minHeight: '56px' }
    };

    // Variant styles
    const variantStyles = {
      primary: {
        background: 'var(--gradient-primary)',
        color: 'white',
        boxShadow: 'var(--shadow-md)'
      },
      secondary: {
        background: 'var(--neutral-100)',
        color: 'var(--neutral-700)',
        border: '1px solid var(--neutral-200)'
      },
      outline: {
        background: 'transparent',
        color: 'var(--primary-600)',
        border: '2px solid var(--primary-600)'
      },
      ghost: {
        background: 'transparent',
        color: 'var(--neutral-600)'
      },
      danger: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        boxShadow: 'var(--shadow-md)'
      },
      success: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        boxShadow: 'var(--shadow-md)'
      },
      glass: {
        background: 'var(--gradient-glass)',
        backdropFilter: 'var(--blur-md)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        boxShadow: 'var(--shadow-lg)'
      }
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      animation: pulse ? 'pulse-glow 2s ease-in-out infinite' : 'none'
    };
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      className={`modern-button ${className}`}
      style={getButtonStyles()}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Ripple effect overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          transform: 'translateX(-100%)',
          transition: 'transform 0.6s',
          pointerEvents: 'none'
        }}
        className={isPressed ? 'ripple-active' : ''}
      />
      
      {/* Loading spinner */}
      {loading && (
        <div 
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}
      
      {/* Icon */}
      {icon && iconPosition === 'left' && !loading && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
      
      {/* Content */}
      {children && (
        <span style={{ lineHeight: 1 }}>
          {children}
        </span>
      )}
      
      {/* Icon right */}
      {icon && iconPosition === 'right' && !loading && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
    </button>
  );
};

// Enhanced Course Selector with Search and Advanced Features
const EnhancedCourseSelector = ({ 
  courses = [], 
  selectedCourse, 
  onCourseSelect, 
  loading = false,
  placeholder = "Search and select a course...",
  showRecent = true,
  showFavorites = true,
  maxRecent = 5
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentCourses, setRecentCourses] = useState([]);
  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [focusedCourse, setFocusedCourse] = useState(null);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  
  const { showSuccess, showInfo } = useNotifications();

  // Load stored data on mount
  useEffect(() => {
    if (showRecent) {
      const stored = localStorage.getItem('recentCourses');
      if (stored) {
        try {
          setRecentCourses(JSON.parse(stored));
        } catch (e) {
          console.warn('Failed to parse recent courses:', e);
        }
      }
    }
    
    if (showFavorites) {
      const stored = localStorage.getItem('favoriteCourses');
      if (stored) {
        try {
          setFavoriteCourses(JSON.parse(stored));
        } catch (e) {
          console.warn('Failed to parse favorite courses:', e);
        }
      }
    }
  }, [showRecent, showFavorites]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    
    const term = searchTerm.toLowerCase();
    return courses.filter(course => 
      course.courseName?.toLowerCase().includes(term) ||
      course.courseCode?.toLowerCase().includes(term) ||
      course.department?.toLowerCase().includes(term) ||
      course.degree?.toLowerCase().includes(term)
    ).sort((a, b) => {
      // Prioritize exact matches in course code
      const aCodeMatch = a.courseCode?.toLowerCase().startsWith(term);
      const bCodeMatch = b.courseCode?.toLowerCase().startsWith(term);
      if (aCodeMatch && !bCodeMatch) return -1;
      if (!aCodeMatch && bCodeMatch) return 1;
      
      // Then prioritize course name matches
      const aNameMatch = a.courseName?.toLowerCase().startsWith(term);
      const bNameMatch = b.courseName?.toLowerCase().startsWith(term);
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      return 0;
    });
  }, [courses, searchTerm]);

  // Get suggested courses (recent + favorites + popular)
  const suggestedCourses = useMemo(() => {
    if (searchTerm.trim()) return [];
    
    const suggestions = [];
    
    // Add favorites first
    if (showFavorites && favoriteCourses.length > 0) {
      suggestions.push({
        label: '⭐ Favorites',
        courses: favoriteCourses.slice(0, 3)
      });
    }
    
    // Add recent courses
    if (showRecent && recentCourses.length > 0) {
      suggestions.push({
        label: '🕒 Recent',
        courses: recentCourses.slice(0, maxRecent)
      });
    }
    
    // Add popular courses (mock data for now)
    const popular = courses.filter(c => 
      !recentCourses.find(r => r.courseCode === c.courseCode) &&
      !favoriteCourses.find(f => f.courseCode === c.courseCode)
    ).slice(0, 3);
    
    if (popular.length > 0) {
      suggestions.push({
        label: '🔥 Popular',
        courses: popular
      });
    }
    
    return suggestions;
  }, [courses, recentCourses, favoriteCourses, searchTerm, showRecent, showFavorites, maxRecent]);

  // Handle course selection
  const handleCourseSelect = useCallback((course) => {
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);
    
    // Add to recent courses
    if (showRecent) {
      const newRecent = [
        course,
        ...recentCourses.filter(r => r.courseCode !== course.courseCode)
      ].slice(0, maxRecent);
      
      setRecentCourses(newRecent);
      localStorage.setItem('recentCourses', JSON.stringify(newRecent));
    }
    
    onCourseSelect?.(course.courseCode);
    showInfo(`Selected ${course.courseName}`, { 
      title: 'Course Selected',
      duration: 2000 
    });
  }, [recentCourses, maxRecent, showRecent, onCourseSelect, showInfo]);

  // Toggle favorite
  const toggleFavorite = useCallback((course, e) => {
    e.stopPropagation();
    
    const isFavorite = favoriteCourses.find(f => f.courseCode === course.courseCode);
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favoriteCourses.filter(f => f.courseCode !== course.courseCode);
      showInfo(`Removed ${course.courseName} from favorites`);
    } else {
      newFavorites = [course, ...favoriteCourses];
      showSuccess(`Added ${course.courseName} to favorites`);
    }
    
    setFavoriteCourses(newFavorites);
    localStorage.setItem('favoriteCourses', JSON.stringify(newFavorites));
  }, [favoriteCourses, showInfo, showSuccess]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    
    const allCourses = searchTerm 
      ? filteredCourses 
      : suggestedCourses.flatMap(group => group.courses);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allCourses.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : allCourses.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && allCourses[selectedIndex]) {
          handleCourseSelect(allCourses[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, searchTerm, filteredCourses, suggestedCourses, selectedIndex, handleCourseSelect]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Course item component
  const CourseItem = ({ course, isSelected, onClick }) => {
    const isFavorite = favoriteCourses.find(f => f.courseCode === course.courseCode);
    
    return (
      <div
        style={{
          padding: 'var(--space-3)',
          cursor: 'pointer',
          background: isSelected ? 'var(--primary-50)' : 'transparent',
          borderRadius: 'var(--radius-md)',
          margin: '0 var(--space-2)',
          transition: 'var(--transition-fast)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)'
        }}
        onClick={() => onClick(course)}
        onMouseEnter={() => setFocusedCourse(course)}
        onMouseLeave={() => setFocusedCourse(null)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: '600',
            fontSize: '0.875rem',
            color: 'var(--neutral-900)',
            marginBottom: 'var(--space-1)'
          }}>
            {course.courseCode} - {course.courseName}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--neutral-600)',
            display: 'flex',
            gap: 'var(--space-2)'
          }}>
            <span>{course.degree}</span>
            {course.department && (
              <>
                <span>•</span>
                <span>{course.department}</span>
              </>
            )}
          </div>
        </div>
        
        {showFavorites && (
          <button
            onClick={(e) => toggleFavorite(course, e)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isFavorite ? 'var(--yellow-500)' : 'var(--neutral-400)',
              fontSize: '1.2rem',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-md)',
              transition: 'var(--transition-fast)'
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '⭐' : '☆'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'Loading courses...' : placeholder}
          disabled={loading}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            paddingRight: 'var(--space-12)',
            border: '2px solid var(--neutral-200)',
            borderRadius: 'var(--radius-xl)',
            fontSize: '0.875rem',
            background: 'white',
            transition: 'var(--transition-normal)',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary-400)';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--neutral-200)';
            e.target.style.boxShadow = 'none';
          }}
        />
        
        {/* Search Icon / Loading */}
        <div style={{
          position: 'absolute',
          right: 'var(--space-3)',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--neutral-400)'
        }}>
          {loading ? (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !loading && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--space-2))',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid var(--neutral-200)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto',
            animation: 'dropdown-appear 0.2s ease-out'
          }}
        >
          {searchTerm ? (
            // Filtered results
            filteredCourses.length > 0 ? (
              <div style={{ padding: 'var(--space-2) 0' }}>
                <div style={{
                  padding: 'var(--space-2) var(--space-4)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--neutral-500)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
                </div>
                {filteredCourses.map((course, index) => (
                  <CourseItem
                    key={course.courseCode}
                    course={course}
                    isSelected={index === selectedIndex}
                    onClick={handleCourseSelect}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                padding: 'var(--space-8)',
                textAlign: 'center',
                color: 'var(--neutral-500)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🔍</div>
                <div>No courses found for "{searchTerm}"</div>
              </div>
            )
          ) : (
            // Suggested courses
            suggestedCourses.length > 0 ? (
              <div style={{ padding: 'var(--space-2) 0' }}>
                {suggestedCourses.map((group, groupIndex) => (
                  <div key={group.label}>
                    <div style={{
                      padding: 'var(--space-2) var(--space-4)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--neutral-500)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}>
                      {group.label}
                    </div>
                    {group.courses.map((course, courseIndex) => (
                      <CourseItem
                        key={course.courseCode}
                        course={course}
                        isSelected={false}
                        onClick={handleCourseSelect}
                      />
                    ))}
                    {groupIndex < suggestedCourses.length - 1 && (
                      <div style={{
                        height: '1px',
                        background: 'var(--neutral-200)',
                        margin: 'var(--space-2)'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: 'var(--space-8)',
                textAlign: 'center',
                color: 'var(--neutral-500)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📚</div>
                <div>Start typing to search courses</div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Quick Actions with More Features
const EnhancedQuickActions = ({
  graphData,
  selectedCourse,
  onRandomCourse,
  onClearGraph,
  onZoomFit,
  onToggleAnimations,
  onExportGraph,
  onTogglePhysics,
  animationsEnabled = true,
  physicsEnabled = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const { showSuccess, showInfo } = useNotifications();

  const actions = [
    {
      id: 'random',
      icon: '🎲',
      label: 'Random Course',
      tooltip: 'Select a random course to explore',
      onClick: () => {
        onRandomCourse?.();
        showInfo('Selecting a random course for you!');
      }
    },
    {
      id: 'zoom',
      icon: '🔍',
      label: 'Zoom to Fit',
      tooltip: 'Zoom to fit all nodes in view',
      onClick: () => {
        onZoomFit?.();
        showSuccess('Zoomed to fit all nodes');
      }
    },
    {
      id: 'animations',
      icon: animationsEnabled ? '⏸️' : '▶️',
      label: animationsEnabled ? 'Pause Animations' : 'Play Animations',
      tooltip: `${animationsEnabled ? 'Pause' : 'Resume'} graph animations`,
      onClick: () => {
        onToggleAnimations?.();
        showInfo(`Animations ${!animationsEnabled ? 'enabled' : 'disabled'}`);
      }
    },
    {
      id: 'physics',
      icon: physicsEnabled ? '🌊' : '❄️',
      label: physicsEnabled ? 'Freeze Physics' : 'Enable Physics',
      tooltip: `${physicsEnabled ? 'Freeze' : 'Enable'} physics simulation`,
      onClick: () => {
        onTogglePhysics?.();
        showInfo(`Physics ${!physicsEnabled ? 'enabled' : 'disabled'}`);
      }
    },
    {
      id: 'export',
      icon: '📤',
      label: 'Export Graph',
      tooltip: 'Export graph as image or data',
      onClick: () => {
        onExportGraph?.();
        showSuccess('Graph export initiated');
      }
    },
    {
      id: 'clear',
      icon: '🧹',
      label: 'Clear Graph',
      tooltip: 'Clear the current graph',
      onClick: () => {
        onClearGraph?.();
        showInfo('Graph cleared');
      },
      variant: 'danger'
    }
  ];

  const stats = {
    nodes: graphData?.nodes?.length || 0,
    edges: graphData?.edges?.length || 0,
    course: selectedCourse?.courseName || 'None'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 'var(--space-6)',
      right: 'var(--space-6)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 'var(--space-3)'
    }}>
      {/* Stats Panel */}
      {isExpanded && stats.nodes > 0 && (
        <div style={{
          background: 'var(--gradient-glass)',
          backdropFilter: 'var(--blur-md)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-4)',
          minWidth: '200px',
          animation: 'slide-in-up 0.3s ease-out'
        }}>
          <h4 style={{
            margin: '0 0 var(--space-3) 0',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'white'
          }}>
            📊 Graph Stats
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: '0.8rem' }}>
              <span>Nodes:</span>
              <span style={{ fontWeight: '600' }}>{stats.nodes}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: '0.8rem' }}>
              <span>Connections:</span>
              <span style={{ fontWeight: '600' }}>{stats.edges}</span>
            </div>
            <div style={{ 
              paddingTop: 'var(--space-2)', 
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              Course: {stats.course}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isExpanded && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          animation: 'slide-in-up 0.3s ease-out'
        }}>
          {actions.map((action, index) => (
            <div key={action.id} style={{ position: 'relative' }}>
              <ModernButton
                variant={action.variant || 'glass'}
                size="md"
                onClick={action.onClick}
                onMouseEnter={() => setShowTooltip(action.id)}
                onMouseLeave={() => setShowTooltip(null)}
                style={{
                  minWidth: '200px',
                  justifyContent: 'flex-start',
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{action.icon}</span>
                <span>{action.label}</span>
              </ModernButton>
              
              {/* Tooltip */}
              {showTooltip === action.id && (
                <div style={{
                  position: 'absolute',
                  right: '100%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  marginRight: 'var(--space-3)',
                  background: 'var(--neutral-900)',
                  color: 'white',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  boxShadow: 'var(--shadow-lg)',
                  animation: 'scale-in 0.2s ease-out'
                }}>
                  {action.tooltip}
                  <div style={{
                    position: 'absolute',
                    left: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid var(--neutral-900)',
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent'
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Toggle Button */}
      <ModernButton
        variant="primary"
        size="lg"
        onClick={() => setIsExpanded(!isExpanded)}
        pulse={!isExpanded}
        style={{
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          boxShadow: 'var(--shadow-xl)',
          transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>
          {isExpanded ? '✕' : '⚡'}
        </span>
      </ModernButton>
    </div>
  );
};

export { ModernButton, EnhancedCourseSelector, EnhancedQuickActions };

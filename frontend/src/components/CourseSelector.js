import React, { useState, useRef, useEffect } from 'react';
import { PulseLoader } from './LoadingStates';

const CourseSelector = ({ courses, selectedCourse, onCourseSelect, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentCourses, setRecentCourses] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Load recent courses from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentCourses') || '[]');
    setRecentCourses(recent);
  }, []);

  const filteredCourses = courses.filter(course => {
    const searchLower = searchTerm.toLowerCase();
    return (
      course.courseName.toLowerCase().includes(searchLower) ||
      course.courseCode.toLowerCase().includes(searchLower) ||
      course.degree.toLowerCase().includes(searchLower) ||
      course.department?.toLowerCase().includes(searchLower)
    );
  });

  // Group courses by department for better organization
  const groupedCourses = filteredCourses.reduce((acc, course) => {
    const dept = course.department || 'Other';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(course);
    return acc;
  }, {});

  // Get suggested courses (recent + popular)
  const suggestedCourses = searchTerm ? [] : [
    ...recentCourses.slice(0, 3),
    ...courses.filter(c => !recentCourses.find(r => r.courseCode === c.courseCode)).slice(0, 5)
  ];

  const handleCourseClick = (course) => {
    onCourseSelect(course.courseCode);
    setIsOpen(false);
    setSearchTerm('');
    setSelectedIndex(-1);
    
    // Add to recent courses
    const updatedRecent = [course, ...recentCourses.filter(r => r.courseCode !== course.courseCode)].slice(0, 5);
    setRecentCourses(updatedRecent);
    localStorage.setItem('recentCourses', JSON.stringify(updatedRecent));
  };

  const handleKeyDown = (e) => {
    const items = searchTerm ? filteredCourses : suggestedCourses;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? items.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleCourseClick(items[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedIndex(-1);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const CourseItem = ({ course, index, isRecent = false }) => (
    <div
      className={`course-item ${index === selectedIndex ? 'selected' : ''} ${isRecent ? 'recent' : ''}`}
      onClick={() => handleCourseClick(course)}
      onMouseEnter={() => setSelectedIndex(index)}
    >
      <div className="course-header">
        <div className="course-name">{course.courseName}</div>
        {isRecent && <span className="recent-badge">Recent</span>}
      </div>
      <div className="course-details">
        <span className="course-code">{course.courseCode}</span>
        <span className="separator">•</span>
        <span className="course-degree">{course.degree}</span>
        {course.department && (
          <>
            <span className="separator">•</span>
            <span className="course-department">{course.department}</span>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="course-selector" ref={dropdownRef}>
      <div className="selector-container">
        <button
          className={`selector-button ${isOpen ? 'open' : ''} ${loading ? 'loading' : ''}`}
          onClick={toggleDropdown}
          disabled={loading}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="button-content">
            {loading ? (
              <div className="loading-content">
                <PulseLoader size="small" color="primary" />
                <span>Loading courses...</span>
              </div>
            ) : selectedCourse ? (
              <div className="selected-course">
                <div className="selected-name">{selectedCourse.courseName}</div>
                <div className="selected-details">{selectedCourse.courseCode} • {selectedCourse.degree}</div>
              </div>
            ) : (
              <span className="placeholder">Select a course...</span>
            )}
          </div>
          <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="dropdown-content">
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search courses, departments, or degrees..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    className="clear-search"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedIndex(-1);
                      inputRef.current?.focus();
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="courses-list">
              {loading ? (
                <div className="loading-state">
                  <PulseLoader size="medium" color="primary" />
                  <p>Loading courses...</p>
                </div>
              ) : searchTerm ? (
                // Search results
                Object.keys(groupedCourses).length > 0 ? (
                  <>
                    <div className="results-summary">
                      {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
                    </div>
                    {Object.entries(groupedCourses).map(([department, deptCourses]) => (
                      <div key={department} className="department-group">
                        <div className="department-header">{department}</div>
                        {deptCourses.map((course, index) => (
                          <CourseItem 
                            key={course.courseCode} 
                            course={course} 
                            index={index}
                          />
                        ))}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <div className="no-results-text">No courses found</div>
                    <div className="no-results-suggestion">Try searching for a different term</div>
                  </div>
                )
              ) : (
                // Suggested courses
                <>
                  {suggestedCourses.length > 0 && (
                    <div className="suggestions-section">
                      <div className="section-header">
                        {recentCourses.length > 0 ? 'Recent & Suggested' : 'Suggested Courses'}
                      </div>
                      {suggestedCourses.map((course, index) => (
                        <CourseItem 
                          key={course.courseCode} 
                          course={course} 
                          index={index}
                          isRecent={recentCourses.some(r => r.courseCode === course.courseCode)}
                        />
                      ))}
                    </div>
                  )}
                  <div className="browse-section">
                    <div className="section-header">Browse All Courses</div>
                    <div className="browse-hint">Start typing to search through all available courses</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSelector;

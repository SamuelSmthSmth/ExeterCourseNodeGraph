import React, { useState } from 'react';

const CourseSelector = ({ courses, selectedCourse, onCourseSelect, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.degree.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseClick = (courseCode) => {
    onCourseSelect(courseCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="course-selector">
      <div className="selector-container">
        <button
          className="selector-button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
        >
          {selectedCourse ? (
            <span>
              {selectedCourse.courseName} ({selectedCourse.degree})
            </span>
          ) : (
            <span>Select a course...</span>
          )}
          <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </button>

        {isOpen && (
          <div className="dropdown-content">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>

            <div className="courses-list">
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <div
                    key={course.courseCode}
                    className="course-item"
                    onClick={() => handleCourseClick(course.courseCode)}
                  >
                    <div className="course-name">{course.courseName}</div>
                    <div className="course-details">
                      {course.degree} • {course.department}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">No courses found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div 
          className="dropdown-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CourseSelector;

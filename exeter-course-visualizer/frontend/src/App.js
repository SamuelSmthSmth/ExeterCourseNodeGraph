import React, { useState, useEffect } from 'react';
import NodeGraph from './components/NodeGraph';
import Sidebar from './components/Sidebar';

const App = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            const response = await fetch('/api/courses');
            const data = await response.json();
            setCourses(data);
        };

        fetchCourses();
    }, []);

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
    };

    return (
        <div style={{ display: 'flex' }}>
            <NodeGraph courses={courses} onCourseSelect={handleCourseSelect} />
            <Sidebar course={selectedCourse} />
        </div>
    );
};

export default App;
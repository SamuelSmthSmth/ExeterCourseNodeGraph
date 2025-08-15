import React from 'react';

const Sidebar = ({ selectedItem }) => {
    return (
        <div className="sidebar">
            {selectedItem ? (
                <div>
                    <h2>{selectedItem.title}</h2>
                    <p><strong>Credit Value:</strong> {selectedItem.creditValue}</p>
                    <p><strong>Prerequisites:</strong> {selectedItem.prerequisites.join(', ')}</p>
                    <p><strong>Summary:</strong> {selectedItem.summary}</p>
                    <p><strong>Intended Learning Outcomes:</strong> {selectedItem.learningOutcomes.join(', ')}</p>
                    <p><strong>Assessment Methods:</strong> {selectedItem.assessmentMethods.join(', ')}</p>
                </div>
            ) : (
                <p>Select a course or module to see the details.</p>
            )}
        </div>
    );
};

export default Sidebar;
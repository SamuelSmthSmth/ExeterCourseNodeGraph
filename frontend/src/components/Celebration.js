import React, { useEffect, useState } from 'react';
import '../styles/Celebration.css';

const Celebration = ({ show, onClose, type = 'course-complete' }) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        color: ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)]
      }));
      setConfetti(particles);

      // Auto-close after animation
      setTimeout(() => {
        onClose();
      }, 4000);
    }
  }, [show, onClose]);

  if (!show) return null;

  const messages = {
    'course-complete': {
      title: '🎉 Amazing!',
      subtitle: 'You\'ve explored an entire course structure!',
      description: 'Great job understanding the curriculum flow and prerequisites.'
    },
    'node-master': {
      title: '🏆 Node Master!',
      subtitle: 'You\'ve clicked on 10+ modules!',
      description: 'You\'re really diving deep into the course details!'
    },
    'filter-expert': {
      title: '🔍 Filter Expert!',
      subtitle: 'You\'ve mastered the search functionality!',
      description: 'Finding exactly what you need like a pro!'
    }
  };

  const message = messages[type] || messages['course-complete'];

  return (
    <div className="celebration-overlay">
      <div className="celebration-container">
        {confetti.map(particle => (
          <div
            key={particle.id}
            className="confetti-particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              backgroundColor: particle.color
            }}
          />
        ))}
        
        <div className="celebration-content">
          <div className="celebration-title">{message.title}</div>
          <div className="celebration-subtitle">{message.subtitle}</div>
          <div className="celebration-description">{message.description}</div>
          
          <div className="celebration-actions">
            <button onClick={onClose} className="celebration-btn">
              Continue Exploring! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Celebration;

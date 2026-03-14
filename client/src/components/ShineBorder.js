import React from 'react';

const ShineBorder = ({ 
  children, 
  borderRadius = 16,
  borderWidth = 2,
  duration = 14,
  color = ['#ec4899', '#8b5cf6', '#00f5ff'],
  className = '',
  style = {}
}) => {
  const colors = Array.isArray(color) ? color.join(', ') : color;
  
  return (
    <div 
      className={`shine-border-wrapper ${className}`}
      style={{
        '--border-radius': `${borderRadius}px`,
        '--border-width': `${borderWidth}px`,
        '--shine-duration': `${duration}s`,
        '--shine-color': colors,
        ...style
      }}
    >
      <div className="shine-border-content">
        {children}
      </div>
      
      <style jsx>{`
        .shine-border-wrapper {
          position: relative;
          border-radius: var(--border-radius);
          padding: var(--border-width);
          background: #334155;
          overflow: hidden;
          box-sizing: border-box;
        }

        .shine-border-content {
          background: #1e293b;
          border-radius: calc(var(--border-radius) - var(--border-width));
          height: 100%;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        @keyframes shine-rotate {
          0% {
            --shine-angle: 0deg;
          }
          100% {
            --shine-angle: 360deg;
          }
        }

        /* Fallback animation using pseudo-element */
        .shine-border-wrapper::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            var(--shine-color) 10%,
            transparent 20%,
            transparent 100%
          );
          transform-origin: center center;
          animation: shine-spin var(--shine-duration) linear infinite;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes shine-spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @property --shine-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
      `}</style>
    </div>
  );
};

export default ShineBorder;

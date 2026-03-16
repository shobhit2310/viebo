import React from 'react';

const FluidBackground = () => {
  return (
    <>
      {/* Fluid Ripple Background */}
      <div className="fluid-bg-container">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
        <div className="liquid-blob blob-4"></div>
        <div className="noise-overlay"></div>
      </div>

      {/* SVG Filter for Liquid Distortion */}
      <svg className="liquid-filter-svg">
        <filter id="liquid">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="2">
            <animate attributeName="baseFrequency" dur="30s" values="0.012;0.018;0.012" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="40" />
        </filter>
      </svg>
    </>
  );
};

export default FluidBackground;

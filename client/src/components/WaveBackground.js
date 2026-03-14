import React from "react";

const WaveBackground = () => (
  <svg
    viewBox="0 0 1440 320"
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: -1,
    }}
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0f2027" />
        <stop offset="100%" stopColor="#2c5364" />
      </linearGradient>
    </defs>
    <path
      fill="url(#waveGradient)"
      fillOpacity="1"
      d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,154.7C840,149,960,171,1080,186.7C1200,203,1320,213,1380,218.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
    />
  </svg>
);

export default WaveBackground;

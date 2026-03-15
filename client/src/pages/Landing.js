import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, MessageCircle, Users, Sparkles, Shield, ArrowRight, Zap, Star } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';

const Landing = () => {
  const featuresSectionRef = useRef(null);
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [morphWords] = useState(['Perfect Match', 'True Love', 'Soulmate', 'Connection']);
  const [morphIndex, setMorphIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsHeroReady(true), 120);
    return () => clearTimeout(timer);
  }, []);

  // Morphing tagline effect
  useEffect(() => {
    const morphInterval = setInterval(() => {
      setMorphIndex((prev) => (prev + 1) % morphWords.length);
    }, 3000);
    return () => clearInterval(morphInterval);
  }, [morphWords.length]);

  // Scroll progress indicator
  useEffect(() => {
    const handleScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScrollProgress, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollProgress);
  }, []);

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%`, background: '#be185d' }} />
      </div>

      <div className={`landing-page ${isHeroReady ? 'hero-loaded' : 'hero-intro'}`}>
        <LandingNavbar />
        
        {/* Fluid Ripple Background */}
        <div className="fluid-bg-container">
          <div className="liquid-blob blob-1"></div>
          <div className="liquid-blob blob-2"></div>
          <div className="liquid-blob blob-3"></div>
          <div className="liquid-blob blob-4"></div>
          <div className="noise-overlay"></div>
        </div>

        {/* SVG Filter for Liquid Distortion - Kept outside for better performance */}
        <svg className="liquid-filter-svg">
          <filter id="liquid">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="2">
              <animate attributeName="baseFrequency" dur="30s" values="0.012;0.018;0.012" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
        </svg>

        <div className="hero-3d centered">
          <div className="hero-content">
            <div className="viebo-logo-container">
              <div className="viebo-text-minimal">
                <span className="serif-i">v</span>
                <span className="heart-dot"></span>
                <span className="serif-rest">iebo</span>
              </div>
              <div className="accent-divider">
                <div className="dot"></div>
              </div>
            </div>

            <h1 className="hero-title-serif">
              Find Your <br />
              <span className="morph-wrapper">
                <span className="morph-text accent-pink" key={morphIndex}>
                  {morphWords[morphIndex]}
                </span>
                <span className="heart-inline">❤️</span>
              </span> <br />
              At Real Events
            </h1>

            <p className="hero-description-light">
              Connect with people at the same parties, festivals, and events.<br />
              Send anonymous crushes, get matched, and start your love story.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="btn-primary-polished">
                Find Your Match
              </Link>
              <button className="btn-secondary-outline">
                See How It Works
              </button>
            </div>

            <div className="hero-features-minimal">
              <span>• Anonymous crushes</span>
              <span>• Real events only</span>
              <span>• Mutual match reveal</span>
              <span>• Always private</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          padding-top: 80px;
          position: relative;
          overflow: hidden;
          background: #fffafa;
          color: #1e293b;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .fluid-bg-container {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          filter: url(#liquid);
        }

        .liquid-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          mix-blend-mode: normal;
          animation: move-blobs 40s ease-in-out infinite;
        }

        .blob-1 {
          width: 800px;
          height: 800px;
          background: #ffcbe4;
          top: -200px;
          left: -200px;
          animation-duration: 45s;
        }

        .blob-2 {
          width: 700px;
          height: 700px;
          background: #e0e7ff;
          top: 40%;
          right: -200px;
          animation-delay: -7s;
          animation-duration: 38s;
        }

        .blob-3 {
          width: 750px;
          height: 750px;
          background: #ffedd5;
          bottom: -200px;
          left: 10%;
          animation-delay: -12s;
          animation-duration: 50s;
        }

        .blob-4 {
          width: 600px;
          height: 600px;
          background: #fdf2f8;
          top: 5%;
          left: 35%;
          animation-delay: -18s;
          animation-duration: 33s;
        }

        .noise-overlay {
          position: absolute;
          inset: 0;
          z-index: 5;
          opacity: 0.04;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .liquid-filter-svg {
          position: fixed;
          top: 0;
          left: 0;
          width: 0;
          height: 0;
          pointer-events: none;
        }

        @keyframes move-blobs {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(120px, 60px) scale(1.1) rotate(10deg); }
          66% { transform: translate(-60px, 120px) scale(0.9) rotate(-10deg); }
        }

        .hero-3d.centered {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 20px;
          z-index: 10;
          position: relative;
        }

        .hero-content {
          max-width: 800px;
        }

        .viebo-logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
        }

        .viebo-text-minimal {
          display: flex;
          align-items: center;
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          color: #be185d;
          font-style: italic;
          letter-spacing: -1px;
          position: relative;
        }

        .heart-dot {
          width: 12px;
          height: 12px;
          background: #db2777;
          border-radius: 50%;
          margin: 0 2px;
          box-shadow: 0 0 15px rgba(219, 39, 119, 0.4);
        }

        .accent-divider {
          margin-top: 10px;
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #be185d, transparent);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .accent-divider .dot {
          width: 4px;
          height: 4px;
          background: #be185d;
          transform: rotate(45deg);
        }

        .hero-title-serif {
          font-family: 'Playfair Display', serif;
          font-size: 56px;
          font-weight: 700;
          line-height: 1.1;
          color: #1e293b;
          margin-bottom: 24px;
        }

        .morph-wrapper {
          position: relative;
          display: inline-block;
          min-width: 150px;
        }

        .morph-text {
          font-style: italic;
          display: inline-block;
          animation: slideUpFade 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .accent-pink {
          background: linear-gradient(135deg, #be185d, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .heart-inline {
          font-size: 32px;
          margin-left: 8px;
          display: inline-block;
          animation: softBeat 3s ease-in-out infinite;
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes softBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .hero-description-light {
          font-size: 17px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 40px;
          font-weight: 400;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 50px;
        }

        .btn-primary-polished {
          padding: 16px 36px;
          background: linear-gradient(135deg, #be185d, #db2777);
          color: white;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          text-decoration: none;
          box-shadow: 0 10px 25px rgba(190, 24, 93, 0.25);
          transition: all 0.3s ease;
        }

        .btn-primary-polished:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(190, 24, 93, 0.35);
        }

        .btn-secondary-outline {
          padding: 16px 36px;
          background: white;
          color: #be185d;
          border: 1.5px solid #be185d;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary-outline:hover {
          background: #fff1f2;
          transform: translateY(-2px);
        }

        .hero-features-minimal {
          display: flex;
          gap: 24px;
          justify-content: center;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .hero-title-serif {
            font-size: 36px;
          }
          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }
          .hero-features-minimal {
            flex-direction: column;
            gap: 10px;
          }
          .morph-wrapper {
            min-width: unset;
          }
        }
      `}</style>
    </>
  );
};

export default Landing;

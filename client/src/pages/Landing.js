import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, MessageCircle, Users, Sparkles, Shield, ArrowRight, Zap, Star } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';

const Landing = () => {
  const featuresSectionRef = useRef(null);
  const howItWorksRef = useRef(null);
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [morphWords] = useState(['Perfect Match', 'True Love', 'Soulmate', 'Connection']);
  const [morphIndex, setMorphIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState([]);

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

  // Scroll to How It Works section
  const scrollToHowItWorks = () => {
    if (howItWorksRef.current) {
      howItWorksRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Animate steps on scroll
  useEffect(() => {
    const handleStepScroll = () => {
      if (howItWorksRef.current) {
        const rect = howItWorksRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8;
        
        if (isVisible) {
          setVisibleSteps(Array.from({ length: 6 }, (_, i) => i));
        }
      }
    };

    window.addEventListener('scroll', handleStepScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleStepScroll);
  }, []);

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%`, background: '#be185d' }} />
      </div>

      <div className={`landing-page ${isHeroReady ? 'hero-loaded' : 'hero-intro'}`}>
        <LandingNavbar />
        
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
              <button 
                className="btn-secondary-outline"
                onClick={scrollToHowItWorks}
              >
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

        {/* How It Works Section */}
        <div className="how-it-works-section" ref={howItWorksRef}>
          <div className="how-it-works-container">
            <div className="section-header">
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle">Find your match in 4 simple steps</p>
            </div>

            <div className="steps-grid">
              {/* Step 1 */}
              <div className={`step-card step-card-1 ${visibleSteps.includes(0) ? 'visible' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-icon">
                  <Calendar size={40} />
                </div>
                <h3 className="step-title">Join an Event</h3>
                <p className="step-description">
                  Register for real parties, festivals, concerts, and events happening around you. Get instant access to all attendees.
                </p>
              </div>

              {/* Step 2 */}
              <div className={`step-card step-card-2 ${visibleSteps.includes(1) ? 'visible' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-icon">
                  <Heart size={40} />
                </div>
                <h3 className="step-title">Send Anonymous Crush</h3>
                <p className="step-description">
                  See other event attendees and anonymously send a crush to someone who catches your eye. No awkward rejections!
                </p>
              </div>

              {/* Step 3 */}
              <div className={`step-card step-card-3 ${visibleSteps.includes(2) ? 'visible' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-icon">
                  <Sparkles size={40} />
                </div>
                <h3 className="step-title">Get Matched</h3>
                <p className="step-description">
                  When someone sends you a crush back, it's a match! Your identity is revealed only to mutual matches.
                </p>
              </div>

              {/* Step 4 */}
              <div className={`step-card step-card-4 ${visibleSteps.includes(3) ? 'visible' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-icon">
                  <MessageCircle size={40} />
                </div>
                <h3 className="step-title">Start Chatting</h3>
                <p className="step-description">
                  Chat with your match securely in the app. Plan your next date, exchange phone numbers, or fall in love!
                </p>
              </div>

              {/* Step 5 - Additional benefit */}
              <div className={`step-card step-card-5 ${visibleSteps.includes(4) ? 'visible' : ''}`}>
                <div className="step-number">5</div>
                <div className="step-icon">
                  <Shield size={40} />
                </div>
                <h3 className="step-title">Privacy Protected</h3>
                <p className="step-description">
                  Your profile is always private. Only mutual matches see your identity. Report & block features keep you safe.
                </p>
              </div>

              {/* Step 6 - Success */}
              <div className={`step-card step-card-6 ${visibleSteps.includes(5) ? 'visible' : ''}`}>
                <div className="step-number">✓</div>
                <div className="step-icon">
                  <Star size={40} />
                </div>
                <h3 className="step-title">Find Love</h3>
                <p className="step-description">
                  Meet someone amazing at your favorite event. Build your love story with someone who was already in your life.
                </p>
              </div>
            </div>

            {/* Features highlight */}
            <div className={`features-highlight ${visibleSteps.length > 0 ? 'visible' : ''}`}>
              <div className="feature-item">
                <div className="feature-icon">🎉</div>
                <h4>Real Events Only</h4>
                <p>Verified events from real attendees</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔐</div>
                <h4>100% Anonymous</h4>
                <p>Until you both like each other</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <h4>Instant Matches</h4>
                <p>No waiting games or algorithms</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💬</div>
                <h4>Secure Messaging</h4>
                <p>Chat safely within the app</p>
              </div>
            </div>

            <div className="how-cta">
              <Link to="/register" className="btn-primary-polished">
                Start Your Love Story
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          padding-top: 80px;
          position: relative;
          color: #1e293b;
          font-family: 'Plus Jakarta Sans', sans-serif;
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

        /* How It Works Section Styles */
        .how-it-works-section {
          min-height: 100vh;
          padding: 120px 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          position: relative;
          overflow: hidden;
        }

        .how-it-works-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -30%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(219, 39, 119, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .how-it-works-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .section-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
          animation: slideUpFade 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .section-subtitle {
          font-size: 18px;
          color: #64748b;
          font-weight: 500;
          animation: slideUpFade 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.2s both;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
          margin-bottom: 80px;
        }

        .step-card {
          background: white;
          border-radius: 16px;
          padding: 40px 32px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          transform: translateY(30px);
          opacity: 0;
          border: 1px solid rgba(190, 24, 93, 0.1);
        }

        .step-card.visible {
          transform: translateY(0);
          opacity: 1;
        }

        .step-card-1.visible { transition-delay: 0s; }
        .step-card-2.visible { transition-delay: 0.1s; }
        .step-card-3.visible { transition-delay: 0.2s; }
        .step-card-4.visible { transition-delay: 0.3s; }
        .step-card-5.visible { transition-delay: 0.4s; }
        .step-card-6.visible { transition-delay: 0.5s; }

        .step-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(190, 24, 93, 0.15);
          border-color: rgba(190, 24, 93, 0.3);
        }

        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #be185d, #ec4899);
          color: white;
          border-radius: 50%;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
          animation: numberPulse 2s ease-in-out infinite;
        }

        .step-card:nth-child(1) .step-number { animation-delay: 0s; }
        .step-card:nth-child(2) .step-number { animation-delay: 0.2s; }
        .step-card:nth-child(3) .step-number { animation-delay: 0.4s; }
        .step-card:nth-child(4) .step-number { animation-delay: 0.6s; }
        .step-card:nth-child(5) .step-number { animation-delay: 0.8s; }
        .step-card:nth-child(6) .step-number { animation-delay: 1s; }

        @keyframes numberPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(219, 39, 119, 0.5); }
          50% { transform: scale(1.05); }
          100% { box-shadow: 0 0 0 8px rgba(219, 39, 119, 0); }
        }

        .step-icon {
          color: #be185d;
          margin-bottom: 16px;
          display: flex;
          justify-content: center;
          animation: floatIcon 3s ease-in-out infinite;
        }

        .step-card:nth-child(1) .step-icon { animation-delay: 0s; }
        .step-card:nth-child(2) .step-icon { animation-delay: 0.3s; }
        .step-card:nth-child(3) .step-icon { animation-delay: 0.6s; }
        .step-card:nth-child(4) .step-icon { animation-delay: 0.9s; }
        .step-card:nth-child(5) .step-icon { animation-delay: 1.2s; }
        .step-card:nth-child(6) .step-icon { animation-delay: 1.5s; }

        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .step-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .step-description {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        /* Features Highlight */
        .features-highlight {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-bottom: 60px;
          padding: 40px;
          background: white;
          border-radius: 20px;
          border: 2px solid rgba(190, 24, 93, 0.1);
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .features-highlight.visible {
          opacity: 1;
          transform: scale(1);
        }

        .feature-item {
          text-align: center;
          padding: 20px;
          border-radius: 12px;
          background: #f8fafc;
          transition: all 0.3s ease;
        }

        .feature-item:hover {
          background: linear-gradient(135deg, rgba(190, 24, 93, 0.05), rgba(236, 72, 153, 0.05));
          transform: translateY(-4px);
        }

        .feature-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .feature-item h4 {
          color: #1e293b;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .feature-item p {
          color: #64748b;
          font-size: 13px;
          margin: 0;
        }

        .how-cta {
          text-align: center;
          animation: slideUpFade 1s cubic-bezier(0.23, 1, 0.32, 1) 0.4s both;
        }

        .how-cta .btn-primary-polished {
          padding: 18px 48px;
          font-size: 17px;
          display: inline-block;
        }

        .scroll-progress-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.05);
        }

        .scroll-progress-bar {
          height: 100%;
          transition: width 0.1s ease-out;
          box-shadow: 0 0 10px rgba(190, 24, 93, 0.3);
        }

        @media (max-width: 768px) {
          .how-it-works-section {
            padding: 60px 20px;
            min-height: auto;
          }

          .section-title {
            font-size: 32px;
          }

          .steps-grid {
            gap: 20px;
          }

          .step-card {
            padding: 30px 20px;
          }

          .features-highlight {
            grid-template-columns: repeat(2, 1fr);
            padding: 20px;
            gap: 16px;
          }

          .feature-item {
            padding: 12px;
          }

          .feature-item h4 {
            font-size: 14px;
          }

          .feature-item p {
            font-size: 12px;
          }

          .feature-icon {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
};

export default Landing;

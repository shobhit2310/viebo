import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Info, X, Users, Home, LogIn, UserPlus } from 'lucide-react';
import '../index.css';

const LandingNavbar = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <nav className="landing-navbar">
        <div className="landing-navbar-container">
          {/* Logo */}
          <Link to="/" className="landing-logo">
            Viebo 💕
          </Link>

          {/* Navigation Links */}
          <div className="landing-nav-links">
            <button 
              className="landing-nav-item"
              onClick={() => {
                setShowAbout(true);
                setShowHelp(false);
              }}
            >
              <Info size={18} />
              <span>About</span>
            </button>

            <Link to="/" className="landing-nav-item">
              <Home size={18} />
              <span>Home</span>
            </Link>
            
            <button 
              className="landing-nav-item"
              onClick={() => {
                setShowHelp(true);
                setShowAbout(false);
              }}
            >
              <Mail size={18} />
              <span>Help</span>
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="landing-auth-buttons">
            <Link to="/login" className="landing-btn-login">
              <LogIn size={18} />
              <span>Login</span>
            </Link>
            <Link to="/register" className="landing-btn-signup">
              <UserPlus size={18} />
              <span>Sign Up</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* About Modal */}
      {showAbout && (
        <div className="landing-modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="landing-modal-content glass-card about-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <button className="landing-modal-close" onClick={() => setShowAbout(false)}>
              <X size={20} />
            </button>
            <div className="landing-modal-icon about-icon">
              <Users size={32} />
            </div>
            <h3 className="landing-modal-title">About Viebo</h3>
            <div className="landing-modal-text-container" style={{ textAlign: 'left', lineHeight: '1.6', fontSize: '15px' }}>
              <p style={{ marginBottom: '16px' }}>
                <strong>Viebo</strong> is an innovative event-based dating platform designed to help people build real connections through shared experiences. Instead of endless swiping and random matches, Viebo connects individuals who are attending the same events such as college fests, parties, cultural gatherings, concerts, and social meetups.
              </p>
              <p style={{ marginBottom: '16px' }}>
                The idea behind Viebo is simple: meaningful relationships often start when people share the same environment, vibe, and moment. By allowing users to join an event and discover others who are present there, Viebo makes meeting new people more natural, safe, and exciting.
              </p>
              <p style={{ marginBottom: '16px' }}>
                Viebo uses event codes and location-based access so only people attending a specific event can interact with each other. This creates a trusted and relevant community where users can chat, express interest, and form connections in real time.
              </p>
              <p style={{ marginBottom: '16px' }}>
                Our mission is to bring back the magic of meeting someone in the moment while using technology to make it easier, safer, and more fun.
              </p>
              <p style={{ marginBottom: '16px' }}>
                Viebo was founded by <strong>Shobhit Kumar</strong> with the vision of transforming how people meet in social environments and creating a modern dating experience focused on real-world interactions rather than purely online matches.
              </p>
              <p>
                The goal of Viebo is to turn social events into opportunities for authentic connections, friendships, and meaningful relationships.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="landing-modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="landing-modal-content glass-card" onClick={e => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={() => setShowHelp(false)}>
              <X size={20} />
            </button>
            <div className="landing-modal-icon help-icon">
              <Mail size={32} />
            </div>
            <h3 className="landing-modal-title">Need Help?</h3>
            <p className="landing-modal-text">
              We're here for you! Send us an email at:
            </p>
            <a href="mailto:viebo.in@gmail.com" className="landing-email-link">
              viebo.in@gmail.com
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default LandingNavbar;

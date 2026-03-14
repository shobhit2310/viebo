import React, { useEffect, useState, useRef } from 'react';
import { Heart, MessageCircle, X, Sparkles } from 'lucide-react';

const MatchCelebration = ({ match, onClose, onStartChat }) => {
  const [showContent, setShowContent] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Delay content appearance for dramatic effect
    setTimeout(() => setShowContent(true), 300);

    // Generate floating hearts
    const heartElements = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      size: 15 + Math.random() * 20
    }));
    setHearts(heartElements);

    // Generate confetti
    const confettiElements = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: ['#ec4899', '#8b5cf6', '#00f5ff', '#ffc300', '#ff006e'][Math.floor(Math.random() * 5)],
      rotation: Math.random() * 360,
      size: 8 + Math.random() * 8
    }));
    setConfetti(confettiElements);

    // Trigger haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Play celebration sound (if available)
    const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore if blocked

    return () => {
      setHearts([]);
      setConfetti([]);
    };
  }, []);

  // Canvas sparkle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const sparkles = [];
    const colors = ['#ec4899', '#8b5cf6', '#00f5ff', '#ffc300'];

    for (let i = 0; i < 100; i++) {
      sparkles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random()
      });
    }

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparkles.forEach(sparkle => {
        sparkle.x += sparkle.speedX;
        sparkle.y += sparkle.speedY;
        sparkle.alpha += (Math.random() - 0.5) * 0.1;
        sparkle.alpha = Math.max(0.2, Math.min(1, sparkle.alpha));

        if (sparkle.x < 0) sparkle.x = canvas.width;
        if (sparkle.x > canvas.width) sparkle.x = 0;
        if (sparkle.y < 0) sparkle.y = canvas.height;
        if (sparkle.y > canvas.height) sparkle.y = 0;

        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
        ctx.fillStyle = sparkle.color + Math.floor(sparkle.alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="match-overlay">
      <canvas ref={canvasRef} className="sparkle-canvas" />
      
      {/* Floating Hearts */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="floating-heart"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            fontSize: `${heart.size}px`
          }}
        >
          ❤️
        </div>
      ))}

      {/* Confetti */}
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            width: `${piece.size}px`,
            height: `${piece.size * 1.5}px`
          }}
        />
      ))}

      {/* Close Button */}
      <button className="close-btn" onClick={onClose}>
        <X size={24} />
      </button>

      {/* Main Content */}
      <div className={`match-content ${showContent ? 'visible' : ''}`}>
        {/* "It's a Match!" Header */}
        <div className="match-header">
          <Sparkles className="sparkle-icon left" size={32} />
          <h1 className="match-title">It's a Match!</h1>
          <Sparkles className="sparkle-icon right" size={32} />
        </div>

        <p className="match-subtitle">
          You and {match?.name} both liked each other
        </p>

        {/* Profile Pictures */}
        <div className="profiles-container">
          <div className="profile-circle user-profile">
            <div className="profile-glow"></div>
            <img 
              src={match?.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'} 
              alt="You" 
            />
          </div>

          <div className="heart-connector">
            <Heart className="connector-heart" fill="#ec4899" />
          </div>

          <div className="profile-circle match-profile">
            <div className="profile-glow"></div>
            <img 
              src={match?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=match'} 
              alt={match?.name} 
            />
          </div>
        </div>

        {/* Match Details */}
        <div className="match-details">
          <p className="match-name">{match?.name}</p>
          {match?.bio && <p className="match-bio">{match.bio}</p>}
          {match?.interests?.length > 0 && (
            <div className="shared-interests">
              {match.interests.slice(0, 3).map((interest, i) => (
                <span key={i} className="interest-tag">{interest}</span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="match-actions">
          <button className="action-btn chat-btn" onClick={onStartChat}>
            <MessageCircle size={20} />
            Start Chatting
          </button>
          <button className="action-btn later-btn" onClick={onClose}>
            Keep Swiping
          </button>
        </div>
      </div>

      <style jsx>{`
        .match-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(236, 72, 153, 0.95) 0%,
            rgba(139, 92, 246, 0.95) 50%,
            rgba(3, 0, 20, 0.98) 100%
          );
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          animation: overlayFadeIn 0.5s ease-out;
        }

        @keyframes overlayFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .sparkle-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .floating-heart {
          position: absolute;
          bottom: -50px;
          animation: floatUp linear forwards;
          opacity: 0.8;
          pointer-events: none;
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120vh) rotate(360deg) scale(1.2);
            opacity: 0;
          }
        }

        .confetti-piece {
          position: absolute;
          top: -20px;
          border-radius: 2px;
          animation: confettiFall linear forwards;
          pointer-events: none;
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(120vh) rotate(720deg);
            opacity: 0;
          }
        }

        .match-content {
          text-align: center;
          padding: 40px;
          max-width: 400px;
          opacity: 0;
          transform: scale(0.8) translateY(30px);
          transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .match-content.visible {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .match-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 12px;
        }

        .sparkle-icon {
          color: #ffc300;
          animation: sparkle 1.5s ease-in-out infinite;
        }

        .sparkle-icon.left {
          animation-delay: 0.2s;
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.3) rotate(15deg);
            opacity: 1;
          }
        }

        .match-title {
          font-size: 42px;
          font-weight: 800;
          color: white;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, #fff, #ffc300);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: titlePop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.3s both;
        }

        @keyframes titlePop {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        .match-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          margin-bottom: 32px;
        }

        .profiles-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .profile-circle {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid white;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          animation: profileBounce 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }

        .user-profile {
          animation-delay: 0.4s;
        }

        .match-profile {
          animation-delay: 0.6s;
        }

        @keyframes profileBounce {
          0% {
            transform: scale(0) rotate(-30deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .profile-glow {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background: linear-gradient(135deg, #ec4899, #8b5cf6, #00f5ff);
          border-radius: 50%;
          z-index: -1;
          animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        .profile-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .heart-connector {
          animation: heartBeat 1s ease-in-out infinite;
        }

        .connector-heart {
          color: #ec4899;
          filter: drop-shadow(0 0 10px #ec4899);
        }

        @keyframes heartBeat {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.2);
          }
          50% {
            transform: scale(1);
          }
          75% {
            transform: scale(1.1);
          }
        }

        .match-details {
          margin-bottom: 32px;
        }

        .match-name {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .match-bio {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          margin-bottom: 12px;
        }

        .shared-interests {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .interest-tag {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          backdrop-filter: blur(10px);
        }

        .match-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-btn {
          padding: 16px 32px;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .chat-btn {
          background: white;
          color: #ec4899;
          border: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .chat-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        .later-btn {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .later-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
        }

        @media (max-width: 480px) {
          .match-content {
            padding: 20px;
          }

          .match-title {
            font-size: 32px;
          }

          .profile-circle {
            width: 90px;
            height: 90px;
          }

          .profiles-container {
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default MatchCelebration;

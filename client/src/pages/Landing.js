import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, MessageCircle, Users, Sparkles, Shield, ArrowRight, Zap, Star } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';

const Landing = () => {
  const canvasRef = useRef(null);
  const featuresSectionRef = useRef(null);
  const heroVisualRef = useRef(null);
  const statsSectionRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFeatureDeckOpen, setIsFeatureDeckOpen] = useState(false);
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [cursorSparks, setCursorSparks] = useState([]);
  const [glowMagnet, setGlowMagnet] = useState({ x: 0, y: 0 });
  const [glassMagnet, setGlassMagnet] = useState({ x: 0, y: 0 });
  
  // Morphing tagline words
  const morphWords = ['Perfect Match', 'True Love', 'Soulmate', 'Connection'];
  const [morphIndex, setMorphIndex] = useState(0);
  
  // Typewriter effect
  const [displayedText, setDisplayedText] = useState('');
  const fullText = "Connect with people at the same parties, festivals, and events. Send anonymous crushes, get matched, and start your love story.";
  
  // Stats counter
  const [statsVisible, setStatsVisible] = useState(false);

  
  // Testimonials
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonials = [
    { name: "Sarah & Mike", quote: "We met at a music festival through Viebo. Now we're engaged! 💍", avatar: "👩‍❤️‍👨" },
    { name: "Priya", quote: "Finally an app where I actually meet people I vibe with in real life!", avatar: "🧕" },
    { name: "James", quote: "Matched with my girlfriend at a house party. Best app ever!", avatar: "👨" },
    { name: "Emma & Liam", quote: "From strangers at a concert to soulmates. Thank you Viebo! 💕", avatar: "👫" }
  ];
  
  // 3D tilt state for cards
  const [cardTilts, setCardTilts] = useState({});
  
  // Progress circles for stats section

  
  // Loading screen
  const [isLoading, setIsLoading] = useState(true);
  
  // Scroll progress indicator
  const [scrollProgress, setScrollProgress] = useState(0);

  // Viebo Story - How it works animation
  const storySlides = [
    {
      id: 1,
      type: "scene",
      scene: "event",
      title: "At The Event",
      subtitle: "A party night... strangers in the crowd",
      emoji: "🎉",
      color: "#ff6b35"
    },
    {
      id: 2,
      type: "scene", 
      scene: "phones",
      title: "Open Viebo",
      subtitle: "Both tap the app, same event code",
      emoji: "📱",
      color: "#00f5ff"
    },
    {
      id: 3,
      type: "scene",
      scene: "crush",
      title: "Send Crush",
      subtitle: "Hearts sent... waiting for magic",
      emoji: "💕",
      color: "#ff006e"
    },
    {
      id: 4,
      type: "scene",
      scene: "match",
      title: "It's a Match!",
      subtitle: "Both liked each other! 🎊",
      emoji: "✨",
      color: "#ffc300"
    },
    {
      id: 5,
      type: "scene",
      scene: "chat",
      title: "Start Chatting",
      subtitle: "Messages flow, smiles grow",
      emoji: "💬",
      color: "#8b5cf6"
    },
    {
      id: 6,
      type: "scene",
      scene: "hug",
      title: "Meet & Connect",
      subtitle: "From app to reality",
      emoji: "🤗",
      color: "#e91e63"
    },
    {
      id: 7,
      type: "final",
      scene: "soulmate",
      title: "Viebo",
      subtitle: "In A Crowd",
      emoji: "🤝",
      color: "#00f5ff"
    }
  ];

  // Auto-slide effect with transition handling
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % storySlides.length);
        setIsTransitioning(false);
      }, 300);
    }, 3500);
    return () => clearInterval(slideInterval);
  }, [storySlides.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 255, ${particle.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(255, 0, 110, ${0.15 * (1 - distance / 150)})`;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const sectionEl = featuresSectionRef.current;
    if (!sectionEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Toggle animation based on visibility - plays every time section enters view
        if (entry.isIntersecting) {
          setIsFeatureDeckOpen(true);
        } else {
          // Reset when section leaves view so animation plays again on re-entry
          setIsFeatureDeckOpen(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionEl);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsHeroReady(true), 120);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setParallaxOffset(window.scrollY || 0);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Morphing tagline effect
  useEffect(() => {
    const morphInterval = setInterval(() => {
      setMorphIndex((prev) => (prev + 1) % morphWords.length);
    }, 3000);
    return () => clearInterval(morphInterval);
  }, [morphWords.length]);

  // Typewriter effect
  useEffect(() => {
    if (!isHeroReady) return;
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 25);
    return () => clearInterval(typeInterval);
  }, [isHeroReady]);

  // Stats counter animation


  // Stats section observer
  useEffect(() => {
    const statsEl = statsSectionRef.current;
    if (!statsEl) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsVisible) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    
    observer.observe(statsEl);
    return () => observer.disconnect();
  }, [statsVisible]);

  // Testimonials auto-rotate
  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(testimonialInterval);
  }, [testimonials.length]);

  // Loading screen effect
  useEffect(() => {
    const loadTimer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(loadTimer);
  }, []);

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

  // Progress circles animation


  useEffect(() => {
    const revealItems = document.querySelectorAll('[data-reveal]');
    if (!revealItems.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const handleMagneticMove = (event, setter) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    setter({ x, y });
  };

  const resetMagnetic = (setter) => setter({ x: 0, y: 0 });

  const handleHeroMouseMove = (event) => {
    const bounds = heroVisualRef.current?.getBoundingClientRect();
    if (!bounds || Math.random() > 0.22) return;

    const spark = {
      id: `${Date.now()}-${Math.random()}`,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    };

    setCursorSparks((prev) => [...prev.slice(-18), spark]);
    setTimeout(() => {
      setCursorSparks((prev) => prev.filter((item) => item.id !== spark.id));
    }, 700);
  };

  // 3D tilt for cards
  const handleCardTilt = (event, cardId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const tiltX = (y - 0.5) * 20;
    const tiltY = (x - 0.5) * -20;
    setCardTilts(prev => ({ ...prev, [cardId]: { x: tiltX, y: tiltY } }));
  };

  const resetCardTilt = (cardId) => {
    setCardTilts(prev => ({ ...prev, [cardId]: { x: 0, y: 0 } }));
  };

  return (
    <>
      {/* Loading Screen */}
      <div className={`loading-screen ${isLoading ? 'active' : 'hidden'}`}>
        <div className="loading-content">
          <div className="loading-logo">
            <span className="loading-letter">V</span>
            <span className="loading-heart">💕</span>
            <span className="loading-letter">i</span>
            <span className="loading-letter">e</span>
            <span className="loading-letter">b</span>
            <span className="loading-letter">o</span>
          </div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
          <p className="loading-text">Finding your perfect match...</p>
        </div>
      </div>

      {/* Scroll Progress Indicator */}
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      <div 
        className={`landing-page ${isHeroReady ? 'hero-loaded' : 'hero-intro'}`} 
        style={{ minHeight: '100vh', paddingTop: '80px' }}
      >
        <LandingNavbar />
        {/* Animated Canvas Background */}
        <canvas
          ref={canvasRef}
          className="particle-canvas"
        style={{ transform: `translate3d(0, ${parallaxOffset * 0.22}px, 0)` }}
      />

      {/* Ambient Blobs */}
      <div className="ambient-blobs" style={{ transform: `translate3d(0, ${parallaxOffset * 0.18}px, 0)` }}>
        <div className="blob blob-cyan"></div>
        <div className="blob blob-pink"></div>
        <div className="blob blob-violet"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-3d">
        <div className="hero-content">
          {/* Viebo Logo with Heart as dot of i */}
          <div className="viebo-logo-container">
            <div className="viebo-text">
              <span className="letter hero-letter letter-v" style={{ '--letter-index': 0 }}>v</span>
              <span className="letter hero-letter letter-i" style={{ '--letter-index': 1 }}>
                <span className="i-heart-dot">
                  <svg viewBox="0 0 32 32" className="i-heart-svg">
                    <defs>
                      <linearGradient id="iHeartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff6b9d" />
                        <stop offset="50%" stopColor="#c44cff" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M16 28s-12-7.5-12-15c0-4.5 3.5-8 8-8 2.5 0 4.5 1 6 3 1.5-2 3.5-3 6-3 4.5 0 8 3.5 8 8 0 7.5-12 15-12 15z"
                      fill="url(#iHeartGradient)"
                    />
                  </svg>
                </span>
                <span className="i-stem">ı</span>
              </span>
              <span className="letter hero-letter letter-e" style={{ '--letter-index': 2 }}>e</span>
              <span className="letter hero-letter letter-b" style={{ '--letter-index': 3 }}>b</span>
              <span className="letter hero-letter letter-o" style={{ '--letter-index': 4 }}>o</span>
            </div>
          </div>

          <h1 className="hero-title-3d" data-reveal style={{ '--reveal-delay': '40ms' }}>
            <span className="title-line">Find Your</span>
            <span className="title-highlight">
              <span className="gradient-text morph-text" key={morphIndex}>
                {morphWords[morphIndex]}
              </span>
              <Heart className="heart-icon" size={48} />
            </span>
            <span className="title-line glitch-text" data-text="At Real Events">At Real Events</span>
          </h1>
          
          <p className="hero-description typewriter" data-reveal style={{ '--reveal-delay': '120ms' }}>
            {displayedText}
            <span className="typewriter-cursor">|</span>
          </p>

          <div className="hero-buttons" data-reveal style={{ '--reveal-delay': '200ms' }}>
            <Link
              to="/register"
              className="btn-glow magnetic-btn"
              onMouseMove={(event) => handleMagneticMove(event, setGlowMagnet)}
              onMouseLeave={() => resetMagnetic(setGlowMagnet)}
              style={{ 
                '--mx': `${glowMagnet.x}px`, 
                '--my': `${glowMagnet.y}px`
              }}
            >
              <span>Start Your Journey</span>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="btn-glass magnetic-btn"
              onMouseMove={(event) => handleMagneticMove(event, setGlassMagnet)}
              onMouseLeave={() => resetMagnetic(setGlassMagnet)}
              style={{ '--mx': `${glassMagnet.x}px`, '--my': `${glassMagnet.y}px` }}
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>

        {/* Viebo Story Animation */}
        <div
          className="hero-visual"
          ref={heroVisualRef}
          onMouseMove={handleHeroMouseMove}
          style={{ transform: `translate3d(0, ${parallaxOffset * 0.1}px, 0)` }}
        >
          <div className="cursor-sparks">
            {cursorSparks.map((spark) => (
              <span
                key={spark.id}
                className="cursor-spark"
                style={{ left: `${spark.x}px`, top: `${spark.y}px` }}
              >
                ✦
              </span>
            ))}
          </div>
          <div className={`slideshow-container ${isTransitioning ? 'transitioning' : ''}`}>
            <div className="slideshow-content">
            {/* Story Progress Bar */}
            <div className="story-progress">
              <div className="progress-label">How Viebo Works</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentSlide + 1) / storySlides.length) * 100}%` }}
                />
              </div>
            </div>

            {storySlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`slide ${index === currentSlide ? 'active' : ''} slide-scene-${slide.scene}`}
                style={{ '--slide-color': slide.color }}
              >
                <div className="scene-background"></div>
                
                {/* Scene 1: At the Event */}
                {slide.scene === 'event' && (
                  <div className="scene-content scene-event">
                    <div className="event-lights">
                      {[...Array(8)].map((_, i) => (
                        <span key={i} className="light" style={{ '--i': i }}>✦</span>
                      ))}
                    </div>
                    <div className="crowd">
                      <div className="person boy">👨</div>
                      <div className="person random">🧑</div>
                      <div className="person girl">👩</div>
                      <div className="person random">👤</div>
                    </div>
                    <div className="event-text">🎉 Party Night</div>
                  </div>
                )}

                {/* Scene 2: Open Phones */}
                {slide.scene === 'phones' && (
                  <div className="scene-content scene-phones">
                    <div className="phone-container">
                      <div className="phone phone-left">
                        <div className="phone-screen">
                          <div className="app-icon">V</div>
                          <div className="tap-effect"></div>
                        </div>
                        <div className="person-label">👨 He</div>
                      </div>
                      <div className="phone phone-right">
                        <div className="phone-screen">
                          <div className="app-icon">V</div>
                          <div className="tap-effect"></div>
                        </div>
                        <div className="person-label">👩 She</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scene 3: Send Crush */}
                {slide.scene === 'crush' && (
                  <div className="scene-content scene-crush">
                    <div className="crush-animation">
                      <div className="person-side left">👨</div>
                      <div className="hearts-flying">
                        <span className="flying-heart" style={{ '--delay': '0s' }}>💕</span>
                        <span className="flying-heart" style={{ '--delay': '0.3s' }}>💖</span>
                        <span className="flying-heart" style={{ '--delay': '0.6s' }}>💕</span>
                      </div>
                      <div className="person-side right">👩</div>
                    </div>
                    <div className="crush-text">Sending crush...</div>
                  </div>
                )}

                {/* Scene 4: Match */}
                {slide.scene === 'match' && (
                  <div className="scene-content scene-match">
                    <div className="match-explosion">
                      {[...Array(12)].map((_, i) => (
                        <span key={i} className="confetti" style={{ '--i': i }}>🎊</span>
                      ))}
                    </div>
                    <div className="match-badge-big">
                      <span>💕</span>
                      <span className="match-text">MATCH!</span>
                      <span>💕</span>
                    </div>
                    <div className="matched-couple">
                      <span>👨</span>
                      <span className="heart-link">❤️</span>
                      <span>👩</span>
                    </div>
                  </div>
                )}

                {/* Scene 5: Chat */}
                {slide.scene === 'chat' && (
                  <div className="scene-content scene-chat">
                    <div className="chat-bubbles">
                      <div className="bubble left">Hey! 😊</div>
                      <div className="bubble right">Hi there! 💕</div>
                      <div className="bubble left">Nice to match!</div>
                      <div className="bubble right">Same here! ✨</div>
                    </div>
                    <div className="happy-faces">
                      <span className="face">😊</span>
                      <span className="face">😊</span>
                    </div>
                  </div>
                )}

                {/* Scene 6: Hug */}
                {slide.scene === 'hug' && (
                  <div className="scene-content scene-hug">
                    <div className="hug-animation">
                      <span className="hug-emoji">🤗</span>
                    </div>
                    <div className="couple-together">
                      <span>👫</span>
                    </div>
                    <div className="love-aura">
                      {[...Array(6)].map((_, i) => (
                        <span key={i} className="aura-heart" style={{ '--i': i }}>💖</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scene 7: Final - Soulmate */}
                {slide.scene === 'soulmate' && (
                  <div className="scene-content scene-soulmate">
                    <div className="soulmate-rings">
                      <div className="ring ring-1"></div>
                      <div className="ring ring-2"></div>
                      <div className="ring ring-3"></div>
                    </div>
                    <div className="handshake-big">🤝</div>
                    <div className="tagline">
                      <span className="lost">Find Perfect</span>
                      <span className="found">In A Crowd</span>
                    </div>
                    <div className="sparkle-burst">
                      {[...Array(12)].map((_, i) => (
                        <span key={i} className="sparkle" style={{ '--i': i }}>✦</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="slide-overlay">
                  <div className="slide-info">
                    <div className="slide-step">Step {index + 1}</div>
                    <h4>{slide.title}</h4>
                    <p className="slide-subtitle">{slide.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Story Timeline Indicators */}
            <div className="slide-indicators">
              {storySlides.map((slide, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''} ${index < currentSlide ? 'completed' : ''}`}
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setCurrentSlide(index);
                      setIsTransitioning(false);
                    }, 300);
                  }}
                  style={{ '--indicator-color': slide.color }}
                >
                  <span className="indicator-icon">{slide.emoji}</span>
                </button>
              ))}
            </div>
            </div>
          </div>
          
          {/* Orbiting Elements */}
          <div className="orbit-container" style={{ transform: `translate3d(0, ${parallaxOffset * 0.18}px, 0)` }}>
            <div className="orbit orbit-1">
              <div className="orbit-dot">💜</div>
            </div>
            <div className="orbit orbit-2">
              <div className="orbit-dot">✨</div>
            </div>
            <div className="orbit orbit-3">
              <div className="orbit-dot">💖</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" ref={featuresSectionRef}>
        <div className="section-header" data-reveal style={{ '--reveal-delay': '60ms' }}>
          <span className="section-tag">Why Viebo?</span>
          <h2 className="section-title">Dating, <span className="gradient-text">Reimagined</span></h2>
          <p className="section-subtitle">Experience a new way to meet people who share your vibe</p>
        </div>

        <div className={`features-grid ${isFeatureDeckOpen ? 'deck-open' : ''}`}>
          <div 
            className="feature-card-3d deck-card tilt-card" 
            data-reveal 
            style={{ 
              '--deck-index': 0, 
              '--reveal-delay': '80ms',
              '--tilt-x': `${cardTilts['card-0']?.x || 0}deg`,
              '--tilt-y': `${cardTilts['card-0']?.y || 0}deg`
            }}
            onMouseMove={(e) => handleCardTilt(e, 'card-0')}
            onMouseLeave={() => resetCardTilt('card-0')}
          >
            <div className="feature-icon-3d">
              <Calendar size={32} />
            </div>
            <h3>Event-Based</h3>
            <p>Create or join events with unique codes. Perfect for parties, festivals, and meetups.</p>
            <div className="feature-shine"></div>
          </div>

          <div 
            className="feature-card-3d featured deck-card tilt-card" 
            data-reveal 
            style={{ 
              '--deck-index': 1, 
              '--reveal-delay': '140ms',
              '--tilt-x': `${cardTilts['card-1']?.x || 0}deg`,
              '--tilt-y': `${cardTilts['card-1']?.y || 0}deg`
            }}
            onMouseMove={(e) => handleCardTilt(e, 'card-1')}
            onMouseLeave={() => resetCardTilt('card-1')}
          >
            <div className="feature-icon-3d">
              <Heart size={32} />
            </div>
            <h3>Anonymous Crushes</h3>
            <p>Send crushes secretly. They only know if you both match - no awkward rejections!</p>
            <div className="feature-shine"></div>
            <div className="featured-badge">
              <Star size={14} /> Popular
            </div>
          </div>

          <div 
            className="feature-card-3d deck-card tilt-card" 
            data-reveal 
            style={{ 
              '--deck-index': 2, 
              '--reveal-delay': '200ms',
              '--tilt-x': `${cardTilts['card-2']?.x || 0}deg`,
              '--tilt-y': `${cardTilts['card-2']?.y || 0}deg`
            }}
            onMouseMove={(e) => handleCardTilt(e, 'card-2')}
            onMouseLeave={() => resetCardTilt('card-2')}
          >
            <div className="feature-icon-3d">
              <MessageCircle size={32} />
            </div>
            <h3>Instant Chat</h3>
            <p>Match and start chatting instantly. Real-time messaging to keep the spark alive.</p>
            <div className="feature-shine"></div>
          </div>

          <div 
            className="feature-card-3d deck-card tilt-card" 
            data-reveal 
            style={{ 
              '--deck-index': 3, 
              '--reveal-delay': '260ms',
              '--tilt-x': `${cardTilts['card-3']?.x || 0}deg`,
              '--tilt-y': `${cardTilts['card-3']?.y || 0}deg`
            }}
            onMouseMove={(e) => handleCardTilt(e, 'card-3')}
            onMouseLeave={() => resetCardTilt('card-3')}
          >
            <div className="feature-icon-3d">
              <Users size={32} />
            </div>
            <h3>Real Connections</h3>
            <p>Meet people you'll actually see. Everyone is at the same event as you.</p>
            <div className="feature-shine"></div>
          </div>

          <div 
            className="feature-card-3d deck-card tilt-card" 
            data-reveal 
            style={{ 
              '--deck-index': 4, 
              '--reveal-delay': '320ms',
              '--tilt-x': `${cardTilts['card-4']?.x || 0}deg`,
              '--tilt-y': `${cardTilts['card-4']?.y || 0}deg`
            }}
            onMouseMove={(e) => handleCardTilt(e, 'card-4')}
            onMouseLeave={() => resetCardTilt('card-4')}
          >
            <div className="feature-icon-3d">
              <Shield size={32} />
            </div>
            <h3>Safe & Private</h3>
            <p>Your identity is protected until mutual interest. Browse with confidence.</p>
            <div className="feature-shine"></div>
          </div>

          <div 
            className="feature-card-3d deck-card tilt-card" 
            data-reveal 
            style={{ 
              '--deck-index': 5, 
              '--reveal-delay': '380ms',
              '--tilt-x': `${cardTilts['card-5']?.x || 0}deg`,
              '--tilt-y': `${cardTilts['card-5']?.y || 0}deg`
            }}
            onMouseMove={(e) => handleCardTilt(e, 'card-5')}
            onMouseLeave={() => resetCardTilt('card-5')}
          >
            <div className="feature-icon-3d">
              <Zap size={32} />
            </div>
            <h3>Instant Matches</h3>
            <p>Get notified instantly when someone likes you back. No waiting around!</p>
            <div className="feature-shine"></div>
          </div>
        </div>
      </section>

      {/* Wave Divider 1 */}
      <div className="wave-divider">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="wave-path wave-1"/>
        </svg>
      </div>



      {/* Wave Divider 2 */}
      <div className="wave-divider wave-flip">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="wave-path wave-2"/>
        </svg>
      </div>

      {/* Testimonials Carousel */}
      <section className="testimonials-section">
        <div className="section-header" data-reveal>
          <span className="section-tag">Love Stories</span>
          <h2 className="section-title">What People <span className="gradient-text">Say</span></h2>
        </div>
        <div className="testimonials-carousel">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className={`testimonial-card ${index === currentTestimonial ? 'active' : ''} ${
                index === (currentTestimonial - 1 + testimonials.length) % testimonials.length ? 'prev' : ''
              } ${
                index === (currentTestimonial + 1) % testimonials.length ? 'next' : ''
              }`}
            >
              <div className="testimonial-avatar">{testimonial.avatar}</div>
              <p className="testimonial-quote">"{testimonial.quote}"</p>
              <div className="testimonial-name">{testimonial.name}</div>
            </div>
          ))}
        </div>
        <div className="testimonial-indicators">
          {testimonials.map((_, index) => (
            <button 
              key={index}
              className={`testimonial-dot ${index === currentTestimonial ? 'active' : ''}`}
              onClick={() => setCurrentTestimonial(index)}
            />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header" data-reveal style={{ '--reveal-delay': '40ms' }}>
          <span className="section-tag">Simple & Easy</span>
          <h2 className="section-title">How <span className="gradient-text">Viebo</span> Works</h2>
        </div>

        <div className="steps-container">
          <div className="step-card" data-reveal style={{ '--reveal-delay': '100ms' }}>
            <div className="step-number">01</div>
            <div className="step-content">
              <div className="step-icon">
                <Calendar size={28} />
              </div>
              <h3>Join an Event</h3>
              <p>Create your own event or enter a code to join one. It's that simple!</p>
            </div>
            <div className="step-line"></div>
          </div>

          <div className="step-card" data-reveal style={{ '--reveal-delay': '180ms' }}>
            <div className="step-number">02</div>
            <div className="step-content">
              <div className="step-icon">
                <Heart size={28} />
              </div>
              <h3>Send Crushes</h3>
              <p>Browse attendees and secretly send a crush to people you're interested in.</p>
            </div>
            <div className="step-line"></div>
          </div>

          <div className="step-card" data-reveal style={{ '--reveal-delay': '260ms' }}>
            <div className="step-number">03</div>
            <div className="step-content">
              <div className="step-icon">
                <MessageCircle size={28} />
              </div>
              <h3>Match & Chat</h3>
              <p>When you both crush on each other, start chatting and make magic happen!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-glow"></div>
        <div className="cta-content" data-reveal style={{ '--reveal-delay': '80ms' }}>
          <h2>Ready to Find Your <span className="gradient-text">Match</span>?</h2>
          <p>Join thousands of people finding love at real events</p>
          <Link to="/register" className="btn-glow large">
            <Sparkles size={20} />
            <span>Get Started Free</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Horizontal Scroll Gallery - Love Moments */}
      <section className="gallery-section">
        <div className="section-header" data-reveal>
          <span className="section-tag">Love Moments</span>
          <h2 className="section-title">Real <span className="gradient-text">Connections</span></h2>
        </div>
        <div className="horizontal-gallery">
          <div className="gallery-track">
            <div className="gallery-item">🎉</div>
            <div className="gallery-item">💕</div>
            <div className="gallery-item">🎵</div>
            <div className="gallery-item">✨</div>
            <div className="gallery-item">🌟</div>
            <div className="gallery-item">💖</div>
            <div className="gallery-item">🎊</div>
            <div className="gallery-item">💜</div>
            {/* Duplicated for seamless loop */}
            <div className="gallery-item">🎉</div>
            <div className="gallery-item">💕</div>
            <div className="gallery-item">🎵</div>
            <div className="gallery-item">✨</div>
            <div className="gallery-item">🌟</div>
            <div className="gallery-item">💖</div>
            <div className="gallery-item">🎊</div>
            <div className="gallery-item">💜</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="logo">Viebo 💕</h3>
            <p>Making real connections at real events</p>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Viebo. Made with 💖 for lovers everywhere</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #000004 0%, #02010a 25%, #04020e 50%, #02010a 75%, #000004 100%);
          overflow: visible;
          position: relative;
          touch-action: manipulation;
          -webkit-overflow-scrolling: touch;
        }

        .landing-page::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          background: radial-gradient(circle at 20% 30%, rgba(0, 245, 255, 0.12), transparent 45%),
                      radial-gradient(circle at 80% 65%, rgba(255, 0, 110, 0.1), transparent 50%);
          opacity: 0;
          transform: translateX(-8%);
          transition: opacity 1s ease, transform 1.2s ease;
        }

        .landing-page.hero-loaded::before {
          opacity: 1;
          transform: translateX(0);
        }

        .particle-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .floating-elements {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .floating-heart {
          position: absolute;
          animation: floatUp linear infinite;
          bottom: -50px;
        }

        .ambient-blobs {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .blob {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.15;
          animation: blobDrift 16s ease-in-out infinite;
        }

        .blob-cyan {
          top: 12%;
          left: 8%;
          background: rgba(0, 245, 255, 0.7);
        }

        .blob-pink {
          top: 42%;
          right: 10%;
          background: rgba(255, 0, 110, 0.7);
          animation-delay: 2.4s;
        }

        .blob-violet {
          bottom: 6%;
          left: 35%;
          background: rgba(139, 92, 246, 0.7);
          animation-delay: 4.8s;
        }

        @keyframes blobDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.08); }
        }

        /* Cursor Glow Trail */
        .cursor-glow-trail {
          position: fixed;
          width: 400px;
          height: 400px;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(0, 245, 255, 0.15) 0%, rgba(255, 0, 110, 0.08) 30%, transparent 70%);
          border-radius: 50%;
          filter: blur(40px);
          transition: opacity 0.3s ease;
          mix-blend-mode: screen;
        }

        /* Noise/Grain Overlay */
        .noise-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9998;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        /* Aurora Borealis Effect */
        .aurora-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .aurora {
          position: absolute;
          width: 200%;
          height: 200px;
          filter: blur(60px);
          opacity: 0.3;
          animation: auroraWave 15s ease-in-out infinite;
        }

        .aurora-1 {
          top: 5%;
          left: -50%;
          background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.5), rgba(139, 92, 246, 0.5), transparent);
          animation-delay: 0s;
        }

        .aurora-2 {
          top: 15%;
          left: -30%;
          background: linear-gradient(90deg, transparent, rgba(255, 0, 110, 0.4), rgba(0, 245, 255, 0.4), transparent);
          animation-delay: 5s;
        }

        .aurora-3 {
          top: 25%;
          left: -70%;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), rgba(255, 195, 0, 0.3), transparent);
          animation-delay: 10s;
        }

        @keyframes auroraWave {
          0%, 100% { transform: translateX(0) skewX(-5deg); }
          50% { transform: translateX(30%) skewX(5deg); }
        }

        /* Particle Burst Container */
        .particle-burst-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 10000;
        }

        .burst-particle {
          position: fixed;
          font-size: 24px;
          transform: translate(-50%, -50%);
          animation: burstOut 1s ease-out forwards;
        }

        @keyframes burstOut {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(0.5);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-150px) scale(1.2);
          }
        }

        /* Morphing Text Animation */
        .morph-text {
          display: inline-block;
          animation: morphIn 0.6s ease-out;
        }

        @keyframes morphIn {
          0% {
            opacity: 0;
            filter: blur(10px);
            transform: translateY(20px) scale(0.9);
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0) scale(1);
          }
        }

        /* Glitch Text Effect */
        .glitch-text {
          position: relative;
        }

        .glitch-text:hover::before,
        .glitch-text:hover::after {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: transparent;
        }

        .glitch-text:hover::before {
          color: #00f5ff;
          animation: glitch-1 0.3s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
        }

        .glitch-text:hover::after {
          color: #ff006e;
          animation: glitch-2 0.3s infinite;
          clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
        }

        @keyframes glitch-1 {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(2px); }
        }

        @keyframes glitch-2 {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(3px); }
          40% { transform: translateX(-3px); }
          60% { transform: translateX(1px); }
          80% { transform: translateX(-2px); }
        }

        /* Typewriter Effect */
        .typewriter {
          min-height: 80px;
        }

        .typewriter-cursor {
          animation: cursorBlink 1s step-end infinite;
          color: #00f5ff;
          font-weight: 100;
        }

        @keyframes cursorBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        /* Ripple Effect */
        .ripple-btn {
          position: relative;
          overflow: hidden;
        }

        .ripple {
          position: absolute;
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          animation: rippleExpand 0.6s ease-out;
          pointer-events: none;
        }

        @keyframes rippleExpand {
          to {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
          }
        }

        /* 3D Tilt Cards */
        .tilt-card {
          transform-style: preserve-3d;
          transform: perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
          transition: transform 0.1s ease-out;
        }

        .tilt-card:hover {
          transform: perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateZ(20px);
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg) scale(0.5);
            opacity: 0;
          }
        }

        /* Hero Section */
        .hero-3d {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 120px 80px;
          position: relative;
          z-index: 10;
          gap: 60px;
        }

        .hero-content {
          flex: 1;
          max-width: 600px;
          overflow: visible;
        }

        /* Viebo Logo Styles */
        .viebo-logo-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-top: 10px;
          overflow: visible;
        }

        /* Viebo Text Logo */
        .viebo-text {
          display: flex;
          font-family: 'Poppins', sans-serif;
          font-size: 72px;
          font-weight: 800;
          font-style: italic;
          letter-spacing: 2px;
        }

        .viebo-text .letter {
          display: inline-block;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 4px 15px rgba(196, 76, 255, 0.4));
        }

        .hero-intro .hero-letter {
          opacity: 0;
          transform: translateY(28px) scale(0.94);
        }

        .hero-loaded .hero-letter {
          animation: logoLetterIn 650ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: calc(0.1s + (var(--letter-index, 0) * 80ms));
        }

        .hero-intro .i-heart-dot {
          opacity: 0;
          transform: translateX(-50%) scale(0.6);
        }

        .hero-loaded .i-heart-dot {
          animation: iHeartAppear 550ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.08s;
        }

        @keyframes logoLetterIn {
          from { opacity: 0; transform: translateY(28px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes iHeartAppear {
          0% { opacity: 0; transform: translateX(-50%) scale(0.6); }
          70% { opacity: 1; transform: translateX(-50%) scale(1.2); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }

        .letter-v {
          background: linear-gradient(180deg, #ff5f8f 0%, #ff6b9d 50%, #ff8fab 100%);
          margin-right: 2px;
        }
        .letter-i {
          position: relative;
          display: inline-block !important;
          background: none !important;
          -webkit-text-fill-color: unset !important;
          overflow: visible;
          vertical-align: baseline;
        }
        .i-heart-dot {
          position: absolute;
          top: -0.60em;
          left: 63%;
          transform: translateX(-50%);
          width: 22px;
          height: 22px;
          animation: iHeartPulse 1.5s ease-in-out infinite, iHeartGlow 2s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(196, 76, 255, 0.8));
        }
        .i-heart-svg {
          width: 100%;
          height: 100%;
        }
        .i-stem {
          background: linear-gradient(180deg, #e056c0 0%, #d44cbf 50%, #c44cff 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: inherit;
        }
        @keyframes iHeartPulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.15); }
        }
        @keyframes iHeartGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(196, 76, 255, 0.8)); }
          50% { filter: drop-shadow(0 0 15px rgba(255, 107, 157, 1)) drop-shadow(0 0 25px rgba(196, 76, 255, 0.6)); }
        }
        .letter-e {
          background: linear-gradient(180deg, #c44cff 0%, #b050f7 50%, #a855f7 100%);
        }
        .letter-b {
          background: linear-gradient(180deg, #a855f7 0%, #9955f6 50%, #8b5cf6 100%);
        }
        .letter-o {
          background: linear-gradient(180deg, #8b5cf6 0%, #5eaaff 50%, #00d4ff 100%);
        }

        .hero-title-3d {
          font-size: 64px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 24px;
        }

        .title-line {
          display: block;
          color: #ffffff;
          text-shadow: 0 0 40px rgba(255, 255, 255, 0.1);
        }

        .title-highlight {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #00f5ff 0%, #ff006e 50%, #ffc300 100%);
          background-size: 220% 220%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.4));
          animation: gradientBreathe 9s ease-in-out infinite;
        }

        @keyframes gradientBreathe {
          0%, 100% { background-position: 0% 40%; }
          50% { background-position: 100% 60%; }
        }

        .heart-icon {
          color: #ff006e;
          animation: heartbeat 1.5s ease-in-out infinite;
          filter: drop-shadow(0 0 15px rgba(255, 0, 110, 0.6));
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .hero-description {
          font-size: 18px;
          color: #a0aec0;
          line-height: 1.7;
          margin-bottom: 32px;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          margin-bottom: 48px;
        }

        .btn-glow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #00f5ff 100%);
          border: none;
          border-radius: 50px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 10px 40px rgba(255, 0, 110, 0.4), 0 0 60px rgba(0, 245, 255, 0.2);
          position: relative;
          overflow: hidden;
          transform: translate3d(var(--mx, 0px), var(--my, 0px), 0);
          will-change: transform, box-shadow;
        }

        .btn-glow::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .btn-glow:hover::before {
          left: 100%;
        }

        .btn-glow:hover {
          transform: translate3d(var(--mx, 0px), calc(var(--my, 0px) - 3px), 0) scale(1.02);
          box-shadow: 0 20px 60px rgba(255, 0, 110, 0.5), 0 0 80px rgba(0, 245, 255, 0.3);
        }

        .btn-glow.large {
          padding: 20px 40px;
          font-size: 18px;
        }

        .btn-glass {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: rgba(0, 245, 255, 0.05);
          border: 1px solid rgba(0, 245, 255, 0.3);
          border-radius: 50px;
          color: #00f5ff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          transform: translate3d(var(--mx, 0px), var(--my, 0px), 0);
          will-change: transform, box-shadow;
        }

        .btn-glass:hover {
          background: rgba(0, 245, 255, 0.15);
          border-color: rgba(0, 245, 255, 0.6);
          transform: translate3d(var(--mx, 0px), calc(var(--my, 0px) - 3px), 0);
          box-shadow: 0 10px 40px rgba(0, 245, 255, 0.2);
          color: #ffffff;
        }

        /* Hero Visual - Enhanced Couple Slideshow */
        .hero-visual {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          perspective: 1200px;
        }

        .cursor-sparks {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 130;
        }

        .cursor-spark {
          position: absolute;
          transform: translate(-50%, -50%);
          color: #ffc300;
          font-size: 12px;
          text-shadow: 0 0 8px rgba(255, 195, 0, 0.8), 0 0 16px rgba(255, 0, 110, 0.5);
          animation: cursorSparkOut 700ms ease-out forwards;
        }

        @keyframes cursorSparkOut {
          0% { opacity: 0.95; transform: translate(-50%, -50%) scale(0.7) rotate(0deg); }
          100% { opacity: 0; transform: translate(-50%, -72%) scale(1.25) rotate(25deg); }
        }

        .slideshow-container {
          position: relative;
          width: 360px;
          height: 520px;
          border-radius: 32px;
          overflow: hidden;
          isolation: isolate;
          padding: 2px;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.9),
                      0 0 50px rgba(0, 245, 255, 0.25),
                      0 0 100px rgba(255, 0, 110, 0.2),
                      inset 0 0 60px rgba(0, 0, 0, 0.3);
          background: #334155;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          animation: hologramDrift 6s ease-in-out infinite;
        }

        @keyframes hologramDrift {
          0%, 100% { transform: rotateX(0deg) rotateY(0deg) translateY(0); }
          50% { transform: rotateX(2deg) rotateY(-2deg) translateY(-4px); }
        }

        .slideshow-content {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          border-radius: 30px;
          overflow: hidden;
          background: linear-gradient(145deg, rgba(10, 5, 32, 0.98), rgba(3, 0, 20, 0.99));
        }

        .slideshow-content::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 90;
          background: linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.08) 48%, transparent 65%);
          transform: translateX(-120%);
          animation: edgeSweep 6s ease-in-out infinite;
        }

        @keyframes edgeSweep {
          0%, 70%, 100% { transform: translateX(-120%); }
          88% { transform: translateX(120%); }
        }

        .slideshow-container.transitioning {
          transform: scale(0.96) rotateX(5deg);
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.9),
                      0 0 100px rgba(255, 0, 110, 0.5),
                      0 0 150px rgba(0, 245, 255, 0.3);
          animation: containerPulse 0.3s ease-out;
        }

        .slideshow-container.transitioning .slide.active {
          filter: blur(4px) brightness(0.8);
          transform: perspective(1000px) scale(0.96);
        }

        @keyframes containerPulse {
          0% { border-color: rgba(0, 245, 255, 0.4); }
          50% { border-color: rgba(255, 0, 110, 0.8); }
          100% { border-color: rgba(0, 245, 255, 0.4); }
        }

        .slideshow-container::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            #ec4899 10%,
            #8b5cf6 22%,
            #00f5ff 34%,
            transparent 48%,
            transparent 100%
          );
          animation: shine-spin 8s linear infinite;
          pointer-events: none;
          z-index: 0;
          transform-origin: center center;
          transform: translate(-50%, -50%);
          opacity: 0.95;
        }

        @keyframes shine-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .slideshow-container::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          right: 2px;
          bottom: 2px;
          border-radius: 30px;
          pointer-events: none;
          z-index: 100;
          background: linear-gradient(180deg,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 20%,
            transparent 80%,
            rgba(0, 0, 0, 0.3) 100%);
        }

        /* Story Progress Bar - Enhanced */
        .story-progress {
          position: absolute;
          top: 12px;
          left: 16px;
          right: 16px;
          z-index: 20;
        }

        .progress-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 8px;
          font-weight: 700;
          text-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
          animation: labelGlow 2s ease-in-out infinite;
        }

        @keyframes labelGlow {
          0%, 100% { text-shadow: 0 0 10px rgba(0, 245, 255, 0.5); }
          50% { text-shadow: 0 0 20px rgba(255, 0, 110, 0.7); }
        }

        .progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          overflow: visible;
          position: relative;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00f5ff, #ff006e, #ffc300, #00f5ff);
          background-size: 300% 100%;
          border-radius: 10px;
          transition: width 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 0 15px rgba(0, 245, 255, 0.6),
                      0 0 30px rgba(255, 0, 110, 0.4);
          animation: progressShine 3s linear infinite;
          position: relative;
        }

        @keyframes progressShine {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 10px #00f5ff, 0 0 20px #ff006e;
          animation: progressDot 1s ease-in-out infinite;
        }

        @keyframes progressDot {
          0%, 100% { transform: translateY(-50%) scale(1); box-shadow: 0 0 10px #00f5ff, 0 0 20px #ff006e; }
          50% { transform: translateY(-50%) scale(1.5); box-shadow: 0 0 20px #00f5ff, 0 0 40px #ff006e; }
        }

        /* Slide Styles - Modern 3D Transitions */
        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transform: perspective(1000px) rotateY(90deg) scale(0.8) translateZ(-200px);
          transition: all 0.55s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
          overflow: hidden;
          filter: blur(10px) brightness(0.5);
          transform-style: preserve-3d;
        }

        .slide.active {
          opacity: 1;
          transform: perspective(1000px) rotateY(0deg) scale(1) translateZ(0);
          pointer-events: auto;
          filter: blur(0) brightness(1);
          animation: slideGlow 3s ease-in-out infinite;
        }

        [data-reveal] {
          opacity: 0;
          transform: translateY(50px) scale(0.9);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.8s cubic-bezier(0.22, 1, 0.36, 1),
                      filter 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--reveal-delay, 0ms);
          filter: blur(10px);
        }

        [data-reveal].revealed {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }

        @keyframes slideGlow {
          0%, 100% { box-shadow: inset 0 0 30px rgba(0, 245, 255, 0.1); }
          50% { box-shadow: inset 0 0 60px rgba(255, 0, 110, 0.15); }
        }

        /* Alternate slide directions for variety */
        .slide-scene-event { --enter-rotation: -90deg; }
        .slide-scene-phones { --enter-rotation: 90deg; }
        .slide-scene-crush { --enter-rotation: -45deg; transform-origin: left center; }
        .slide-scene-match { --enter-rotation: 0deg; transform: scale(0) rotate(180deg); }
        .slide-scene-chat { --enter-rotation: 45deg; transform-origin: right center; }
        .slide-scene-hug { --enter-rotation: -90deg; }
        .slide-scene-soulmate { --enter-rotation: 0deg; transform: scale(1.5) translateY(-100%); }

        .slide-scene-match:not(.active) {
          transform: scale(0) rotate(180deg);
          filter: blur(20px);
        }

        .slide-scene-soulmate:not(.active) {
          transform: scale(1.5) translateY(-100%);
          filter: blur(15px);
        }

        .slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 8s ease-out;
        }

        .slide.active img {
          transform: scale(1.1);
        }

        /* Animated Pattern Overlay */
        .slide-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, var(--slide-color, #ff006e) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 245, 255, 0.3) 0%, transparent 50%);
          opacity: 0.3;
          z-index: 1;
          mix-blend-mode: overlay;
          animation: patternPulse 4s ease-in-out infinite;
        }

        @keyframes patternPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }

        /* Dress Shimmer Effect */
        .dress-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.3),
            rgba(255, 255, 255, 0.1),
            transparent
          );
          z-index: 2;
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }

        .slide-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, 
            rgba(3, 0, 20, 0.3) 0%,
            transparent 20%, 
            transparent 50%,
            rgba(3, 0, 20, 0.5) 70%,
            rgba(3, 0, 20, 0.98) 100%
          );
          z-index: 2;
        }

        .slide-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 25px;
          z-index: 3;
        }

        .slide-emoji-badge {
          position: absolute;
          top: 50px;
          left: 20px;
          font-size: 40px;
          filter: drop-shadow(0 5px 20px rgba(0, 0, 0, 0.5));
          animation: emojiBounce 2s ease-in-out infinite;
          z-index: 5;
        }

        @keyframes emojiBounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        .slide-chapter {
          font-size: 11px;
          color: var(--slide-color, #00f5ff);
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 8px;
          font-weight: 700;
          text-shadow: 0 0 20px var(--slide-color, #00f5ff);
        }

        .slide-info h4 {
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 6px;
          background: linear-gradient(135deg, #ffffff 0%, var(--slide-color, #00f5ff) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: none;
        }

        .slide-subtitle {
          font-size: 16px;
          color: #ffc300;
          font-weight: 600;
          margin-bottom: 6px;
          text-shadow: 0 0 20px rgba(255, 195, 0, 0.6);
        }

        .slide-description {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }

        /* Theme-specific styles */
        .slide-ethnic .slide-pattern {
          background: 
            radial-gradient(circle at 30% 70%, rgba(255, 107, 53, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(255, 215, 0, 0.3) 0%, transparent 50%);
        }

        .slide-sangeet .slide-pattern {
          background: 
            radial-gradient(circle at 20% 80%, rgba(233, 30, 99, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(156, 39, 176, 0.3) 0%, transparent 50%);
        }

        .slide-wedding .slide-pattern {
          background: 
            radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.3) 0%, transparent 60%),
            radial-gradient(circle at 20% 80%, rgba(255, 0, 110, 0.2) 0%, transparent 50%);
        }

        .slide-modern .slide-pattern {
          background: 
            radial-gradient(circle at 30% 70%, rgba(0, 245, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(255, 0, 110, 0.3) 0%, transparent 50%);
        }

        /* Soulmate Special Slide */
        .special-slide .soulmate-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(145deg, 
            rgba(255, 0, 110, 0.15) 0%, 
            rgba(10, 5, 32, 0.98) 30%,
            rgba(3, 0, 20, 0.98) 70%,
            rgba(0, 245, 255, 0.15) 100%
          );
          position: relative;
        }

        .soulmate-rings {
          position: absolute;
          width: 200px;
          height: 200px;
        }

        .ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid;
          animation: ringPulse 3s ease-in-out infinite;
        }

        .ring-1 {
          width: 120px;
          height: 120px;
          border-color: rgba(0, 245, 255, 0.5);
          animation-delay: 0s;
        }

        .ring-2 {
          width: 160px;
          height: 160px;
          border-color: rgba(255, 0, 110, 0.4);
          animation-delay: 0.5s;
        }

        .ring-3 {
          width: 200px;
          height: 200px;
          border-color: rgba(255, 195, 0, 0.3);
          animation-delay: 1s;
        }

        @keyframes ringPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }

        .handshake-icon {
          animation: handshakePulse 2s ease-in-out infinite;
          filter: drop-shadow(0 0 40px rgba(0, 245, 255, 0.8));
          margin-bottom: 20px;
          z-index: 1;
        }

        .handshake-emoji {
          font-size: 90px;
          display: block;
        }

        @keyframes handshakePulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            filter: drop-shadow(0 0 40px rgba(0, 245, 255, 0.8));
          }
          50% { 
            transform: scale(1.2) rotate(-10deg); 
            filter: drop-shadow(0 0 60px rgba(255, 0, 110, 0.9));
          }
        }

        .hearts-animation {
          display: flex;
          gap: 25px;
          font-size: 36px;
          z-index: 1;
        }

        .hearts-animation span {
          animation: floatHeart 2s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(255, 0, 110, 0.7));
        }

        .hearts-animation span:nth-child(1) { animation-delay: 0s; }
        .hearts-animation span:nth-child(2) { animation-delay: 0.3s; }
        .hearts-animation span:nth-child(3) { animation-delay: 0.6s; }

        @keyframes floatHeart {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.3); }
        }

        .sparkle-burst {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .sparkle {
          position: absolute;
          top: 50%;
          left: 50%;
          font-size: 16px;
          color: #ffc300;
          animation: sparkle 2s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.15s);
        }

        @keyframes sparkle {
          0%, 100% {
            transform: translate(-50%, -50%) rotate(calc(var(--i) * 30deg)) translateY(-80px) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) rotate(calc(var(--i) * 30deg)) translateY(-120px) scale(1);
            opacity: 1;
          }
        }

        .special-slide .slide-info h4 {
          font-size: 28px;
          text-align: center;
          background: linear-gradient(135deg, #00f5ff, #ff006e, #ffc300);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* ============ SCENE ANIMATIONS ============ */

        .scene-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, rgba(10, 5, 32, 0.98), rgba(3, 0, 20, 0.99));
        }

        .scene-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 70%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .slide-step {
          font-size: 11px;
          color: var(--slide-color, #00f5ff);
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 8px;
          font-weight: 700;
          text-shadow: 0 0 20px var(--slide-color, #00f5ff);
        }

        /* Scene 1: Event */
        .scene-event {
          background: radial-gradient(ellipse at center, rgba(255, 0, 110, 0.1), transparent 70%);
        }

        .event-lights {
          position: absolute;
          top: 20%;
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .event-lights .light {
          font-size: 24px;
          color: #ffc300;
          animation: disco 0.5s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.1s);
          filter: drop-shadow(0 0 10px #ffc300);
        }

        @keyframes disco {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .crowd {
          display: flex;
          gap: 20px;
          font-size: 50px;
          margin-top: 30px;
        }

        .crowd .person {
          animation: bobPerson 1s ease-in-out infinite;
          filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.5));
        }

        .crowd .person.boy { animation-delay: 0s; }
        .crowd .person.girl { animation-delay: 0.5s; }
        .crowd .person.random { opacity: 0.4; animation-delay: 0.25s; }

        @keyframes bobPerson {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .event-text {
          margin-top: 20px;
          font-size: 18px;
          color: #ffc300;
          font-weight: 600;
          text-shadow: 0 0 20px rgba(255, 195, 0, 0.6);
        }

        /* Scene 2: Phones */
        .scene-phones {
          background: radial-gradient(ellipse at center, rgba(0, 245, 255, 0.1), transparent 70%);
        }

        .phone-container {
          display: flex;
          gap: 60px;
          align-items: center;
        }

        .phone {
          width: 80px;
          height: 140px;
          background: linear-gradient(145deg, #1a1a2e, #16213e);
          border-radius: 15px;
          border: 2px solid rgba(0, 245, 255, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          animation: phoneFloat 2s ease-in-out infinite;
        }

        .phone-left { animation-delay: 0s; }
        .phone-right { animation-delay: 0.5s; }

        @keyframes phoneFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        .phone-screen {
          width: 70px;
          height: 110px;
          background: linear-gradient(145deg, #030014, #0a0520);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .app-icon {
          font-size: 32px;
          font-weight: 900;
          background: linear-gradient(135deg, #00f5ff, #ff006e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: pulse 1s ease-in-out infinite;
        }

        .tap-effect {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0, 245, 255, 0.3);
          animation: tapRipple 1.5s ease-out infinite;
        }

        @keyframes tapRipple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        .person-label {
          position: absolute;
          bottom: -35px;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.8);
        }

        /* Scene 3: Crush */
        .scene-crush {
          background: radial-gradient(ellipse at center, rgba(255, 0, 110, 0.1), transparent 70%);
        }

        .crush-animation {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .person-side {
          font-size: 60px;
          filter: drop-shadow(0 5px 20px rgba(0, 0, 0, 0.5));
        }

        .hearts-flying {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .flying-heart {
          font-size: 30px;
          animation: flyHeart 2s ease-in-out infinite;
          animation-delay: var(--delay);
        }

        @keyframes flyHeart {
          0%, 100% { transform: translateX(-50px) scale(0.5); opacity: 0; }
          50% { transform: translateX(50px) scale(1.2); opacity: 1; }
        }

        .crush-text {
          margin-top: 30px;
          font-size: 16px;
          color: #ff006e;
          animation: blink 1s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Scene 4: Match */
        .scene-match {
          background: radial-gradient(ellipse at center, rgba(255, 195, 0, 0.15), transparent 70%);
        }

        .match-explosion {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .confetti {
          position: absolute;
          top: 50%;
          left: 50%;
          font-size: 20px;
          animation: explode 2s ease-out infinite;
          animation-delay: calc(var(--i) * 0.1s);
        }

        @keyframes explode {
          0% {
            transform: translate(-50%, -50%) rotate(calc(var(--i) * 30deg)) translateY(0) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(calc(var(--i) * 30deg)) translateY(-150px) scale(1);
            opacity: 0;
          }
        }

        .match-badge-big {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 36px;
          animation: matchBounce 0.6s ease-in-out infinite;
          z-index: 5;
        }

        .match-badge-big .match-text {
          font-size: 32px;
          font-weight: 900;
          background: linear-gradient(135deg, #ffc300, #ff006e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: none;
        }

        @keyframes matchBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        .matched-couple {
          margin-top: 25px;
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 50px;
        }

        .heart-link {
          animation: heartBeat 0.8s ease-in-out infinite;
          font-size: 40px;
        }

        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        /* Scene 5: Chat */
        .scene-chat {
          background: radial-gradient(ellipse at center, rgba(0, 245, 255, 0.1), transparent 70%);
        }

        .chat-bubbles {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 80%;
          max-width: 250px;
        }

        .bubble {
          padding: 10px 16px;
          border-radius: 18px;
          font-size: 14px;
          animation: bubbleIn 0.5s ease-out forwards;
          opacity: 0;
          max-width: 75%;
        }

        .bubble.left {
          background: linear-gradient(135deg, rgba(0, 245, 255, 0.3), rgba(0, 245, 255, 0.1));
          border: 1px solid rgba(0, 245, 255, 0.4);
          align-self: flex-start;
          border-bottom-left-radius: 5px;
        }

        .bubble.right {
          background: linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(255, 0, 110, 0.1));
          border: 1px solid rgba(255, 0, 110, 0.4);
          align-self: flex-end;
          border-bottom-right-radius: 5px;
        }

        .bubble:nth-child(1) { animation-delay: 0s; }
        .bubble:nth-child(2) { animation-delay: 0.5s; }
        .bubble:nth-child(3) { animation-delay: 1s; }
        .bubble:nth-child(4) { animation-delay: 1.5s; }

        @keyframes bubbleIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .happy-faces {
          display: flex;
          gap: 80px;
          margin-top: 20px;
        }

        .face {
          font-size: 40px;
          animation: nod 1s ease-in-out infinite;
        }

        .face:nth-child(2) { animation-delay: 0.5s; }

        @keyframes nod {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }

        /* Scene 6: Hug */
        .scene-hug {
          background: radial-gradient(ellipse at center, rgba(255, 0, 110, 0.15), transparent 70%);
        }

        .hug-animation {
          animation: hugPulse 2s ease-in-out infinite;
        }

        .hug-emoji {
          font-size: 80px;
          filter: drop-shadow(0 0 30px rgba(255, 0, 110, 0.5));
        }

        @keyframes hugPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .couple-together {
          font-size: 70px;
          margin-top: 15px;
          animation: gentleRock 3s ease-in-out infinite;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5));
        }

        @keyframes gentleRock {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        .love-aura {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .aura-heart {
          position: absolute;
          top: 50%;
          left: 50%;
          font-size: 24px;
          animation: auraFloat 3s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.5s);
        }

        @keyframes auraFloat {
          0%, 100% {
            transform: translate(-50%, -50%) rotate(calc(var(--i) * 60deg)) translateY(-80px) scale(0.5);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) rotate(calc(var(--i) * 60deg)) translateY(-120px) scale(1);
            opacity: 1;
          }
        }

        /* Scene 7: Soulmate Final */
        .scene-soulmate {
          background: radial-gradient(ellipse at center, rgba(255, 195, 0, 0.1), transparent 60%),
                      radial-gradient(ellipse at 30% 30%, rgba(0, 245, 255, 0.1), transparent 50%),
                      radial-gradient(ellipse at 70% 70%, rgba(255, 0, 110, 0.1), transparent 50%);
        }

        .scene-soulmate .soulmate-rings {
          position: absolute;
          width: 250px;
          height: 250px;
        }

        .handshake-big {
          font-size: 100px;
          animation: handshakeShake 2s ease-in-out infinite;
          filter: drop-shadow(0 0 50px rgba(255, 195, 0, 0.6));
          z-index: 5;
        }

        @keyframes handshakeShake {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(-10deg); }
          75% { transform: scale(1.1) rotate(10deg); }
        }

        .tagline {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 5;
        }

        .tagline .lost {
          font-size: 24px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.6);
          animation: fadeInUp 1s ease-out forwards;
        }

        .tagline .found {
          font-size: 28px;
          font-weight: 900;
          background: linear-gradient(135deg, #00f5ff, #ff006e, #ffc300);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeInUp 1s ease-out 0.5s forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .scene-soulmate .sparkle-burst {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .scene-soulmate .sparkle {
          position: absolute;
          top: 50%;
          left: 50%;
          font-size: 20px;
          color: #ffc300;
          animation: sparkle 2.5s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.2s);
        }

        /* ============ END SCENE ANIMATIONS ============ */

        /* Enhanced Story Indicators */
        .slide-indicators {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 10;
          background: rgba(0, 0, 0, 0.3);
          padding: 8px 16px;
          border-radius: 30px;
          backdrop-filter: blur(10px);
        }

        .indicator {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.15);
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: visible;
          backdrop-filter: blur(10px);
        }

        .indicator::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--indicator-color, #00f5ff), #ff006e);
          opacity: 0;
          transform: scale(0);
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .indicator-icon {
          font-size: 15px;
          opacity: 0.5;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          z-index: 1;
          filter: grayscale(50%);
        }

        .indicator.active {
          background: transparent;
          border-color: transparent;
          transform: scale(1.3) translateY(-5px);
          box-shadow: 0 10px 40px var(--indicator-color, #00f5ff),
                      0 0 20px rgba(255, 0, 110, 0.5);
        }

        .indicator.active::before {
          opacity: 1;
          transform: scale(1);
          animation: indicatorPulse 2s ease-in-out infinite;
        }

        @keyframes indicatorPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 var(--indicator-color, rgba(0, 245, 255, 0.5)); }
          50% { transform: scale(1.1); box-shadow: 0 0 0 8px transparent; }
        }

        .indicator.active .indicator-icon {
          opacity: 1;
          transform: scale(1.3);
          filter: grayscale(0%) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
          animation: iconBounce 1s ease-in-out infinite;
        }

        @keyframes iconBounce {
          0%, 100% { transform: scale(1.3) translateY(0); }
          50% { transform: scale(1.4) translateY(-3px); }
        }

        .indicator.completed {
          background: rgba(0, 245, 255, 0.2);
          border-color: rgba(0, 245, 255, 0.6);
          box-shadow: 0 0 15px rgba(0, 245, 255, 0.3);
        }

        .indicator.completed .indicator-icon {
          opacity: 0.9;
          filter: grayscale(0%);
        }

        .indicator:hover:not(.active) {
          border-color: var(--indicator-color, #00f5ff);
          transform: scale(1.2) translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .indicator:hover .indicator-icon {
          transform: scale(1.2);
          filter: grayscale(0%);
        }

        .match-badge {
          position: absolute;
          top: 50px;
          right: 20px;
          width: 44px;
          height: 44px;
          background: rgba(255, 0, 110, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: matchPulse 2s ease-in-out infinite;
          box-shadow: 0 0 25px rgba(255, 0, 110, 0.5);
          z-index: 5;
          border: 2px solid rgba(255, 0, 110, 0.4);
        }

        @keyframes matchPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 110, 0.6); }
          50% { transform: scale(1.15); box-shadow: 0 0 35px 20px rgba(255, 0, 110, 0.3); }
        }

        /* Orbit Animation */
        .orbit-container {
          position: absolute;
          width: 500px;
          height: 500px;
          pointer-events: none;
        }

        .orbit {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 1px dashed rgba(0, 245, 255, 0.25);
          border-radius: 50%;
        }

        .orbit-1 {
          width: 400px;
          height: 400px;
          animation: spin 20s linear infinite;
        }

        .orbit-2 {
          width: 480px;
          height: 480px;
          animation: spin 25s linear infinite reverse;
        }

        .orbit-3 {
          width: 560px;
          height: 560px;
          animation: spin 30s linear infinite;
        }

        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .orbit-dot {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%) translateY(-50%);
          font-size: 24px;
          filter: drop-shadow(0 0 10px rgba(255, 195, 0, 0.6));
        }

        /* Features Section */
        .features-section {
          padding: 100px 80px;
          position: relative;
          z-index: 10;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-tag {
          display: inline-block;
          background: linear-gradient(135deg, rgba(255, 195, 0, 0.1), rgba(255, 0, 110, 0.1));
          border: 1px solid rgba(255, 195, 0, 0.4);
          padding: 6px 16px;
          border-radius: 50px;
          font-size: 14px;
          color: #ffc300;
          margin-bottom: 16px;
          text-shadow: 0 0 10px rgba(255, 195, 0, 0.4);
        }

        .section-title {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #ffffff;
        }

        .section-subtitle {
          font-size: 18px;
          color: #a0aec0;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          perspective: 2000px;
          transform-style: preserve-3d;
          position: relative;
        }

        /* Glowing center point where deck starts */
        .features-grid::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 0, 110, 0.5) 0%, rgba(0, 245, 255, 0.3) 30%, transparent 70%);
          transform: translate(-50%, -50%);
          border-radius: 50%;
          opacity: 0;
          pointer-events: none;
          z-index: 100;
          transition: opacity 0.5s ease;
        }

        .features-grid:not(.deck-open)::before {
          opacity: 1;
          animation: deckGlowPulse 2s ease-in-out infinite;
        }

        .features-grid.deck-open::before {
          opacity: 0;
          transition: opacity 1s ease 0.3s;
        }

        @keyframes deckGlowPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.3); }
        }

        /* Initial stacked deck state */
        .deck-card {
          opacity: 0;
          transform-origin: center center;
          position: relative;
          transform: translateY(100px) rotateX(45deg) scale(0.6);
          filter: blur(4px);
          pointer-events: none;
          /* Smooth collapse back to deck when scrolling away */
          transition: 
            opacity 0.3s ease,
            transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
            filter 0.3s ease;
        }

        /* Staggered positions using nth-child for the deck effect */
        .features-grid:not(.deck-open) .deck-card:nth-child(1) { transform: translateY(60px) translateX(50px) rotateX(50deg) rotateZ(-8deg) scale(0.65); z-index: 6; transition-delay: 250ms; }
        .features-grid:not(.deck-open) .deck-card:nth-child(2) { transform: translateY(70px) translateX(30px) rotateX(48deg) rotateZ(-4deg) scale(0.67); z-index: 5; transition-delay: 200ms; }
        .features-grid:not(.deck-open) .deck-card:nth-child(3) { transform: translateY(80px) translateX(10px) rotateX(46deg) rotateZ(0deg) scale(0.69); z-index: 4; transition-delay: 150ms; }
        .features-grid:not(.deck-open) .deck-card:nth-child(4) { transform: translateY(90px) translateX(-10px) rotateX(44deg) rotateZ(4deg) scale(0.71); z-index: 3; transition-delay: 100ms; }
        .features-grid:not(.deck-open) .deck-card:nth-child(5) { transform: translateY(100px) translateX(-30px) rotateX(42deg) rotateZ(8deg) scale(0.73); z-index: 2; transition-delay: 50ms; }
        .features-grid:not(.deck-open) .deck-card:nth-child(6) { transform: translateY(110px) translateX(-50px) rotateX(40deg) rotateZ(12deg) scale(0.75); z-index: 1; transition-delay: 0ms; }

        /* Deck open - cards animate to final position */
        .features-grid.deck-open .deck-card {
          opacity: 1;
          transform: translateY(0) translateX(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);
          filter: blur(0);
          pointer-events: auto;
          transition: 
            opacity 0.4s ease,
            transform 1s cubic-bezier(0.34, 1.56, 0.64, 1),
            filter 0.5s ease;
        }

        .features-grid.deck-open .deck-card:nth-child(1) { transition-delay: 0ms; }
        .features-grid.deck-open .deck-card:nth-child(2) { transition-delay: 80ms; }
        .features-grid.deck-open .deck-card:nth-child(3) { transition-delay: 160ms; }
        .features-grid.deck-open .deck-card:nth-child(4) { transition-delay: 240ms; }
        .features-grid.deck-open .deck-card:nth-child(5) { transition-delay: 320ms; }
        .features-grid.deck-open .deck-card:nth-child(6) { transition-delay: 400ms; }

        /* Shimmer effect after cards land */
        .features-grid.deck-open .deck-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 80%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 40%,
            rgba(0, 245, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.05) 60%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 10;
          border-radius: 24px;
          animation: cardShimmer 0.8s ease-out forwards;
        }

        .features-grid.deck-open .deck-card:nth-child(1)::after { animation-delay: 0.8s; }
        .features-grid.deck-open .deck-card:nth-child(2)::after { animation-delay: 0.88s; }
        .features-grid.deck-open .deck-card:nth-child(3)::after { animation-delay: 0.96s; }
        .features-grid.deck-open .deck-card:nth-child(4)::after { animation-delay: 1.04s; }
        .features-grid.deck-open .deck-card:nth-child(5)::after { animation-delay: 1.12s; }
        .features-grid.deck-open .deck-card:nth-child(6)::after { animation-delay: 1.2s; }

        @keyframes cardShimmer {
          0% { left: -150%; opacity: 0; }
          10% { opacity: 1; }
          100% { left: 150%; opacity: 0; }
        }

        /* Icon glow burst effect */
        .features-grid.deck-open .feature-icon-3d {
          animation: iconGlowBurst 0.6s ease-out forwards;
        }

        .features-grid.deck-open .deck-card:nth-child(1) .feature-icon-3d { animation-delay: 0.7s; }
        .features-grid.deck-open .deck-card:nth-child(2) .feature-icon-3d { animation-delay: 0.78s; }
        .features-grid.deck-open .deck-card:nth-child(3) .feature-icon-3d { animation-delay: 0.86s; }
        .features-grid.deck-open .deck-card:nth-child(4) .feature-icon-3d { animation-delay: 0.94s; }
        .features-grid.deck-open .deck-card:nth-child(5) .feature-icon-3d { animation-delay: 1.02s; }
        .features-grid.deck-open .deck-card:nth-child(6) .feature-icon-3d { animation-delay: 1.1s; }

        @keyframes iconGlowBurst {
          0% {
            box-shadow: 0 0 20px rgba(0, 245, 255, 0.2);
          }
          50% {
            box-shadow: 
              0 0 40px rgba(0, 245, 255, 0.7),
              0 0 80px rgba(255, 0, 110, 0.5),
              0 0 120px rgba(255, 195, 0, 0.3);
          }
          100% {
            box-shadow: 0 0 20px rgba(0, 245, 255, 0.2);
          }
        }

        .feature-card-3d {
          background: linear-gradient(145deg, rgba(10, 5, 32, 0.9), rgba(3, 0, 20, 0.95));
          border: 1px solid rgba(0, 245, 255, 0.15);
          border-radius: 24px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          backdrop-filter: blur(10px);
          transform-style: preserve-3d;
          opacity: 0;
          transform: translateY(80px) rotateX(15deg) scale(0.9);
          filter: blur(8px);
        }

        .feature-card-3d.revealed {
          opacity: 1;
          transform: translateY(0) rotateX(0deg) scale(1);
          filter: blur(0);
          animation: cardFloat 6s ease-in-out infinite;
        }

        .feature-card-3d:nth-child(1) { transition-delay: 0ms; }
        .feature-card-3d:nth-child(2) { transition-delay: 100ms; }
        .feature-card-3d:nth-child(3) { transition-delay: 200ms; }
        .feature-card-3d:nth-child(4) { transition-delay: 300ms; }
        .feature-card-3d:nth-child(5) { transition-delay: 400ms; }
        .feature-card-3d:nth-child(6) { transition-delay: 500ms; }

        .feature-card-3d.revealed:nth-child(2) { animation-delay: -1s; }
        .feature-card-3d.revealed:nth-child(3) { animation-delay: -2s; }
        .feature-card-3d.revealed:nth-child(4) { animation-delay: -3s; }
        .feature-card-3d.revealed:nth-child(5) { animation-delay: -4s; }
        .feature-card-3d.revealed:nth-child(6) { animation-delay: -5s; }

        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-12px) rotateX(2deg); }
        }

        .feature-card-3d:hover {
          transform: translateY(-20px) scale(1.06) rotateX(-5deg);
          border-color: rgba(0, 245, 255, 0.8);
          animation: none;
          box-shadow: 
            0 40px 100px rgba(0, 0, 0, 0.6),
            0 0 80px rgba(0, 245, 255, 0.35), 
            0 0 120px rgba(255, 0, 110, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 0 30px rgba(0, 245, 255, 0.1);
        }

        .feature-card-3d::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
          transition: left 0.8s ease;
          z-index: 1;
        }

        .feature-card-3d:hover::before {
          left: 100%;
        }

        .feature-card-3d::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 26px;
          background: linear-gradient(135deg, #00f5ff, #ff006e, #ffc300, #00f5ff);
          background-size: 300% 300%;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.5s ease;
          animation: borderGlow 4s ease-in-out infinite;
        }

        @keyframes borderGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .feature-card-3d.revealed::after {
          opacity: 0.3;
        }

        .feature-card-3d:hover::after {
          opacity: 0.6;
        }

        .feature-card-3d.featured {
          background: linear-gradient(145deg, rgba(255, 0, 110, 0.15), rgba(0, 245, 255, 0.1), rgba(10, 5, 32, 0.9));
          border-color: rgba(255, 0, 110, 0.4);
          box-shadow: 0 10px 40px rgba(255, 0, 110, 0.15);
        }

        .feature-card-3d.featured:hover {
          border-color: rgba(255, 0, 110, 0.7);
          box-shadow: 
            0 30px 70px rgba(0, 0, 0, 0.4),
            0 0 60px rgba(255, 0, 110, 0.3), 
            0 0 100px rgba(0, 245, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .featured-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #ff006e, #ffc300);
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
          color: #030014;
          box-shadow: 
            0 0 20px rgba(255, 195, 0, 0.5),
            0 4px 15px rgba(255, 0, 110, 0.4);
          animation: badgePulse 2s ease-in-out infinite;
        }

        @keyframes badgePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 195, 0, 0.5), 0 4px 15px rgba(255, 0, 110, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(255, 195, 0, 0.7), 0 6px 20px rgba(255, 0, 110, 0.5); }
        }

        .feature-icon-3d {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(0, 245, 255, 0.25), rgba(255, 0, 110, 0.25));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: #00f5ff;
          box-shadow: 
            0 0 20px rgba(0, 245, 255, 0.2),
            inset 0 0 20px rgba(0, 245, 255, 0.1);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          transform: scale(0) rotate(-180deg);
        }

        .feature-card-3d.revealed .feature-icon-3d {
          transform: scale(1) rotate(0deg);
          animation: iconPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes iconPop {
          0% { transform: scale(0) rotate(-180deg); }
          60% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        .feature-icon-3d::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 18px;
          background: linear-gradient(135deg, #00f5ff, #ff006e, #ffc300);
          z-index: -1;
          opacity: 0;
          transition: opacity 0.5s ease;
          filter: blur(8px);
        }

        .feature-card-3d:hover .feature-icon-3d {
          transform: scale(1.15) rotate(-8deg);
          box-shadow: 
            0 0 40px rgba(0, 245, 255, 0.5),
            0 0 80px rgba(255, 0, 110, 0.3),
            inset 0 0 30px rgba(0, 245, 255, 0.25);
        }

        .feature-card-3d:hover .feature-icon-3d::after {
          opacity: 0.6;
        }

        .feature-card-3d h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #ffffff;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          opacity: 0;
          transform: translateY(20px);
        }

        .feature-card-3d.revealed h3 {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.2s;
        }

        .feature-card-3d:hover h3 {
          background: linear-gradient(135deg, #ffffff, #00f5ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: none;
          transform: translateX(8px);
        }

        .feature-card-3d p {
          color: #a0aec0;
          line-height: 1.7;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          opacity: 0;
          transform: translateY(20px);
        }

        .feature-card-3d.revealed p {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.3s;
        }

        .feature-card-3d:hover p {
          color: #e2e8f0;
          transform: translateX(8px);
        }

        .feature-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg, 
            transparent, 
            rgba(0, 245, 255, 0.08), 
            rgba(255, 255, 255, 0.15),
            rgba(0, 245, 255, 0.08),
            transparent
          );
          transition: left 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .feature-card-3d:hover .feature-shine {
          left: 100%;
        }

        /* How It Works */
        .how-it-works {
          padding: 100px 80px;
          position: relative;
          z-index: 10;
        }

        .steps-container {
          display: flex;
          justify-content: center;
          gap: 40px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .step-card {
          flex: 1;
          position: relative;
          text-align: center;
        }

        .step-number {
          font-size: 80px;
          font-weight: 800;
          background: linear-gradient(135deg, rgba(0, 245, 255, 0.3), rgba(255, 0, 110, 0.3));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 0;
        }

        .step-content {
          position: relative;
          z-index: 1;
          background: linear-gradient(145deg, rgba(10, 5, 32, 0.9), rgba(3, 0, 20, 0.95));
          border: 1px solid rgba(0, 245, 255, 0.2);
          border-radius: 24px;
          padding: 40px 24px;
          margin-top: 40px;
          backdrop-filter: blur(10px);
        }

        .step-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #00f5ff, #ff006e);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 10px 30px rgba(0, 245, 255, 0.3);
        }

        .step-content h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #ffffff;
        }

        .step-content p {
          color: #a0aec0;
          font-size: 15px;
          line-height: 1.6;
        }

        .step-line {
          position: absolute;
          top: 50%;
          right: -20px;
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #00f5ff, #ff006e);
          box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
        }

        .step-card:last-child .step-line {
          display: none;
        }

        /* CTA Section */
        .cta-section {
          padding: 100px 80px;
          position: relative;
          z-index: 10;
          text-align: center;
        }

        .cta-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255, 0, 110, 0.2) 0%, rgba(0, 245, 255, 0.1) 40%, transparent 70%);
          pointer-events: none;
        }

        .cta-content {
          position: relative;
          z-index: 1;
        }

        .cta-content h2 {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #ffffff;
        }

        .cta-content p {
          font-size: 18px;
          color: #a0aec0;
          margin-bottom: 32px;
        }

        /* Gallery Section */
        .gallery-section {
          padding: 80px 0;
          position: relative;
          z-index: 10;
          overflow: hidden;
        }

        .gallery-section .section-header {
          text-align: center;
          margin-bottom: 40px;
        }

        /* Footer */
        .landing-footer {
          border-top: 1px solid rgba(0, 245, 255, 0.15);
          padding: 40px 80px;
          position: relative;
          z-index: 10;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-brand .logo {
          font-size: 32px;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #00f5ff, #ff006e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .footer-brand p {
          color: #718096;
        }

        .footer-bottom {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(0, 245, 255, 0.1);
        }

        .footer-bottom p {
          color: #718096;
          font-size: 14px;
        }



        /* Testimonials Section */
        .testimonials-section {
          padding: 100px 40px;
          position: relative;
          z-index: 10;
          overflow: hidden;
        }

        .testimonials-carousel {
          position: relative;
          height: 280px;
          max-width: 600px;
          margin: 40px auto 0;
          perspective: 1000px;
        }

        .testimonial-card {
          position: absolute;
          top: 0;
          left: 50%;
          width: 100%;
          max-width: 500px;
          padding: 40px;
          background: linear-gradient(145deg, rgba(10, 5, 32, 0.95), rgba(3, 0, 20, 0.98));
          border: 1px solid rgba(0, 245, 255, 0.2);
          border-radius: 24px;
          text-align: center;
          transform: translateX(-50%) scale(0.8) rotateY(45deg);
          opacity: 0;
          transition: all 0.7s cubic-bezier(0.23, 1, 0.32, 1);
          pointer-events: none;
          backdrop-filter: blur(10px);
        }

        .testimonial-card.active {
          transform: translateX(-50%) scale(1) rotateY(0deg);
          opacity: 1;
          pointer-events: auto;
          z-index: 3;
          box-shadow: 
            0 35px 70px rgba(0, 0, 0, 0.5), 
            0 0 50px rgba(0, 245, 255, 0.15),
            0 0 80px rgba(255, 0, 110, 0.1);
          animation: testimonialGlow 3s ease-in-out infinite;
        }

        @keyframes testimonialGlow {
          0%, 100% { 
            box-shadow: 
              0 35px 70px rgba(0, 0, 0, 0.5), 
              0 0 50px rgba(0, 245, 255, 0.15),
              0 0 80px rgba(255, 0, 110, 0.1);
          }
          50% { 
            box-shadow: 
              0 35px 70px rgba(0, 0, 0, 0.5), 
              0 0 70px rgba(0, 245, 255, 0.25),
              0 0 100px rgba(255, 0, 110, 0.2);
          }
        }

        .testimonial-card.prev {
          transform: translateX(-130%) scale(0.85) rotateY(20deg);
          opacity: 0.3;
          z-index: 1;
          filter: blur(2px);
        }

        .testimonial-card.next {
          transform: translateX(30%) scale(0.85) rotateY(-20deg);
          opacity: 0.3;
          z-index: 1;
          filter: blur(2px);
        }

        .testimonial-avatar {
          font-size: 50px;
          margin-bottom: 20px;
          filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3));
        }

        .testimonial-quote {
          font-size: 18px;
          color: #e2e8f0;
          line-height: 1.7;
          margin-bottom: 20px;
          font-style: italic;
        }

        .testimonial-name {
          font-size: 16px;
          font-weight: 600;
          background: linear-gradient(135deg, #00f5ff, #ff006e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .testimonial-indicators {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 30px;
        }

        .testimonial-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .testimonial-dot.active {
          background: linear-gradient(135deg, #00f5ff, #ff006e);
          transform: scale(1.3);
          box-shadow: 0 0 15px rgba(0, 245, 255, 0.5);
        }

        .testimonial-dot:hover:not(.active) {
          background: rgba(255, 255, 255, 0.4);
        }

        /* ============ NEW PREMIUM ANIMATIONS ============ */

        /* Loading Screen */
        .loading-screen {
          position: fixed;
          inset: 0;
          z-index: 100000;
          background: linear-gradient(135deg, #000004 0%, #02010a 50%, #04020e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.8s ease, visibility 0.8s ease;
          pointer-events: auto;
        }

        .loading-screen.hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .loading-screen.active {
          pointer-events: auto;
        }

        .loading-content {
          text-align: center;
        }

        .loading-logo {
          font-size: 64px;
          font-weight: 800;
          font-style: italic;
          display: flex;
          justify-content: center;
          gap: 4px;
          margin-bottom: 40px;
        }

        .loading-letter {
          display: inline-block;
          background: linear-gradient(135deg, #ff6b9d, #c44cff, #00f5ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: loadingLetterBounce 1.5s ease-in-out infinite;
        }

        .loading-letter:nth-child(1) { animation-delay: 0s; }
        .loading-letter:nth-child(3) { animation-delay: 0.1s; }
        .loading-letter:nth-child(4) { animation-delay: 0.2s; }
        .loading-letter:nth-child(5) { animation-delay: 0.3s; }
        .loading-letter:nth-child(6) { animation-delay: 0.4s; }

        .loading-heart {
          animation: loadingHeartPulse 1s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(255, 0, 110, 0.8));
        }

        @keyframes loadingLetterBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @keyframes loadingHeartPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        .loading-bar {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
          margin: 0 auto 20px;
        }

        .loading-progress {
          height: 100%;
          background: linear-gradient(90deg, #00f5ff, #ff006e, #ffc300);
          border-radius: 10px;
          animation: loadingBar 2s ease-in-out forwards;
        }

        @keyframes loadingBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .loading-text {
          color: #a0aec0;
          font-size: 14px;
          animation: loadingTextPulse 1.5s ease-in-out infinite;
        }

        @keyframes loadingTextPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        /* Scroll Progress Indicator */
        .scroll-progress-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: rgba(0, 0, 0, 0.3);
          z-index: 99999;
          pointer-events: none;
        }

        .scroll-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #00f5ff, #ff006e, #ffc300);
          box-shadow: 0 0 10px rgba(0, 245, 255, 0.8), 0 0 20px rgba(255, 0, 110, 0.5);
          transition: width 0.1s ease-out;
        }

        /* Floating CTA Badge */
        .floating-cta-badge {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #ff006e, #8338ec);
          border-radius: 50px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          box-shadow: 0 10px 40px rgba(255, 0, 110, 0.5), 0 0 60px rgba(0, 245, 255, 0.2);
          transform: translateY(100px) scale(0.8);
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: floatingCTAPulse 2s ease-in-out infinite;
        }

        .floating-cta-badge.visible {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        .floating-cta-badge:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 15px 50px rgba(255, 0, 110, 0.6), 0 0 80px rgba(0, 245, 255, 0.3);
        }

        @keyframes floatingCTAPulse {
          0%, 100% { box-shadow: 0 10px 40px rgba(255, 0, 110, 0.5), 0 0 60px rgba(0, 245, 255, 0.2); }
          50% { box-shadow: 0 15px 50px rgba(255, 0, 110, 0.7), 0 0 80px rgba(0, 245, 255, 0.4); }
        }

        /* Spotlight Follow Effect */
        .spotlight-effect {
          position: fixed;
          width: 600px;
          height: 600px;
          pointer-events: none;
          z-index: 0;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
          border-radius: 50%;
          transition: left 0.3s ease-out, top 0.3s ease-out;
        }

        /* Background Click Ripples */
        .bg-click-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 5;
        }

        .bg-click-ripple {
          position: absolute;
          transform: translate(-50%, -50%);
        }

        .ripple-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid;
          animation: rippleRingExpand 1.5s ease-out forwards;
        }

        .ring-1 {
          border-color: rgba(0, 245, 255, 0.6);
          animation-delay: 0s;
        }

        .ring-2 {
          border-color: rgba(255, 0, 110, 0.5);
          animation-delay: 0.15s;
        }

        .ring-3 {
          border-color: rgba(255, 195, 0, 0.4);
          animation-delay: 0.3s;
        }

        @keyframes rippleRingExpand {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }

        .ripple-emoji {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 30px;
          animation: rippleEmojiPop 0.8s ease-out forwards;
        }

        @keyframes rippleEmojiPop {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.5);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -100%) scale(1);
          }
        }

        /* Elastic Button Press */
        .elastic-btn {
          transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }

        .elastic-btn.pressed {
          transform: scale(0.92) !important;
        }

        .elastic-btn:active {
          transform: scale(0.95) !important;
        }

        /* Global fix for fixed overlays - ensure scroll passthrough */
        .spotlight-effect,
        .bg-click-container,
        .neon-trail-container,
        .floating-particles-container,
        .gradient-mesh,
        .liquid-blob-container,
        .noise-canvas-overlay,
        .confetti-container,
        .scroll-indicator,
        .cursor-glow-trail,
        .noise-overlay,
        .aurora-container,
        .particle-burst-container,
        .floating-elements,
        .ambient-blobs {
          pointer-events: none !important;
          touch-action: none !important;
        }

        /* ============ MEGA PACK ANIMATIONS ============ */

        /* Neon Glow Trail */
        .neon-trail-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9998;
        }

        .neon-trail-dot {
          position: absolute;
          width: 12px;
          height: 12px;
          background: radial-gradient(circle, rgba(0, 245, 255, 0.8) 0%, rgba(255, 0, 110, 0.4) 50%, transparent 70%);
          border-radius: 50%;
          filter: blur(2px);
          transform: translate(-50%, -50%);
        }

        /* Floating Particles */
        .floating-particles-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .floating-particle {
          position: absolute;
          background: radial-gradient(circle, rgba(0, 245, 255, 0.8) 0%, transparent 70%);
          border-radius: 50%;
          animation: floatParticle 20s ease-in-out infinite;
        }

        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-30vh) translateX(10vw);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-60vh) translateX(-5vw);
            opacity: 0.5;
          }
          75% {
            transform: translateY(-90vh) translateX(15vw);
            opacity: 0.2;
          }
        }

        /* Gradient Mesh */
        .gradient-mesh {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.8;
        }

        /* Liquid Blobs */
        .liquid-blob-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .liquid-blob {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(80px);
          animation: blobMorph 20s ease-in-out infinite;
          transition: left 0.5s ease-out, top 0.5s ease-out;
        }

        .blob-1 {
          background: rgba(0, 245, 255, 0.15);
          animation-delay: 0s;
        }

        .blob-2 {
          background: rgba(255, 0, 110, 0.12);
          animation-delay: -7s;
        }

        .blob-3 {
          background: rgba(139, 92, 246, 0.1);
          animation-delay: -14s;
        }

        @keyframes blobMorph {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: scale(1);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: scale(1.1);
          }
          50% {
            border-radius: 50% 60% 30% 60% / 40% 70% 50% 40%;
            transform: scale(0.95);
          }
          75% {
            border-radius: 70% 30% 50% 40% / 30% 40% 70% 60%;
            transform: scale(1.05);
          }
        }

        /* Noise Canvas Overlay */
        .noise-canvas-overlay {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9997;
          opacity: 0.03;
          mix-blend-mode: overlay;
        }

        /* Confetti */
        .confetti-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 99999;
          overflow: hidden;
        }

        .confetti-piece {
          position: absolute;
          border-radius: 2px;
          animation: confettiFall 3s ease-out forwards;
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(var(--vx, 0)) rotate(720deg);
            opacity: 0;
          }
        }

        /* Bounce Scroll Indicator */
        .scroll-indicator {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 100;
          transition: opacity 0.5s ease, transform 0.5s ease;
          pointer-events: none;
        }

        .scroll-indicator.hidden {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
          pointer-events: none;
        }

        .scroll-indicator.visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .scroll-mouse {
          width: 26px;
          height: 42px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 20px;
          position: relative;
        }

        .scroll-wheel {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 8px;
          background: linear-gradient(to bottom, #00f5ff, #ff006e);
          border-radius: 4px;
          animation: scrollWheel 1.5s ease-in-out infinite;
        }

        @keyframes scrollWheel {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateX(-50%) translateY(12px);
            opacity: 0.3;
          }
        }

        .scroll-text {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .scroll-arrows {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .scroll-arrow {
          width: 12px;
          height: 12px;
          border-right: 2px solid rgba(0, 245, 255, 0.6);
          border-bottom: 2px solid rgba(0, 245, 255, 0.6);
          transform: rotate(45deg);
          animation: scrollArrowBounce 1s ease-in-out infinite;
        }

        .scroll-arrow:nth-child(2) {
          animation-delay: 0.2s;
          border-color: rgba(255, 0, 110, 0.6);
        }

        @keyframes scrollArrowBounce {
          0%, 100% {
            transform: rotate(45deg) translateY(0);
            opacity: 0.5;
          }
          50% {
            transform: rotate(45deg) translateY(5px);
            opacity: 1;
          }
        }

        /* Wave Dividers */
        .wave-divider {
          position: relative;
          width: 100%;
          height: 100px;
          overflow: hidden;
          margin: -1px 0;
        }

        .wave-divider svg {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .wave-divider.wave-flip svg {
          transform: rotate(180deg);
        }

        .wave-path {
          fill: transparent;
          animation: waveFlow 8s ease-in-out infinite;
        }

        .wave-1 {
          fill: rgba(0, 245, 255, 0.1);
          animation-delay: 0s;
        }

        .wave-2 {
          fill: rgba(255, 0, 110, 0.08);
          animation-delay: -4s;
        }

        @keyframes waveFlow {
          0%, 100% {
            d: path("M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z");
          }
          50% {
            d: path("M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z");
          }
        }

        /* Progress Circles */
        .progress-circles-container {
          display: flex;
          justify-content: center;
          gap: 60px;
          margin-top: 50px;
          padding: 40px 20px;
          flex-wrap: wrap;
        }

        .progress-circle-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .progress-circle-item.single {
          transform: scale(1.2);
        }

        .progress-circle-item.single .progress-circle {
          width: 140px;
          height: 140px;
          filter: drop-shadow(0 0 30px rgba(0, 245, 255, 0.4));
        }

        .progress-circle-item.single .progress-value {
          font-size: 32px;
        }

        .progress-circle-item.single .progress-label {
          font-size: 14px;
          margin-top: 12px;
        }

        .progress-circle {
          width: 120px;
          height: 120px;
          transform: rotate(-90deg);
        }

        .progress-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 8;
        }

        .progress-fill {
          fill: none;
          stroke: url(#progressGradient1);
          stroke-width: 8;
          stroke-linecap: round;
          stroke-dasharray: 283;
          transition: stroke-dashoffset 0.5s ease-out;
          filter: drop-shadow(0 0 10px rgba(0, 245, 255, 0.5));
        }

        .progress-fill {
          stroke: #00f5ff;
        }

        .progress-fill.fill-2 {
          stroke: #ff006e;
          filter: drop-shadow(0 0 10px rgba(255, 0, 110, 0.5));
        }

        .progress-fill.fill-3 {
          stroke: #ffc300;
          filter: drop-shadow(0 0 10px rgba(255, 195, 0, 0.5));
        }

        .progress-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #00f5ff, #ff006e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .progress-label {
          margin-top: 15px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
        }

        /* Animated Tooltips */
        .tooltip-container {
          position: relative;
        }

        .tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          padding: 8px 16px;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 40, 0.95));
          border: 1px solid rgba(0, 245, 255, 0.3);
          border-radius: 8px;
          color: white;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: rgba(0, 245, 255, 0.3);
        }

        .tooltip-container:hover .tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(-8px);
        }

        /* Text Highlight on Scroll */
        .highlight-text {
          background: linear-gradient(90deg, transparent 50%, rgba(0, 245, 255, 0.2) 50%);
          background-size: 200% 100%;
          background-position: 100% 0;
          transition: background-position 0.5s ease;
        }

        .highlight-text.active {
          background-position: 0 0;
        }

        /* Elastic Overscroll - applied via main .landing-page block */

        /* Horizontal Gallery */
        .horizontal-gallery {
          width: 100%;
          overflow-x: hidden;
          padding: 60px 0;
        }

        .gallery-track {
          display: flex;
          gap: 20px;
          animation: galleryScroll 30s linear infinite;
          width: max-content;
        }

        .gallery-item {
          width: 280px;
          height: 180px;
          background: linear-gradient(135deg, rgba(0, 245, 255, 0.1), rgba(255, 0, 110, 0.1));
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          flex-shrink: 0;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .gallery-item:hover {
          transform: scale(1.05);
          box-shadow: 0 20px 60px rgba(0, 245, 255, 0.2);
        }

        @keyframes galleryScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* Parallax Inner Elements */
        .parallax-inner {
          transition: transform 0.1s ease-out;
        }

        /* Reveal Mask */
        .reveal-mask {
          clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
          animation: revealMask 1.5s ease forwards;
        }

        @keyframes revealMask {
          to {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
        }

        /* ============ END NEW PREMIUM ANIMATIONS ============ */

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-3d {
            flex-direction: column;
            padding: 100px 40px;
            text-align: center;
          }

          .hero-content {
            max-width: 100%;
          }

          /* Logo responsive - tablet */
          .viebo-logo-container {
            align-items: center;
          }

          .i-heart-dot {
            width: 18px;
            height: 18px;
            top: -0.56em;
            left: 63%;
          }

          .viebo-text {
            font-size: 60px;
          }

          .hero-title-3d {
            font-size: 48px;
          }

          .title-highlight {
            justify-content: center;
          }

          .hero-buttons {
            justify-content: center;
          }

          .hero-visual {
            margin-top: 60px;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          /* Adjust deck positions for tablet */
          .features-grid:not(.deck-open) .deck-card:nth-child(1) { transform: translateY(50px) translateX(40px) rotateX(45deg) rotateZ(-6deg) scale(0.7); }
          .features-grid:not(.deck-open) .deck-card:nth-child(2) { transform: translateY(60px) translateX(20px) rotateX(43deg) rotateZ(-3deg) scale(0.72); }
          .features-grid:not(.deck-open) .deck-card:nth-child(3) { transform: translateY(70px) translateX(0px) rotateX(41deg) rotateZ(0deg) scale(0.74); }
          .features-grid:not(.deck-open) .deck-card:nth-child(4) { transform: translateY(80px) translateX(-20px) rotateX(39deg) rotateZ(3deg) scale(0.76); }
          .features-grid:not(.deck-open) .deck-card:nth-child(5) { transform: translateY(90px) translateX(-40px) rotateX(37deg) rotateZ(6deg) scale(0.78); }
          .features-grid:not(.deck-open) .deck-card:nth-child(6) { transform: translateY(100px) translateX(-60px) rotateX(35deg) rotateZ(9deg) scale(0.8); }

          .steps-container {
            flex-direction: column;
            gap: 20px;
          }

          .step-line {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .hero-3d {
            padding: 80px 20px;
          }

          /* Logo responsive - mobile */
          .viebo-logo-container {
            margin-bottom: 20px;
          }

          .i-heart-dot {
            width: 14px;
            height: 14px;
            top: -0.52em;
            left: 63%;
          }

          .viebo-text {
            font-size: 48px;
            letter-spacing: 1px;
          }

          .hero-title-3d {
            font-size: 36px;
          }

          .features-section,
          .how-it-works,
          .cta-section {
            padding: 60px 20px;
          }

          .features-grid {
            grid-template-columns: 1fr;
            perspective: 1200px;
          }

          /* Simpler vertical stack for mobile */
          .features-grid:not(.deck-open) .deck-card:nth-child(1) { transform: translateY(30px) rotateX(35deg) scale(0.8); }
          .features-grid:not(.deck-open) .deck-card:nth-child(2) { transform: translateY(45px) rotateX(33deg) scale(0.82); }
          .features-grid:not(.deck-open) .deck-card:nth-child(3) { transform: translateY(60px) rotateX(31deg) scale(0.84); }
          .features-grid:not(.deck-open) .deck-card:nth-child(4) { transform: translateY(75px) rotateX(29deg) scale(0.86); }
          .features-grid:not(.deck-open) .deck-card:nth-child(5) { transform: translateY(90px) rotateX(27deg) scale(0.88); }
          .features-grid:not(.deck-open) .deck-card:nth-child(6) { transform: translateY(105px) rotateX(25deg) scale(0.9); }

          .section-title {
            font-size: 36px;
          }

          .cta-content h2 {
            font-size: 32px;
          }

          .landing-footer {
            padding: 40px 20px;
          }

          /* Stats responsive */
          .stats-grid {
            flex-direction: column;
            gap: 20px;
            align-items: center;
          }

          .stat-card {
            width: 100%;
            max-width: 300px;
          }

          .stat-number {
            font-size: 36px;
          }

          /* Testimonials responsive */
          .testimonials-section {
            padding: 60px 20px;
          }

          .testimonials-carousel {
            height: 320px;
          }

          .testimonial-card {
            padding: 30px 20px;
          }

          .testimonial-card.prev,
          .testimonial-card.next {
            opacity: 0;
          }

          .testimonial-quote {
            font-size: 16px;
          }

          /* Disable cursor glow on mobile */
          .cursor-glow-trail {
            display: none;
          }

          /* Simplify aurora on mobile */
          .aurora-container {
            opacity: 0.5;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .deck-card {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            pointer-events: auto !important;
            transition: none !important;
          }
          
          .features-grid.deck-open .deck-card {
            transition: none !important;
          }
          
          .features-grid.deck-open .deck-card::after,
          .features-grid::before {
            display: none !important;
            animation: none !important;
          }
          
          .feature-card-3d,
          .feature-card-3d:hover {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
    </>
  );
};

export default Landing;

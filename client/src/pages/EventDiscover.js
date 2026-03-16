import { API_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, Filter, Calendar, MapPin, Users, Clock, 
  Sparkles, PartyPopper, Trophy, Music, UtensilsCrossed,
  Mountain, Gamepad2, Palette, Briefcase, Heart, ChevronRight, X, Star
} from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

const CATEGORY_ICONS = {
  social: Users,
  party: PartyPopper,
  sports: Trophy,
  music: Music,
  food: UtensilsCrossed,
  outdoor: Mountain,
  gaming: Gamepad2,
  creative: Palette,
  networking: Briefcase,
  wellness: Heart
};

const CATEGORY_COLORS = {
  social: '#ec4899',
  party: '#8b5cf6',
  sports: '#10b981',
  music: '#f59e0b',
  food: '#ef4444',
  outdoor: '#22c55e',
  gaming: '#6366f1',
  creative: '#f472b6',
  networking: '#0ea5e9',
  wellness: '#14b8a6'
};

const EventDiscover = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVibe, setSelectedVibe] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState({});
  const [vibes, setVibes] = useState({});

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => reject(new Error('Location permission is required to join this event.')),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    });
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedVibe, searchQuery]);

  const fetchData = async () => {
    try {
      const [eventsRes, categoriesRes, vibesRes, recommendedRes] = await Promise.all([
        axios.get(`${API_URL}/event-features/discover`, {
          params: {
            category: selectedCategory,
            vibe: selectedVibe,
            search: searchQuery,
            upcoming: 'true'
          }
        }),
        axios.get(`${API_URL}/event-features/categories`),
        axios.get(`${API_URL}/event-features/vibes`),
        axios.get(`${API_URL}/event-features/recommended`)
      ]);
      
      setEvents(eventsRes.data);
      setCategories(categoriesRes.data);
      setVibes(vibesRes.data);
      setRecommendedEvents(recommendedRes.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventCode) => {
    try {
      const position = await getCurrentPosition();
      const res = await axios.post(`${API_URL}/events/join`, {
        code: eventCode,
        userLatitude: position.latitude,
        userLongitude: position.longitude
      });
      navigate(`/event/${res.data.id}`);
    } catch (err) {
      if (err.response?.data?.isFull) {
        alert('This event is full! You can join the waitlist.');
      } else {
        alert(err.response?.data?.message || err.message || 'Failed to join event');
      }
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryIcon = (category) => {
    const Icon = CATEGORY_ICONS[category] || Users;
    return <Icon size={16} />;
  };

  if (loading) {
    return (
      <ParticleBackground>
        <div className="loading-container" style={{ minHeight: '60vh' }}>
          <div className="spinner"></div>
        </div>
      </ParticleBackground>
    );
  }

  return (
    <ParticleBackground>
      <div className="discover-container">
        {/* Header */}
        <div className="discover-header">
          <h1>
            <Sparkles size={32} />
            Discover Events
          </h1>
          <p>Find events that match your vibe</p>
        </div>

        {/* Search & Filters */}
        <div className="search-section">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel animate-fadeIn">
            <div className="filter-section">
              <h4>Category</h4>
              <div className="filter-chips">
                <button
                  className={`chip ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </button>
                {Object.entries(categories).map(([key, cat]) => (
                  <button
                    key={key}
                    className={`chip ${selectedCategory === key ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(key)}
                    style={selectedCategory === key ? { 
                      background: CATEGORY_COLORS[key],
                      borderColor: CATEGORY_COLORS[key]
                    } : {}}
                  >
                    {getCategoryIcon(key)}
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Vibe</h4>
              <div className="filter-chips">
                <button
                  className={`chip ${selectedVibe === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedVibe('all')}
                >
                  All Vibes
                </button>
                {Object.entries(vibes).map(([key, vibe]) => (
                  <button
                    key={key}
                    className={`chip ${selectedVibe === key ? 'active' : ''}`}
                    onClick={() => setSelectedVibe(key)}
                  >
                    {vibe.emoji} {vibe.name}
                  </button>
                ))}
              </div>
            </div>

            <button className="clear-filters" onClick={() => {
              setSelectedCategory('all');
              setSelectedVibe('all');
              setSearchQuery('');
            }}>
              <X size={16} />
              Clear Filters
            </button>
          </div>
        )}

        {/* Recommended Section */}
        {recommendedEvents.length > 0 && !searchQuery && selectedCategory === 'all' && (
          <div className="recommended-section">
            <div className="section-header">
              <Star size={24} />
              <h2>Recommended for You</h2>
            </div>
            <div className="recommended-scroll">
              {recommendedEvents.slice(0, 5).map(event => (
                <div key={event.id} className="recommended-card">
                  {event.cover_image ? (
                    <img src={event.cover_image} alt={event.name} className="event-cover" />
                  ) : (
                    <div 
                      className="event-cover-placeholder"
                      style={{ background: CATEGORY_COLORS[event.category] || '#ec4899' }}
                    >
                      {getCategoryIcon(event.category)}
                    </div>
                  )}
                  <div className="card-content">
                    <span 
                      className="category-badge"
                      style={{ background: CATEGORY_COLORS[event.category] }}
                    >
                      {categories[event.category]?.name || event.category}
                    </span>
                    <h3>{event.name}</h3>
                    <p className="event-date">
                      <Calendar size={14} />
                      {formatDate(event.date)}
                    </p>
                    <div className="attendee-count">
                      <Users size={14} />
                      {event.attendeeCount} attending
                    </div>
                  </div>
                  <button 
                    className="join-btn-small"
                    onClick={() => joinEvent(event.code)}
                    disabled={event.isFull}
                  >
                    {event.isFull ? 'Full' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="events-section">
          <div className="section-header">
            <Calendar size={24} />
            <h2>
              {selectedCategory !== 'all' 
                ? `${categories[selectedCategory]?.name} Events` 
                : 'All Events'}
            </h2>
            <span className="event-count">{events.length} events</span>
          </div>

          {events.length === 0 ? (
            <div className="empty-state">
              <Search size={48} />
              <h3>No events found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map(event => (
                <div key={event.id} className="event-card animate-fadeIn">
                  {event.cover_image ? (
                    <img src={event.cover_image} alt={event.name} className="event-image" />
                  ) : (
                    <div 
                      className="event-image-placeholder"
                      style={{ background: `linear-gradient(135deg, ${CATEGORY_COLORS[event.category] || '#ec4899'}, #0f172a)` }}
                    >
                      {getCategoryIcon(event.category)}
                    </div>
                  )}
                  
                  <div className="event-content">
                    <div className="event-meta">
                      <span 
                        className="category-tag"
                        style={{ color: CATEGORY_COLORS[event.category] }}
                      >
                        {getCategoryIcon(event.category)}
                        {categories[event.category]?.name}
                      </span>
                      {event.vibe && vibes[event.vibe] && (
                        <span className="vibe-tag">
                          {vibes[event.vibe].emoji}
                        </span>
                      )}
                    </div>

                    <h3>{event.name}</h3>
                    
                    {event.description && (
                      <p className="event-description">
                        {event.description.length > 100 
                          ? event.description.slice(0, 100) + '...' 
                          : event.description}
                      </p>
                    )}

                    <div className="event-details">
                      <div className="detail">
                        <Calendar size={16} />
                        {formatDate(event.date)}
                      </div>
                      <div className="detail">
                        <Clock size={16} />
                        {formatTime(event.date)}
                      </div>
                      {event.location && (
                        <div className="detail">
                          <MapPin size={16} />
                          {event.location}
                        </div>
                      )}
                    </div>

                    <div className="event-footer">
                      <div className="attendees">
                        <Users size={16} />
                        <span>
                          {event.attendeeCount} attending
                          {event.max_attendees && ` / ${event.max_attendees} max`}
                        </span>
                      </div>
                      
                      {event.spotsLeft !== null && event.spotsLeft <= 5 && !event.isFull && (
                        <span className="spots-left">
                          Only {event.spotsLeft} spots left!
                        </span>
                      )}
                    </div>
                  </div>

                  <button 
                    className={`join-btn ${event.isFull ? 'full' : ''}`}
                    onClick={() => joinEvent(event.code)}
                    disabled={event.isFull}
                  >
                    {event.isFull ? 'Event Full' : 'Join Event'}
                    <ChevronRight size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .discover-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
          }

          .discover-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .discover-header h1 {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-size: 32px;
            margin-bottom: 8px;
          }

          .discover-header p {
            color: #94a3b8;
            font-size: 18px;
          }

          .search-section {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
          }

          .search-bar {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            padding: 12px 20px;
            color: #94a3b8;
          }

          .search-bar input {
            flex: 1;
            background: none;
            border: none;
            color: #f8fafc;
            font-size: 16px;
            outline: none;
          }

          .search-bar input::placeholder {
            color: #64748b;
          }

          .filter-btn {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            padding: 12px 20px;
            color: #94a3b8;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .filter-btn:hover, .filter-btn.active {
            border-color: #ec4899;
            color: #ec4899;
          }

          .filter-panel {
            background: rgba(30, 41, 59, 0.8);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
          }

          .filter-section {
            margin-bottom: 20px;
          }

          .filter-section h4 {
            color: #f8fafc;
            margin-bottom: 12px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .filter-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .chip {
            background: rgba(100, 116, 139, 0.2);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 20px;
            padding: 8px 16px;
            color: #94a3b8;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .chip:hover {
            border-color: #ec4899;
            color: #f8fafc;
          }

          .chip.active {
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            border-color: transparent;
            color: white;
          }

          .clear-filters {
            background: none;
            border: none;
            color: #64748b;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            font-size: 14px;
          }

          .clear-filters:hover {
            color: #ef4444;
          }

          .recommended-section {
            margin-bottom: 40px;
          }

          .section-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
          }

          .section-header h2 {
            margin: 0;
            flex: 1;
          }

          .event-count {
            background: rgba(100, 116, 139, 0.3);
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 14px;
            color: #94a3b8;
          }

          .recommended-scroll {
            display: flex;
            gap: 16px;
            overflow-x: auto;
            padding-bottom: 12px;
            scrollbar-width: thin;
          }

          .recommended-card {
            flex-shrink: 0;
            width: 280px;
            background: rgba(30, 41, 59, 0.8);
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.2s ease;
          }

          .recommended-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }

          .event-cover, .event-cover-placeholder {
            width: 100%;
            height: 120px;
            object-fit: cover;
          }

          .event-cover-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            opacity: 0.7;
          }

          .card-content {
            padding: 16px;
          }

          .category-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 10px;
            font-size: 11px;
            text-transform: uppercase;
            color: white;
            margin-bottom: 8px;
          }

          .card-content h3 {
            font-size: 16px;
            margin: 0 0 8px 0;
            color: #f8fafc;
          }

          .event-date, .attendee-count {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #94a3b8;
            font-size: 13px;
            margin-bottom: 4px;
          }

          .join-btn-small {
            width: calc(100% - 32px);
            margin: 0 16px 16px;
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            border: none;
            border-radius: 8px;
            padding: 10px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .join-btn-small:hover:not(:disabled) {
            transform: scale(1.02);
          }

          .join-btn-small:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .events-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 24px;
          }

          .event-card {
            background: rgba(30, 41, 59, 0.8);
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.2s ease;
          }

          .event-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }

          .event-image, .event-image-placeholder {
            width: 100%;
            height: 160px;
            object-fit: cover;
          }

          .event-image-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            opacity: 0.7;
          }

          .event-content {
            padding: 20px;
          }

          .event-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          }

          .category-tag {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 500;
          }

          .vibe-tag {
            font-size: 18px;
          }

          .event-content h3 {
            font-size: 20px;
            margin: 0 0 8px 0;
          }

          .event-description {
            color: #94a3b8;
            font-size: 14px;
            margin-bottom: 16px;
            line-height: 1.5;
          }

          .event-details {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 16px;
          }

          .detail {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #94a3b8;
            font-size: 14px;
          }

          .event-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .attendees {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #64748b;
            font-size: 14px;
          }

          .spots-left {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            padding: 4px 10px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 500;
          }

          .join-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: calc(100% - 40px);
            margin: 0 20px 20px;
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            border: none;
            border-radius: 12px;
            padding: 14px;
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .join-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(236, 72, 153, 0.4);
          }

          .join-btn.full {
            background: rgba(100, 116, 139, 0.3);
          }

          .join-btn:disabled {
            cursor: not-allowed;
          }

          .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #64748b;
          }

          .empty-state h3 {
            color: #f8fafc;
            margin: 16px 0 8px;
          }

          @media (max-width: 768px) {
            .events-grid {
              grid-template-columns: 1fr;
            }

            .search-section {
              flex-direction: column;
            }

            .recommended-card {
              width: 250px;
            }
          }
        `}</style>
      </div>
    </ParticleBackground>
  );
};

export default EventDiscover;

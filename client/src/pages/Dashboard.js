import { API_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, MapPin, Users, Plus, UserPlus, ChevronRight, Compass } from 'lucide-react';
import { useAuth } from '../App';
import ParticleBackground from '../components/ParticleBackground';

const Dashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/events/my-events`);
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (activeTab === 'all') return true;
    return event.status === activeTab;
  });

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'badge-upcoming',
      active: 'badge-active',
      closed: 'badge-closed'
    };
    return badges[status] || 'badge-upcoming';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <ParticleBackground>
      <div className="container" style={{ padding: '40px 20px' }}>
        {/* Welcome Section */}
        <div className="animate-fadeIn" style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
            Hey, {user?.name}! 👋
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Ready to find your match at an event?
          </p>
        </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <Link to="/create-event" className="card animate-fadeIn" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Plus size={28} color="white" />
            </div>
            <div>
              <h3 style={{ marginBottom: '4px' }}>Create Event</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                Host a party, festival, or gathering
              </p>
            </div>
            <ChevronRight size={24} color="#64748b" style={{ marginLeft: 'auto' }} />
          </div>
        </Link>

        <Link to="/join-event" className="card animate-fadeIn" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={28} color="white" />
            </div>
            <div>
              <h3 style={{ marginBottom: '4px' }}>Join Event</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                Enter a code to join an event
              </p>
            </div>
            <ChevronRight size={24} color="#64748b" style={{ marginLeft: 'auto' }} />
          </div>
        </Link>

        <Link to="/discover" className="card animate-fadeIn" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, #ffc300 0%, #ff006e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Compass size={28} color="white" />
            </div>
            <div>
              <h3 style={{ marginBottom: '4px' }}>Discover Events</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                Find public events near you
              </p>
            </div>
            <ChevronRight size={24} color="#64748b" style={{ marginLeft: 'auto' }} />
          </div>
        </Link>
      </div>

      {/* My Events */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px' }}>My Events</h2>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button 
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`tab ${activeTab === 'closed' ? 'active' : ''}`}
            onClick={() => setActiveTab('closed')}
          >
            Closed
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h3 className="empty-state-title">No events yet</h3>
            <p>Create or join an event to get started!</p>
          </div>
        ) : (
          <div className="grid-2">
            {filteredEvents.map(event => (
              <Link 
                key={event.id} 
                to={`/event/${event.id}`}
                className="card event-card animate-fadeIn"
                style={{ textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>{event.name}</h3>
                    <span className={`badge ${getStatusBadge(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <span style={{ 
                    fontFamily: 'monospace', 
                    background: 'rgba(236, 72, 153, 0.1)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    color: '#ec4899',
                    fontSize: '14px'
                  }}>
                    {event.code}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#94a3b8', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  {event.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} />
                    <span>{event.attendees.length} attendees</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ParticleBackground>
  );
};

export default Dashboard;

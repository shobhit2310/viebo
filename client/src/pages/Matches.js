import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, MessageCircle, Calendar, Clock } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/matches/my-matches');
      setMatches(res.data);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
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
      <div className="container" style={{ padding: '40px 20px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ marginBottom: '8px' }}>
            <Heart size={32} style={{ color: '#ec4899', marginRight: '12px', verticalAlign: 'middle' }} />
            Your Matches
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Connect with people who liked you back
          </p>
        </div>

      {matches.length === 0 ? (
        <div className="empty-state">
          <Heart size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <h3 className="empty-state-title">No matches yet</h3>
          <p style={{ marginBottom: '24px' }}>
            Join an event and send some crushes to get matched!
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {matches.map(match => (
            <div 
              key={match.id} 
              className="card animate-fadeIn"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/chat/${match.id}`)}
            >
              <div style={{ display: 'flex', gap: '16px' }}>
                <img 
                  src={match.otherUser.avatar} 
                  alt={match.otherUser.name} 
                  className="avatar avatar-large"
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '4px' }}>{match.otherUser.name}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
                    {match.otherUser.age} • {match.otherUser.gender}
                  </p>
                  
                  {match.event && (
                    <div style={{ 
                      background: 'rgba(236, 72, 153, 0.1)', 
                      padding: '8px 12px', 
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ color: '#ec4899' }}>{match.event.name}</span>
                        <span className={`badge ${match.event.status === 'closed' ? 'badge-closed' : match.event.status === 'active' ? 'badge-active' : 'badge-upcoming'}`}>
                          {match.event.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', color: '#94a3b8' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {formatDate(match.event.date)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {match.event.startTime}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  className="btn btn-primary"
                  style={{ alignSelf: 'center' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/chat/${match.id}`);
                  }}
                >
                  <MessageCircle size={18} />
                  Chat
                </button>
              </div>

              {match.otherUser.bio && (
                <p style={{ 
                  color: '#cbd5e1', 
                  fontSize: '14px', 
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(100, 116, 139, 0.2)'
                }}>
                  "{match.otherUser.bio}"
                </p>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
    </ParticleBackground>
  );
};

export default Matches;

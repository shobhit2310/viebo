import { API_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, MapPin, Users, Heart, Copy, Check, ArrowLeft, MessageCircle, Camera, MessagesSquare } from 'lucide-react';
import { useAuth, useSocket } from '../App';
import ParticleBackground from '../components/ParticleBackground';
import MatchCelebration from '../components/MatchCelebration';
import EventGroupChat from '../components/EventGroupChat';
import EventPhotoGallery from '../components/EventPhotoGallery';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [crushes, setCrushes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [copied, setCopied] = useState(false);
  const [matchCelebration, setMatchCelebration] = useState(null);
  const [sendingCrush, setSendingCrush] = useState(null);
  const [activeTab, setActiveTab] = useState('people');
  const [showGroupChat, setShowGroupChat] = useState(false);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.on('new-match', (data) => {
        if (data.eventId === id && data.users.includes(user.id)) {
          // Show match celebration
          const otherUserId = data.users.find(uid => uid !== user.id);
          const otherUser = event?.attendeeDetails?.find(u => u.id === otherUserId);
          if (otherUser) {
            setMatchCelebration({
              ...otherUser,
              matchId: data.matchId,
              userAvatar: user.avatar
            });
          }
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new-match');
      }
    };
  }, [socket, id, user, event]);

  const fetchEventData = async () => {
    try {
      const [eventRes, crushesRes, matchesRes] = await Promise.all([
        axios.get(`${API_URL}/events/${id}`),
        axios.get(`${API_URL}/matches/crushes/${id}`),
        axios.get(`${API_URL}/matches/event/${id}`)
      ]);
      setEvent(eventRes.data);
      setCrushes(crushesRes.data);
      setMatches(matchesRes.data);
    } catch (err) {
      console.error('Failed to fetch event:', err);
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendCrush = async (targetUserId) => {
    setSendingCrush(targetUserId);
    try {
      const res = await axios.post(`${API_URL}/matches/crush`, {
        eventId: id,
        targetUserId
      });
      
      if (res.data.isMatch) {
        const otherUser = event.attendeeDetails.find(u => u.id === targetUserId);
        setMatchCelebration({
          ...otherUser,
          matchId: res.data.matchId,
          userAvatar: user.avatar
        });
      } else {
        setCrushes([...crushes, targetUserId]);
      }
    } catch (err) {
      console.error('Failed to send crush:', err);
    } finally {
      setSendingCrush(null);
    }
  };

  const handleCloseCelebration = () => {
    setMatchCelebration(null);
    fetchEventData();
  };

  const handleStartChat = () => {
    if (matchCelebration?.matchId) {
      navigate(`/chat/${matchCelebration.matchId}`);
    }
    setMatchCelebration(null);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(event.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'badge-upcoming',
      active: 'badge-active',
      closed: 'badge-closed'
    };
    return badges[status] || 'badge-upcoming';
  };

  const isMatched = (userId) => {
    return matches.some(m => m.otherUser.id === userId);
  };

  const getMatchId = (userId) => {
    const match = matches.find(m => m.otherUser.id === userId);
    return match?.id;
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

  if (!event) {
    return (
      <ParticleBackground>
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2>Event not found</h2>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ marginTop: '20px' }}>
            Back to Dashboard
          </button>
        </div>
      </ParticleBackground>
    );
  }

  // Filter out the current user from attendees
  const otherAttendees = event.attendeeDetails?.filter(a => a.id !== user.id) || [];

  return (
    <ParticleBackground>
      <div className="container" style={{ padding: '40px 20px' }}>
      {/* Match Celebration Modal */}
      {matchCelebration && (
        <MatchCelebration 
          match={matchCelebration}
          onClose={handleCloseCelebration}
          onStartChat={handleStartChat}
        />
      )}

      {/* Back Button */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className="btn btn-secondary"
        style={{ marginBottom: '24px' }}
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Event Header */}
      <div className="card event-card animate-fadeIn" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ marginBottom: '8px' }}>{event.name}</h1>
            <span className={`badge ${getStatusBadge(event.status)}`}>
              {event.status}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Event Code</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontFamily: 'monospace', 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#ec4899'
              }}>
                {event.code}
              </span>
              <button 
                onClick={copyCode}
                className="btn btn-secondary"
                style={{ padding: '4px 8px' }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {event.description && (
          <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>{event.description}</p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', color: '#94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} />
            <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
          {event.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} />
              <span>{event.location}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} />
            <span>{event.attendees.length} attendees</span>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {event.status === 'closed' && (
        <div className="card" style={{ 
          background: 'rgba(100, 116, 139, 0.1)', 
          marginBottom: '24px',
          textAlign: 'center' 
        }}>
          <p style={{ color: '#94a3b8' }}>
            This event has ended. You can only chat with your matches from this event.
          </p>
        </div>
      )}

      {/* Your Matches at this Event */}
      {matches.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '16px' }}>
            <Heart size={24} style={{ color: '#ec4899', marginRight: '8px', verticalAlign: 'middle' }} />
            Your Matches ({matches.length})
          </h2>
          <div className="grid-4">
            {matches.map(match => (
              <div key={match.id} className="card person-card animate-fadeIn" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
                <img 
                  src={match.otherUser.avatar} 
                  alt={match.otherUser.name} 
                  className="avatar avatar-large"
                  style={{ margin: '0 auto 12px' }}
                />
                <h4 style={{ marginBottom: '4px' }}>{match.otherUser.name}</h4>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>
                  {match.otherUser.age} • {match.otherUser.gender}
                </p>
                <button 
                  onClick={() => navigate(`/chat/${match.id}`)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <MessageCircle size={18} />
                  Chat
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        background: 'rgba(30, 41, 59, 0.6)',
        padding: '8px',
        borderRadius: '16px'
      }}>
        <button
          onClick={() => setActiveTab('people')}
          style={{
            flex: 1,
            padding: '12px',
            background: activeTab === 'people' ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: activeTab === 'people' ? 600 : 400,
            transition: 'all 0.2s ease'
          }}
        >
          <Users size={18} />
          People
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          style={{
            flex: 1,
            padding: '12px',
            background: activeTab === 'photos' ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: activeTab === 'photos' ? 600 : 400,
            transition: 'all 0.2s ease'
          }}
        >
          <Camera size={18} />
          Photos
        </button>
        <button
          onClick={() => setShowGroupChat(true)}
          style={{
            flex: 1,
            padding: '12px',
            background: 'rgba(16, 185, 129, 0.2)',
            border: 'none',
            borderRadius: '12px',
            color: '#10b981',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
        >
          <MessagesSquare size={18} />
          Group Chat
        </button>
      </div>

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <EventPhotoGallery eventId={id} eventName={event.name} />
      )}

      {/* Attendees */}
      {activeTab === 'people' && (
      <div>
        <h2 style={{ marginBottom: '16px' }}>
          <Users size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          {event.status === 'closed' ? 'Attendees' : 'Find Your Crush'} ({otherAttendees.length})
        </h2>
        
        {otherAttendees.length === 0 ? (
          <div className="empty-state">
            <Users size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h3 className="empty-state-title">No other attendees yet</h3>
            <p>Share the event code to invite people!</p>
          </div>
        ) : (
          <div className="grid-4">
            {otherAttendees.map(attendee => (
              <div key={attendee.id} className="card person-card animate-fadeIn">
                <img 
                  src={attendee.avatar} 
                  alt={attendee.name} 
                  className="avatar avatar-large"
                  style={{ margin: '0 auto 12px' }}
                />
                <h4 style={{ marginBottom: '4px' }}>{attendee.name}</h4>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
                  {attendee.age} • {attendee.gender}
                </p>
                
                {attendee.bio && (
                  <p style={{ 
                    color: '#cbd5e1', 
                    fontSize: '13px', 
                    marginBottom: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {attendee.bio}
                  </p>
                )}

                {attendee.interests?.length > 0 && (
                  <div className="interests-container" style={{ marginBottom: '12px', justifyContent: 'center' }}>
                    {attendee.interests.slice(0, 3).map(interest => (
                      <span key={interest} className="interest-tag">{interest}</span>
                    ))}
                  </div>
                )}

                {isMatched(attendee.id) ? (
                  <button 
                    onClick={() => navigate(`/chat/${getMatchId(attendee.id)}`)}
                    className="btn btn-success"
                    style={{ width: '100%' }}
                  >
                    <MessageCircle size={18} />
                    Chat
                  </button>
                ) : event.status === 'closed' ? (
                  <button 
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                    disabled
                  >
                    Event Closed
                  </button>
                ) : (
                  <button 
                    onClick={() => sendCrush(attendee.id)}
                    className={`crush-btn ${crushes.includes(attendee.id) ? 'active' : ''}`}
                    style={{ width: '100%', height: 'auto', padding: '12px', borderRadius: '12px' }}
                    disabled={crushes.includes(attendee.id) || sendingCrush === attendee.id}
                  >
                    {sendingCrush === attendee.id ? (
                      <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                    ) : crushes.includes(attendee.id) ? (
                      <>
                        <Heart size={18} fill="#ec4899" />
                        Crush Sent
                      </>
                    ) : (
                      <>
                        <Heart size={18} />
                        Send Crush
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Group Chat Modal */}
      {showGroupChat && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 5000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            height: '80vh',
            maxHeight: '700px'
          }}>
            <EventGroupChat 
              eventId={id} 
              eventName={event.name}
              onClose={() => setShowGroupChat(false)}
            />
          </div>
        </div>
      )}
    </div>
    </ParticleBackground>
  );
};

export default EventDetail;

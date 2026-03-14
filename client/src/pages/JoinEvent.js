import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Hash, UserPlus, Calendar, Clock, MapPin, Users } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

const JoinEvent = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinedEvent, setJoinedEvent] = useState(null);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const position = await getCurrentPosition();
      const res = await axios.post('http://localhost:5000/api/events/join', {
        code: code.toUpperCase(),
        userLatitude: position.latitude,
        userLongitude: position.longitude
      });
      setJoinedEvent(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to join event');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    // Only allow alphanumeric characters and uppercase
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setCode(value);
    }
  };

  if (joinedEvent) {
    return (
      <ParticleBackground>
        <div className="container" style={{ padding: '60px 20px', maxWidth: '500px', margin: '0 auto' }}>
          <div className="card animate-fadeIn" style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <UserPlus size={40} color="white" />
            </div>
            
            <h2 style={{ marginBottom: '8px' }}>You're In! 🎉</h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
              You've successfully joined the event
            </p>

          <div style={{ 
            background: 'rgba(30, 41, 59, 0.8)', 
            padding: '20px', 
            borderRadius: '16px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <h3 style={{ marginBottom: '12px' }}>{joinedEvent.name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#94a3b8', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} />
                <span>{new Date(joinedEvent.date).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                <span>{joinedEvent.startTime} - {joinedEvent.endTime}</span>
              </div>
              {joinedEvent.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} />
                  <span>{joinedEvent.location}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} />
                <span>{joinedEvent.attendees.length} attendees</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => navigate(`/event/${joinedEvent.id}`)}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              View Event
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
      </ParticleBackground>
    );
  }

  return (
    <ParticleBackground>
      <div className="container" style={{ padding: '60px 20px', maxWidth: '500px', margin: '0 auto' }}>
        <div className="card animate-fadeIn">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Hash size={40} color="white" />
          </div>
          <h2 style={{ marginBottom: '8px' }}>Join Event</h2>
          <p style={{ color: '#94a3b8' }}>
            Enter the 6-character code to join an event
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="ENTER CODE"
              value={code}
              onChange={handleCodeChange}
              style={{ 
                textAlign: 'center', 
                fontSize: '28px', 
                fontFamily: 'monospace',
                letterSpacing: '8px',
                padding: '20px'
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            ) : (
              <>
                <UserPlus size={20} />
                Join Event
            </>
          )}
        </button>
      </form>
    </div>
  </div>
    </ParticleBackground>
  );
};

export default JoinEvent;

import { API_URL } from "../config";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, MapPin, Music, Copy, Check, PartyPopper, Users, Trophy, 
         UtensilsCrossed, Mountain, Gamepad2, Palette, Briefcase, Heart, Globe, Lock, Hash, X } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import LocationPicker from '../components/LocationPicker';

const CATEGORIES = [
  { value: 'social', label: 'Social', icon: Users, color: '#ec4899' },
  { value: 'party', label: 'Party', icon: PartyPopper, color: '#8b5cf6' },
  { value: 'sports', label: 'Sports', icon: Trophy, color: '#10b981' },
  { value: 'music', label: 'Music', icon: Music, color: '#f59e0b' },
  { value: 'food', label: 'Food & Drinks', icon: UtensilsCrossed, color: '#ef4444' },
  { value: 'outdoor', label: 'Outdoor', icon: Mountain, color: '#22c55e' },
  { value: 'gaming', label: 'Gaming', icon: Gamepad2, color: '#6366f1' },
  { value: 'creative', label: 'Creative', icon: Palette, color: '#f472b6' },
  { value: 'networking', label: 'Networking', icon: Briefcase, color: '#0ea5e9' },
  { value: 'wellness', label: 'Wellness', icon: Heart, color: '#14b8a6' }
];

const VIBES = [
  { value: 'casual', label: 'Casual & Chill', emoji: '😊' },
  { value: 'energetic', label: 'High Energy', emoji: '🔥' },
  { value: 'romantic', label: 'Romantic', emoji: '💕' },
  { value: 'adventurous', label: 'Adventurous', emoji: '🎯' },
  { value: 'sophisticated', label: 'Sophisticated', emoji: '✨' },
  { value: 'fun', label: 'Fun & Games', emoji: '🎮' }
];

const CreateEvent = () => {
  // Remove Google Maps refs
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    locationLat: null,
    locationLng: null,
    placeId: '',
    category: 'social',
    vibe: 'casual',
    tags: [],
    maxAttendees: '',
    isPublic: false
  });
  const [tagInput, setTagInput] = useState('');
  const [createdEvent, setCreatedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [locationSelectionError, setLocationSelectionError] = useState('');
  const navigate = useNavigate();


  // Handler for Leaflet map location selection
  const handleLocationPick = (latlng) => {
    setFormData((prev) => ({
      ...prev,
      locationLat: latlng ? latlng[0] : null,
      locationLng: latlng ? latlng[1] : null,
      location: latlng ? `Lat: ${latlng[0].toFixed(5)}, Lng: ${latlng[1].toFixed(5)}` : '',
      placeId: ''
    }));
    setLocationSelectionError(latlng ? '' : 'Please select a location on the map.');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      if (name === 'location') {
        return {
          ...prev,
          location: value,
          locationLat: null,
          locationLng: null,
          placeId: ''
        };
      }

      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
    });

    if (name === 'location') {
      setLocationSelectionError('Pick an exact match from the dropdown.');
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');


    if (!formData.isPublic && (formData.locationLat === null || formData.locationLng === null)) {
      setError('Please select a location on the map.');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null
      };
      const res = await axios.post(`${API_URL}/events/create`, submitData);
      setCreatedEvent(res.data);
    } catch (err) {
      console.error('Create event submission error:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
      }
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(createdEvent.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdEvent) {
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
              <PartyPopper size={40} color="white" />
            </div>
            
            <h2 style={{ marginBottom: '8px' }}>Event Created! 🎉</h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
              Share this code with people you want to invite
            </p>

          <div style={{ 
            background: 'rgba(236, 72, 153, 0.1)', 
            padding: '24px', 
            borderRadius: '16px',
            marginBottom: '24px'
          }}>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Event Code</p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px' 
            }}>
              <span style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                fontFamily: 'monospace',
                letterSpacing: '4px',
                color: '#ec4899'
              }}>
                {createdEvent.code}
              </span>
              <button 
                onClick={copyCode}
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '12px' }}>{createdEvent.name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#94a3b8', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} />
                <span>{new Date(createdEvent.date).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                <span>{createdEvent.startTime} - {createdEvent.endTime}</span>
              </div>
              {createdEvent.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} />
                  <span>{createdEvent.location}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => navigate(`/event/${createdEvent.id}`)}
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
      <div className="container" style={{ padding: '40px 20px', maxWidth: '500px', margin: '0 auto' }}>
        <div className="card animate-fadeIn">
          <h2 style={{ marginBottom: '8px' }}>Create Event</h2>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
            Set up your event and get a code to share
          </p>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Event Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g., Friday Night Party"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    style={{
                      padding: '12px 8px',
                      background: isSelected ? cat.color : 'rgba(100, 116, 139, 0.2)',
                      border: `2px solid ${isSelected ? cat.color : 'transparent'}`,
                      borderRadius: '12px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={18} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vibe Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Event Vibe</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {VIBES.map(vibe => {
                const isSelected = formData.vibe === vibe.value;
                return (
                  <button
                    key={vibe.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, vibe: vibe.value })}
                    style={{
                      padding: '8px 16px',
                      background: isSelected ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'rgba(100, 116, 139, 0.2)',
                      border: 'none',
                      borderRadius: '20px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {vibe.emoji} {vibe.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Description (optional)</label>
            <textarea
              name="description"
              className="form-input"
              placeholder="Tell people what's happening..."
              rows="3"
              value={formData.description}
              onChange={handleChange}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">
              <Hash size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Tags (up to 5)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={addTag}
                className="btn btn-secondary"
                disabled={formData.tags.length >= 5}
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      background: 'rgba(236, 72, 153, 0.2)',
                      color: '#ec4899',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    #{tag}
                    <X
                      size={14}
                      style={{ cursor: 'pointer' }}
                      onClick={() => removeTag(tag)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">
              <Calendar size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Date
            </label>
            <input
              type="date"
              name="date"
              className="form-input"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <label className="form-label">
                <Clock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                className="form-input"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="form-label">
                <Clock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                className="form-input"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">
              <MapPin size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              {formData.isPublic ? 'Event Location (Optional)' : 'Select Event Location (OpenStreetMap)'}
            </label>
            {!formData.isPublic ? (
              <LocationPicker
              position={formData.locationLat && formData.locationLng ? [formData.locationLat, formData.locationLng] : null}
              setPosition={(latlng) => handleLocationPick(latlng)}
            />
            {locationSelectionError && (
              <p style={{ marginTop: '8px', color: '#f59e0b', fontSize: '12px' }}>
                {locationSelectionError}
              </p>
            )}
              </>
            ) : (
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g., Club X, Central Park, or Online"
                value={formData.location}
                onChange={handleChange}
              />
            )}
            {formData.location && !formData.isPublic && (
              <p style={{ marginTop: '8px', color: '#94a3b8', fontSize: '12px' }}>
                {formData.location}
              </p>
            )}
          </div>

          {/* Max Attendees */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">
              <Users size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Max Attendees (optional)
            </label>
            <input
              type="number"
              name="maxAttendees"
              className="form-input"
              placeholder="Leave empty for unlimited"
              value={formData.maxAttendees}
              onChange={handleChange}
              min="2"
            />
          </div>

          {/* Public Toggle */}
          <div style={{ 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: 'rgba(100, 116, 139, 0.1)',
            padding: '16px',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {formData.isPublic ? <Globe size={20} color="#10b981" /> : <Lock size={20} color="#64748b" />}
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  {formData.isPublic ? 'Public Event' : 'Private Event'}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  {formData.isPublic ? 'Anyone can discover and join' : 'Only people with code can join'}
                </p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            ) : (
              <>
                <PartyPopper size={20} />
                Create Event
            </>
          )}
        </button>
      </form>
    </div>
  </div>
    </ParticleBackground>
  );
};

export default CreateEvent;

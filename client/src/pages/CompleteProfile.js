import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../App';
import ParticleBackground from '../components/ParticleBackground';

const CompleteProfile = () => {
  const { user, completeProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    bio: '',
    interests: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const interestOptions = [
    'Music', 'Dancing', 'Sports', 'Travel', 'Food', 'Movies', 
    'Gaming', 'Art', 'Reading', 'Fitness', 'Photography', 'Cooking'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest) => {
    if (formData.interests.includes(interest)) {
      setFormData({ 
        ...formData, 
        interests: formData.interests.filter(i => i !== interest) 
      });
    } else {
      setFormData({ 
        ...formData, 
        interests: [...formData.interests, interest] 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseInt(formData.age) < 18) {
      setError('You must be at least 18 years old');
      return;
    }

    setLoading(true);

    try {
      await completeProfile(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParticleBackground>
      <div className="container" style={{ minHeight: '100vh', padding: '40px 20px' }}>
        <div className="card animate-fadeIn" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img 
              src={user?.avatar} 
              alt={user?.name}
              className="avatar avatar-large"
              style={{ width: '100px', height: '100px', marginBottom: '16px' }}
            />
            <h1 style={{ marginBottom: '8px' }}>Welcome, {user?.name}! 👋</h1>
            <p style={{ color: '#94a3b8' }}>
              Complete your profile to start meeting people at events
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
          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <label className="form-label">
                <Calendar size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Your Age *
              </label>
              <input
                type="number"
                name="age"
                className="form-input"
                placeholder="18+"
                min="18"
                max="100"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="form-label">Gender *</label>
              <select
                name="gender"
                className="form-input"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">
              <Heart size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Bio (optional)
            </label>
            <textarea
              name="bio"
              className="form-input"
              placeholder="Tell others about yourself..."
              rows="3"
              value={formData.bio}
              onChange={handleChange}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">
              <Sparkles size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Interests (select a few)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '2px solid',
                    borderColor: formData.interests.includes(interest) ? '#ec4899' : '#334155',
                    background: formData.interests.includes(interest) ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                    color: formData.interests.includes(interest) ? '#ec4899' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {interest}
                </button>
              ))}
            </div>
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
                Complete Profile
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
    </ParticleBackground>
  );
};

export default CompleteProfile;

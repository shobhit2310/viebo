import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Calendar, Save, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../App';
import ParticleBackground from '../components/ParticleBackground';
import ImageUpload from '../components/ImageUpload';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarChange = (base64Image) => {
    setFormData({ ...formData, avatar: base64Image || user?.avatar });
  };

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
    setSuccess(false);
    setLoading(true);

    try {
      const res = await axios.put('http://localhost:5000/api/auth/profile', formData);
      updateUser(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParticleBackground>
      <div className="container" style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <div className="card animate-fadeIn">
          {/* Profile Header with Image Upload */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <ImageUpload 
              currentImage={formData.avatar || user?.avatar}
              onImageChange={handleAvatarChange}
              size={120}
            />
            <h2 style={{ marginBottom: '4px', marginTop: '16px' }}>{user?.name}</h2>
            <p style={{ color: '#94a3b8' }}>{user?.email}</p>
          </div>

        {/* Success Message */}
        {success && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            color: '#10b981', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Profile updated successfully!
          </div>
        )}

        {/* Error Message */}
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
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">
              <User size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Name
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <label className="form-label">
                <Calendar size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Age
              </label>
              <input
                type="number"
                name="age"
                className="form-input"
                min="18"
                max="100"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="form-label">Gender</label>
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
              Bio
            </label>
            <textarea
              name="bio"
              className="form-input"
              placeholder="Tell others about yourself..."
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">
              <Sparkles size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Interests
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
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </form>

        {/* Account Info */}
        <div style={{ 
          marginTop: '32px', 
          paddingTop: '24px', 
          borderTop: '1px solid rgba(100, 116, 139, 0.2)' 
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', color: '#94a3b8' }}>
            Account Information
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
            <Mail size={18} />
            <span>{user?.email}</span>
          </div>
          <p style={{ 
            marginTop: '12px', 
            fontSize: '13px', 
            color: '#64748b' 
          }}>
            Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
          })}
        </p>
      </div>
    </div>
  </div>
</ParticleBackground>
  );
};

export default Profile;

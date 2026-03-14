import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chrome, Sparkles } from 'lucide-react';
import { useAuth } from '../App';
import GoogleSignInButton from '../components/GoogleSignInButton';
import ParticleBackground from '../components/ParticleBackground';
import ShineBorder from '../components/ShineBorder';

const Register = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credential) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credential, 'signup');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    setError('Google sign-in failed. Please try again.');
    console.error(error);
  };

  return (
    <ParticleBackground>
      <div className="container" style={{ minHeight: '100vh', padding: '30px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ShineBorder 
          borderRadius={16} 
          borderWidth={2}
          duration={8}
          color={['#ec4899', '#8b5cf6', '#00f5ff']}
          style={{ maxWidth: '420px', width: '100%' }}
        >
          <div className="animate-fadeIn" style={{ padding: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 className="logo" style={{ fontSize: '28px', marginBottom: '6px' }}>Viebo 💕</h1>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Create your account with Google in one tap.</p>
          </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444', 
            padding: '10px', 
            borderRadius: '8px', 
            marginBottom: '14px',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#cbd5e1',
          fontSize: '14px',
          marginBottom: '12px'
        }}>
          <Chrome size={16} style={{ color: '#ec4899' }} />
          Google authentication only
        </div>

        <div style={{ marginBottom: '16px' }}>
          <GoogleSignInButton 
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signup_with"
          />
        </div>

          {loading && (
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            </div>
          )}

          <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>
            We will use your Google account to create your Viebo profile instantly.
          </p>

          <p style={{ textAlign: 'center', color: '#94a3b8' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ec4899', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
          </div>
        </ShineBorder>
      </div>
    </ParticleBackground>
  );
};

export default Register;

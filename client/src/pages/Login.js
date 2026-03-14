import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chrome } from 'lucide-react';
import { useAuth } from '../App';
import GoogleSignInButton from '../components/GoogleSignInButton';
import ParticleBackground from '../components/ParticleBackground';
import ShineBorder from '../components/ShineBorder';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credential) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credential, 'signin');
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
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ShineBorder 
          borderRadius={20} 
          borderWidth={2}
          duration={8}
          color={['#ec4899', '#8b5cf6', '#00f5ff']}
          style={{ maxWidth: '400px', width: '100%' }}
        >
          <div className="animate-fadeIn" style={{ padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 className="logo" style={{ fontSize: '36px', marginBottom: '8px' }}>Viebo 💕</h1>
            <p style={{ color: '#94a3b8' }}>Welcome back. Continue with Google.</p>
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

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#cbd5e1',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          <Chrome size={16} style={{ color: '#ec4899' }} />
          Google authentication only
        </div>

        <div style={{ marginBottom: '20px' }}>
          <GoogleSignInButton 
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signin_with"
          />
        </div>

          {loading && (
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            </div>
          )}

          <p style={{ textAlign: 'center', color: '#94a3b8' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#ec4899', textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
          </div>
        </ShineBorder>
      </div>
    </ParticleBackground>
  );
};

export default Login;

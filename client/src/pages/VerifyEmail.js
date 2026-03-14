import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import axios from 'axios';
import ParticleBackground from '../components/ParticleBackground';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/auth/verify-email/${token}`);
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        setStatus('success');
        setMessage(response.data.message);

        if (response.data?.token) {
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1400);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <ParticleBackground>
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div className="card animate-fadeIn" style={{ 
          maxWidth: '420px', 
          width: '100%',
          textAlign: 'center',
          padding: '40px'
        }}>
          {status === 'loading' && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <Loader size={64} className="spin" style={{ color: '#ec4899' }} />
              </div>
              <h2 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Verifying your email...</h2>
              <p style={{ color: '#94a3b8' }}>Please wait a moment</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ 
                marginBottom: '24px',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <CheckCircle size={48} style={{ color: '#22c55e' }} />
              </div>
              <h2 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Email Verified!</h2>
              <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{message}</p>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '18px' }}>Redirecting you to your dashboard...</p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Continue to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ 
                marginBottom: '24px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <XCircle size={48} style={{ color: '#ef4444' }} />
              </div>
              <h2 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Verification Failed</h2>
              <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{message}</p>
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%', marginBottom: '12px' }}>
                Back to Login
              </Link>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Need a new verification link?{' '}
                <Link to="/resend-verification" style={{ color: '#ec4899' }}>
                  Resend email
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </ParticleBackground>
  );
};

export default VerifyEmail;

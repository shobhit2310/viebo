import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';
import ParticleBackground from '../components/ParticleBackground';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tokenStatus, setTokenStatus] = useState('loading'); // loading, valid, invalid
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenStatus('invalid');
        setMessage('Invalid reset link');
        return;
      }

      try {
        await axios.get(`${API_URL}/auth/validate-reset-token/${token}`);
        setTokenStatus('valid');
      } catch (error) {
        setTokenStatus('invalid');
        setMessage(error.response?.data?.message || 'Invalid or expired reset link');
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setSubmitStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setSubmitStatus('error');
      setMessage('Password must be at least 6 characters');
      return;
    }

    setSubmitStatus('loading');
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, { token, password });
      setSubmitStatus('success');
      setMessage(response.data.message);
    } catch (error) {
      setSubmitStatus('error');
      setMessage(error.response?.data?.message || 'Password reset failed');
    }
  };

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
          padding: '32px',
          textAlign: 'center'
        }}>
          {tokenStatus === 'loading' && (
            <>
              <Loader size={48} className="spin" style={{ color: '#ec4899', marginBottom: '24px' }} />
              <h2 style={{ color: '#f1f5f9' }}>Validating link...</h2>
            </>
          )}

          {tokenStatus === 'invalid' && (
            <>
              <div style={{ 
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
              <h2 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Invalid Link</h2>
              <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{message}</p>
              <Link to="/forgot-password" className="btn btn-primary" style={{ width: '100%' }}>
                Request New Reset Link
              </Link>
            </>
          )}

          {tokenStatus === 'valid' && submitStatus === 'success' && (
            <>
              <div style={{ 
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
              <h2 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Password Reset!</h2>
              <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{message}</p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Continue to Login
              </Link>
            </>
          )}

          {tokenStatus === 'valid' && submitStatus !== 'success' && (
            <>
              <Link to="/login" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                color: '#94a3b8', 
                marginBottom: '24px',
                textDecoration: 'none',
                justifyContent: 'flex-start',
                width: '100%'
              }}>
                <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                Back to Login
              </Link>

              <h1 className="logo" style={{ fontSize: '28px', marginBottom: '8px' }}>Reset Password</h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
                Enter your new password below.
              </p>

              {submitStatus === 'error' && (
                <div style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  color: '#ef4444', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">
                    <Lock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label className="form-label">
                    <Lock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={submitStatus === 'loading'}
                >
                  {submitStatus === 'loading' ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
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

export default ResetPassword;

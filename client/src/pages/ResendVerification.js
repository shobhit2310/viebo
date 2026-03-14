import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import axios from 'axios';
import ParticleBackground from '../components/ParticleBackground';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
      setStatus('success');
      setMessage(response.data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Something went wrong');
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
          padding: '32px'
        }}>
          <Link to="/login" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            color: '#94a3b8', 
            marginBottom: '24px',
            textDecoration: 'none'
          }}>
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Back to Login
          </Link>

          {status === 'success' ? (
            <div style={{ textAlign: 'center' }}>
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
              <h2 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Email Sent!</h2>
              <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{message}</p>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Didn't receive it?{' '}
                <button 
                  onClick={() => setStatus('idle')} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#ec4899', 
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h1 className="logo" style={{ fontSize: '28px', marginBottom: '8px' }}>Resend Verification</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                  Enter your email to receive a new verification link.
                </p>
              </div>

              {status === 'error' && (
                <div style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  color: '#ef4444', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontSize: '14px'
                }}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">
                    <Mail size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={18} />
                      Send Verification Email
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </ParticleBackground>
  );
};

export default ResendVerification;

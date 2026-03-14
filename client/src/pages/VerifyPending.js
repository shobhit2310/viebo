import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MailCheck, ShieldCheck, Sparkles } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const VerifyPending = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [pollMessage, setPollMessage] = useState('Waiting for verification...');
  const [isVerified, setIsVerified] = useState(false);

  const normalizedEmail = useMemo(() => (email || '').trim().toLowerCase(), [email]);

  useEffect(() => {
    if (!normalizedEmail) return;

    let stopped = false;
    let intervalId;
    const startedAt = Date.now();
    const maxMs = 10 * 60 * 1000; // 10 minutes

    const checkStatus = async () => {
      if (stopped) return;

      // If verification happened in another tab on the same browser, token will be available.
      const existingToken = localStorage.getItem('token');
      if (existingToken) {
        window.location.href = '/dashboard';
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/verification-status`, {
          params: { email: normalizedEmail }
        });

        if (res.data?.verified) {
          setIsVerified(true);
          setPollMessage('Email verified. Redirecting...');
          window.location.href = '/login';
          return;
        }

        const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
        setPollMessage(`Still waiting... checked ${Math.max(1, Math.floor(elapsedSec / 3))} times`);
      } catch (error) {
        setPollMessage('Could not check status. Retrying...');
      }

      if (Date.now() - startedAt > maxMs) {
        setPollMessage('Verification is taking longer than expected. Check spam or resend email.');
        clearInterval(intervalId);
      }
    };

    checkStatus();
    intervalId = setInterval(checkStatus, 3000);

    return () => {
      stopped = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [normalizedEmail]);

  return (
    <ParticleBackground>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          borderRadius: '24px',
          border: '1px solid rgba(236, 72, 153, 0.35)',
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92))',
          padding: '34px 28px',
          overflow: 'hidden',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.42)'
        }}>
          <div className="verify-orb" />
          <div className="verify-orb second" />

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <div style={{
              margin: '0 auto 16px',
              width: '86px',
              height: '86px',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              background: 'radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.35), rgba(168, 85, 247, 0.12))',
              border: '1px solid rgba(236, 72, 153, 0.45)'
            }}>
              <MailCheck size={44} style={{ color: '#f9a8d4' }} />
            </div>

            <h2 style={{ color: '#f8fafc', marginBottom: '10px', fontSize: '30px', lineHeight: 1.15 }}>
              Check Your Gmail
            </h2>
            <p style={{ color: '#cbd5e1', marginBottom: '18px', fontSize: '15px' }}>
              We sent a verification link to:
            </p>
            <p style={{
              color: '#67e8f9',
              fontWeight: 700,
              marginBottom: '18px',
              wordBreak: 'break-word'
            }}>
              {email || 'your email address'}
            </p>

            <div style={{
              textAlign: 'left',
              borderRadius: '16px',
              background: 'rgba(15, 23, 42, 0.64)',
              border: '1px solid rgba(148, 163, 184, 0.24)',
              padding: '14px 14px 10px',
              color: '#e2e8f0',
              fontSize: '14px',
              marginBottom: '18px'
            }}>
              <p style={{ margin: '0 0 8px' }}><Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: '8px', color: '#f472b6' }} />Tap the verification link in your mail.</p>
              <p style={{ margin: '0 0 8px' }}><ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: '8px', color: '#22d3ee' }} />Check Spam/Junk folder if you cannot find it.</p>
              <p style={{ margin: 0 }}>This page will stay here while you verify your account.</p>
            </div>

            <div className="verify-loader" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            <p style={{ marginTop: '12px', color: isVerified ? '#22d3ee' : '#94a3b8', fontSize: '13px' }}>
              {pollMessage}
            </p>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn btn-secondary">Back to Login</Link>
              <Link to="/resend-verification" className="btn btn-primary">Resend Verification</Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .verify-orb {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          top: -90px;
          left: -80px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.26), transparent 62%);
          filter: blur(10px);
          animation: drift 7s ease-in-out infinite alternate;
        }

        .verify-orb.second {
          top: auto;
          left: auto;
          right: -90px;
          bottom: -100px;
          background: radial-gradient(circle, rgba(34, 211, 238, 0.2), transparent 62%);
          animation-duration: 9s;
        }

        .verify-loader {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .verify-loader span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f472b6, #22d3ee);
          animation: pulseDot 1.15s ease-in-out infinite;
        }

        .verify-loader span:nth-child(2) {
          animation-delay: 0.12s;
        }

        .verify-loader span:nth-child(3) {
          animation-delay: 0.24s;
        }

        @keyframes pulseDot {
          0%, 100% { transform: translateY(0); opacity: 0.45; }
          50% { transform: translateY(-7px); opacity: 1; }
        }

        @keyframes drift {
          from { transform: translateY(0px); }
          to { transform: translateY(20px); }
        }
      `}</style>
    </ParticleBackground>
  );
};

export default VerifyPending;

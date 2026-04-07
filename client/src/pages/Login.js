import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chrome } from 'lucide-react';
import { useAuth } from '../App';
import GoogleSignInButton from '../components/GoogleSignInButton';
import ParticleBackground from '../components/ParticleBackground';

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
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-content">
            <div className="auth-header">
              <h1 className="auth-logo">Viebo 💕</h1>
              <p className="auth-subtitle">Welcome back. Continue with Google.</p>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div className="auth-badge">
              <Chrome size={16} />
              <span>Google authentication only</span>
            </div>

            <div className="auth-button-wrapper">
              <GoogleSignInButton 
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signin_with"
              />
            </div>

            {loading && (
              <div className="auth-spinner-wrapper">
                <div className="spinner"></div>
              </div>
            )}

            <div className="auth-footer">
              <span>Don't have an account? </span>
              <Link to="/register" className="auth-link">Sign up</Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          z-index: 10;
        }

        .auth-card {
          max-width: 420px;
          width: 100%;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
          border-radius: 24px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(219, 39, 119, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 60px rgba(219, 39, 119, 0.1);
          animation: slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
        }

        .auth-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .auth-content {
          padding: 48px 36px;
          position: relative;
          z-index: 2;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo {
          font-family: 'Playfair Display', serif;
          font-size: 40px;
          font-weight: 700;
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: -1px;
          animation: slideUpFade 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.1s both;
        }

        .auth-subtitle {
          color: #cbd5e1;
          font-size: 15px;
          font-weight: 400;
          margin: 12px 0 0 0;
          animation: slideUpFade 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.2s both;
        }

        .auth-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(219, 39, 119, 0.1);
          border: 1px solid rgba(219, 39, 119, 0.2);
          color: #ec4899;
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
          animation: slideUpFade 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.3s both;
        }

        .auth-button-wrapper {
          margin-bottom: 24px;
          animation: slideUpFade 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.4s both;
        }

        .auth-button-wrapper :global(button) {
          width: 100%;
          padding: 14px 20px !important;
          background: white !important;
          color: #be185d !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 15px !important;
          border: none !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 10px !important;
        }

        .auth-button-wrapper :global(button:hover) {
          background: #faf5f7 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(236, 72, 153, 0.25) !important;
        }

        .auth-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          animation: shake 0.5s cubic-bezier(0.36, 0, 0.66, -0.56);
        }

        .auth-spinner-wrapper {
          display: flex;
          justify-content: center;
          margin: 16px 0;
        }

        .auth-footer {
          text-align: center;
          color: #94a3b8;
          font-size: 14px;
          animation: slideUpFade 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.5s both;
        }

        .auth-link {
          color: #ec4899;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
        }

        .auth-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #ec4899, #db2777);
          transition: width 0.3s ease;
        }

        .auth-link:hover::after {
          width: 100%;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        @media (max-width: 600px) {
          .auth-card {
            border-radius: 20px;
          }

          .auth-content {
            padding: 32px 24px;
          }

          .auth-logo {
            font-size: 32px;
          }

          .auth-subtitle {
            font-size: 14px;
          }
        }
      `}</style>
    </ParticleBackground>
  );
};

export default Login;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chrome } from 'lucide-react';
import { useAuth } from '../App';
import GoogleSignInButton from '../components/GoogleSignInButton';
import ParticleBackground from '../components/ParticleBackground';

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
      <div className="auth-page">
        <div className="auth-box">
          <div className="auth-header">
            <h1 className="auth-title">Viebo 💕</h1>
            <p className="auth-tagline">Create your account</p>
          </div>

          {error && (
            <div className="auth-error-box">
              {error}
            </div>
          )}

          <div className="auth-method">
            <Chrome size={18} />
            <span>Google only</span>
          </div>

          <div className="auth-button-box">
            <GoogleSignInButton 
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="signup_with"
            />
          </div>

          {loading && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div className="spinner"></div>
            </div>
          )}

          <div className="auth-divider"></div>

          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link">Sign in</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          z-index: 10;
        }

        .auth-box {
          width: 100%;
          max-width: 380px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          border-radius: 16px;
          padding: 40px 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          animation: slideInUp 0.5s ease-out;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .auth-tagline {
          color: #64748b;
          font-size: 14px;
          margin: 8px 0 0 0;
          font-weight: 400;
        }

        .auth-error-box {
          background: #fee2e2;
          color: #991b1b;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          text-align: center;
          margin-bottom: 20px;
          border: 1px solid #fecaca;
        }

        .auth-method {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #ec4899;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .auth-button-box {
          margin-bottom: 24px;
        }

        .auth-button-box :global(button) {
          width: 100% !important;
          padding: 12px 16px !important;
          background: #ec4899 !important;
          color: white !important;
          border: none !important;
          border-radius: 10px !important;
          font-weight: 600 !important;
          font-size: 15px !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 10px !important;
        }

        .auth-button-box :global(button:hover) {
          background: #db2777 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(236, 72, 153, 0.3) !important;
        }

        .auth-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 24px 0;
        }

        .auth-footer-text {
          text-align: center;
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .auth-footer-link {
          color: #ec4899;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .auth-footer-link:hover {
          color: #db2777;
        }

        @media (max-width: 600px) {
          .auth-box {
            padding: 32px 24px;
          }

          .auth-title {
            font-size: 28px;
          }

          .auth-tagline {
            font-size: 13px;
          }
        }
      `}</style>
    </ParticleBackground>
  );
};

export default Register;

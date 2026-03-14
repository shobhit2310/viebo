import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState('android');

  useEffect(() => {
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) setPlatform('ios');

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 2500);
      }
    };

    // For iOS, we show the prompt regardless if not installed, as there's no event
    if (isIOS) {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (!dismissed) {
          setTimeout(() => setShowPrompt(true), 3000);
        }
    }

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (platform === 'ios') {
        // Just show instructions - handled in the UI
        return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted install');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  // If on Android but no prompt event yet, wait for it
  if (platform === 'android' && !deferredPrompt) {
      return null;
  }

  return (
    <div className="install-prompt-overlay" style={{
      position: 'fixed',
      bottom: '100px', // Raised slightly for visibility
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10000,
      width: '90%',
      maxWidth: '420px',
      animation: 'slideUpBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        padding: '20px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            borderRadius: '16px',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(236, 72, 153, 0.3)',
            flexShrink: 0
            }}>
            <Download size={28} color="white" />
            </div>
            
            <div style={{ flex: 1 }}>
            <h3 style={{ 
                color: 'white', 
                margin: '0 0 4px 0', 
                fontSize: '18px',
                fontWeight: '700'
            }}>
                Download Viebo? 💖
            </h3>
            <p style={{ 
                color: '#94a3b8', 
                margin: 0, 
                fontSize: '13px',
                lineHeight: '1.4'
            }}>
                {platform === 'ios' 
                    ? 'Install Viebo for a better experience at events.' 
                    : 'Get the app for instant matches and real-time updates.'}
            </p>
            </div>

            <button
            onClick={handleDismiss}
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                padding: '8px',
                color: '#94a3b8',
                cursor: 'pointer',
                borderRadius: '50%',
                alignSelf: 'flex-start'
            }}
            >
            <X size={20} />
            </button>
        </div>

        {platform === 'ios' ? (
            <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                padding: '12px 16px', 
                borderRadius: '12px',
                fontSize: '13px',
                color: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <Share size={18} color="#3b82f6" />
                <span>Tap <strong>Share</strong> then <strong>Add to Home Screen</strong></span>
            </div>
        ) : (
            <button
                onClick={handleInstallClick}
                className="btn-primary"
                style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.2)'
                }}
            >
                Download Now
            </button>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUpBounce {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(40px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default InstallPrompt;

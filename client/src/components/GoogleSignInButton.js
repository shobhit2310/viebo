import React, { useEffect, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '../config';

const GoogleSignInButton = ({ onSuccess, onError, text = 'signin_with' }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    // Wait for Google script to load
    const initializeGoogle = () => {
      if (window.google && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: '100%',
          text: text,
          shape: 'rectangular',
          logo_alignment: 'center',
        });
      }
    };

    // Check if script is already loaded
    if (window.google) {
      initializeGoogle();
    } else {
      // Wait for script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogle();
        }
      }, 100);

      // Cleanup
      return () => clearInterval(checkGoogle);
    }
  }, []);

  const handleCredentialResponse = (response) => {
    if (response.credential) {
      onSuccess(response.credential);
    } else {
      onError('No credential received');
    }
  };

  return (
    <div 
      ref={buttonRef} 
      style={{ 
        display: 'flex', 
        justifyContent: 'center',
        minHeight: '44px'
      }}
    />
  );
};

export default GoogleSignInButton;

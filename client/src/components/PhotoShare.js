import React, { useRef, useState } from 'react';
import { Image, X, Send, Camera } from 'lucide-react';

const PhotoShare = ({ onSendPhoto, disabled }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    // Read and resize
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        setPreview(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!preview) return;
    
    setUploading(true);
    try {
      await onSendPhoto(preview);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Failed to send photo:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        capture="environment"
      />

      {preview ? (
        <div className="photo-preview-container">
          <div className="photo-preview">
            <img src={preview} alt="Preview" />
            <button className="cancel-btn" onClick={handleCancel}>
              <X size={20} />
            </button>
          </div>
          <button 
            className="send-photo-btn"
            onClick={handleSend}
            disabled={uploading}
          >
            {uploading ? (
              <div className="spinner-small" />
            ) : (
              <>
                <Send size={18} />
                Send Photo
              </>
            )}
          </button>
        </div>
      ) : (
        <button
          className="photo-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Send a photo"
        >
          <Image size={20} />
        </button>
      )}

      <style jsx>{`
        .photo-btn {
          background: rgba(100, 116, 139, 0.2);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .photo-btn:hover:not(:disabled) {
          background: rgba(139, 92, 246, 0.2);
          color: #8b5cf6;
        }

        .photo-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .photo-preview-container {
          position: absolute;
          bottom: 100%;
          left: 12px;
          right: 12px;
          background: rgba(30, 41, 59, 0.98);
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 8px;
          border: 1px solid rgba(100, 116, 139, 0.3);
          box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .photo-preview {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .photo-preview img {
          width: 100%;
          max-height: 200px;
          object-fit: contain;
          display: block;
        }

        .cancel-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: #ef4444;
        }

        .send-photo-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .send-photo-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(139, 92, 246, 0.4);
        }

        .send-photo-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

// Photo Message Bubble Component
export const PhotoMessage = ({ src, sent }) => {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div 
        className={`photo-message ${sent ? 'sent' : 'received'}`}
        onClick={() => setFullscreen(true)}
      >
        <img src={src} alt="Shared" />
      </div>

      {fullscreen && (
        <div className="fullscreen-overlay" onClick={() => setFullscreen(false)}>
          <button className="close-fullscreen" onClick={() => setFullscreen(false)}>
            <X size={24} />
          </button>
          <img src={src} alt="Shared" />
        </div>
      )}

      <style jsx>{`
        .photo-message {
          max-width: 70%;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .photo-message:hover {
          transform: scale(1.02);
        }

        .photo-message.sent {
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }

        .photo-message.received {
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }

        .photo-message img {
          display: block;
          width: 100%;
          max-width: 300px;
          max-height: 300px;
          object-fit: cover;
        }

        .fullscreen-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .fullscreen-overlay img {
          max-width: 95%;
          max-height: 95%;
          object-fit: contain;
        }

        .close-fullscreen {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-fullscreen:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
};

export default PhotoShare;

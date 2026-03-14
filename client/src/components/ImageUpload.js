import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';

const ImageUpload = ({ currentImage, onImageChange, size = 120 }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    // Read and resize image
    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize
        const canvas = document.createElement('canvas');
        const maxSize = 400; // Max dimension
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
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

        // Convert to base64 (JPEG for smaller size)
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        setPreview(base64);
        onImageChange(base64);
        setUploading(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = preview || currentImage;

  return (
    <div className="image-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        capture="user" // Opens camera on mobile
      />
      
      <div
        className={`image-upload-preview ${isHovering ? 'hovering' : ''}`}
        style={{ width: size, height: size }}
        onClick={triggerFileInput}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {displayImage ? (
          <>
            <img 
              src={displayImage} 
              alt="Profile" 
              className="preview-image"
            />
            <div className="image-overlay">
              {uploading ? (
                <div className="upload-spinner"></div>
              ) : (
                <>
                  <Camera size={24} />
                  <span>Change</span>
                </>
              )}
            </div>
            {preview && (
              <button 
                className="remove-image-btn"
                onClick={removeImage}
                title="Remove image"
              >
                <X size={16} />
              </button>
            )}
          </>
        ) : (
          <div className="upload-placeholder">
            {uploading ? (
              <div className="upload-spinner"></div>
            ) : (
              <>
                <Upload size={32} />
                <span>Upload Photo</span>
              </>
            )}
          </div>
        )}
      </div>

      <p className="upload-hint">Click to upload or take a photo</p>

      <style jsx>{`
        .image-upload-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .image-upload-preview {
          position: relative;
          border-radius: 50%;
          overflow: hidden;
          cursor: pointer;
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2));
          border: 3px solid transparent;
          background-clip: padding-box;
          transition: all 0.3s ease;
        }

        .image-upload-preview::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          background: linear-gradient(135deg, #ec4899, #8b5cf6, #00f5ff);
          border-radius: 50%;
          z-index: -1;
          animation: borderRotate 3s linear infinite;
        }

        @keyframes borderRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .image-upload-preview.hovering {
          transform: scale(1.05);
          box-shadow: 0 10px 40px rgba(236, 72, 153, 0.4);
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.3s ease;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }

        .image-upload-preview:hover .image-overlay {
          opacity: 1;
        }

        .upload-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
          background: rgba(30, 41, 59, 0.8);
          transition: all 0.3s ease;
        }

        .image-upload-preview:hover .upload-placeholder {
          color: #ec4899;
          background: rgba(236, 72, 153, 0.1);
        }

        .remove-image-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.9);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .remove-image-btn:hover {
          background: #ef4444;
          transform: scale(1.1);
        }

        .upload-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ec4899;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .upload-hint {
          color: #64748b;
          font-size: 12px;
          text-align: center;
        }

        /* Mobile camera button */
        @media (max-width: 768px) {
          .upload-hint {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;

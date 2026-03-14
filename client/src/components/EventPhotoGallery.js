import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, Heart, X, Plus, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { useAuth } from '../App';

const EventPhotoGallery = ({ eventId, eventName }) => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    fetchPhotos();
  }, [eventId]);

  const fetchPhotos = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/event-features/${eventId}/photos`);
      setPhotos(res.data);
    } catch (err) {
      console.error('Failed to fetch photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Resize image
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 1200;
          let { width, height } = img;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          setPreviewImage(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    if (!previewImage) return;
    
    setUploading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/event-features/${eventId}/photos`, {
        imageUrl: previewImage,
        caption
      });
      setPhotos([res.data, ...photos]);
      setShowUpload(false);
      setPreviewImage(null);
      setCaption('');
    } catch (err) {
      console.error('Failed to upload photo:', err);
    } finally {
      setUploading(false);
    }
  };

  const toggleLike = async (photoId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/event-features/${eventId}/photos/${photoId}/like`
      );
      
      setPhotos(photos.map(p => {
        if (p.id === photoId) {
          return {
            ...p,
            isLiked: res.data.liked,
            likes_count: res.data.liked ? p.likes_count + 1 : p.likes_count - 1
          };
        }
        return p;
      }));

      // Update selected photo if viewing
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto({
          ...selectedPhoto,
          isLiked: res.data.liked,
          likes_count: res.data.liked ? selectedPhoto.likes_count + 1 : selectedPhoto.likes_count - 1
        });
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const navigatePhoto = (direction) => {
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % photos.length
      : (currentIndex - 1 + photos.length) % photos.length;
    setSelectedPhoto(photos[newIndex]);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="photo-gallery">
      {/* Header */}
      <div className="gallery-header">
        <div className="header-title">
          <Camera size={24} />
          <h3>Event Photos</h3>
          <span className="photo-count">{photos.length} photos</span>
        </div>
        <button className="upload-btn" onClick={() => setShowUpload(true)}>
          <Plus size={20} />
          Add Photo
        </button>
      </div>

      {/* Gallery Grid */}
      {photos.length === 0 ? (
        <div className="empty-gallery">
          <Camera size={48} />
          <h4>No photos yet</h4>
          <p>Be the first to share a moment from this event!</p>
          <button className="upload-btn-large" onClick={() => setShowUpload(true)}>
            <Upload size={20} />
            Upload Photo
          </button>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo, index) => (
            <div 
              key={photo.id} 
              className="gallery-item"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img src={photo.image_url} alt={photo.caption || 'Event photo'} />
              <div className="photo-overlay">
                <div className="photo-likes">
                  <Heart size={16} fill={photo.isLiked ? '#ec4899' : 'none'} />
                  <span>{photo.likes_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="upload-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Event Photo</h3>
              <button onClick={() => setShowUpload(false)}>
                <X size={24} />
              </button>
            </div>

            {previewImage ? (
              <div className="preview-container">
                <img src={previewImage} alt="Preview" />
                <button className="remove-preview" onClick={() => setPreviewImage(null)}>
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label className="file-input-label">
                <Camera size={32} />
                <span>Select a photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  hidden
                />
              </label>
            )}

            <div className="caption-input">
              <input
                type="text"
                placeholder="Add a caption (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={200}
              />
            </div>

            <button 
              className="submit-btn"
              onClick={uploadPhoto}
              disabled={!previewImage || uploading}
            >
              {uploading ? (
                <div className="spinner small"></div>
              ) : (
                <>
                  <Upload size={20} />
                  Share Photo
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="lightbox" onClick={() => setSelectedPhoto(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="close-lightbox" onClick={() => setSelectedPhoto(null)}>
              <X size={24} />
            </button>
            
            {photos.length > 1 && (
              <>
                <button className="nav-btn prev" onClick={() => navigatePhoto('prev')}>
                  <ChevronLeft size={32} />
                </button>
                <button className="nav-btn next" onClick={() => navigatePhoto('next')}>
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <img src={selectedPhoto.image_url} alt={selectedPhoto.caption || 'Event photo'} />
            
            <div className="lightbox-info">
              <div className="photo-author">
                <img 
                  src={selectedPhoto.users?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                  alt={selectedPhoto.users?.name}
                />
                <div>
                  <span className="author-name">{selectedPhoto.users?.name}</span>
                  <span className="photo-date">{formatDate(selectedPhoto.created_at)}</span>
                </div>
              </div>
              
              {selectedPhoto.caption && (
                <p className="photo-caption">{selectedPhoto.caption}</p>
              )}
              
              <button 
                className={`like-btn ${selectedPhoto.isLiked ? 'liked' : ''}`}
                onClick={() => toggleLike(selectedPhoto.id)}
              >
                <Heart size={20} fill={selectedPhoto.isLiked ? '#ec4899' : 'none'} />
                <span>{selectedPhoto.likes_count} likes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .photo-gallery {
          background: rgba(30, 41, 59, 0.6);
          border-radius: 16px;
          padding: 24px;
        }

        .gallery-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
        }

        .gallery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f8fafc;
        }

        .header-title h3 {
          margin: 0;
        }

        .photo-count {
          background: rgba(100, 116, 139, 0.3);
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          color: #94a3b8;
        }

        .upload-btn {
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          color: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
        }

        .empty-gallery {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        .empty-gallery h4 {
          color: #f8fafc;
          margin: 16px 0 8px;
        }

        .upload-btn-large {
          margin-top: 20px;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          border: none;
          border-radius: 12px;
          padding: 14px 24px;
          color: white;
          font-size: 16px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }

        .gallery-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gallery-item:hover {
          transform: scale(1.03);
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .gallery-item:hover .photo-overlay {
          opacity: 1;
        }

        .photo-likes {
          display: flex;
          align-items: center;
          gap: 4px;
          color: white;
          font-size: 12px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
          padding: 20px;
        }

        .upload-modal {
          background: #1e293b;
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          max-width: 400px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          margin: 0;
          color: #f8fafc;
        }

        .modal-header button {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
        }

        .preview-container {
          position: relative;
          margin-bottom: 16px;
        }

        .preview-container img {
          width: 100%;
          border-radius: 12px;
        }

        .remove-preview {
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
        }

        .file-input-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px;
          border: 2px dashed rgba(100, 116, 139, 0.4);
          border-radius: 12px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 16px;
        }

        .file-input-label:hover {
          border-color: #ec4899;
          color: #ec4899;
        }

        .caption-input input {
          width: 100%;
          background: rgba(100, 116, 139, 0.2);
          border: 1px solid rgba(100, 116, 139, 0.3);
          border-radius: 8px;
          padding: 12px;
          color: #f8fafc;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          border: none;
          border-radius: 8px;
          padding: 14px;
          color: white;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .lightbox {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 6000;
        }

        .lightbox-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .lightbox-content > img {
          max-width: 100%;
          max-height: 70vh;
          object-fit: contain;
          border-radius: 8px;
        }

        .close-lightbox {
          position: absolute;
          top: -48px;
          right: 0;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn.prev { left: -60px; }
        .nav-btn.next { right: -60px; }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .lightbox-info {
          margin-top: 16px;
          text-align: center;
        }

        .photo-author {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .photo-author img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .author-name {
          display: block;
          color: #f8fafc;
          font-weight: 500;
        }

        .photo-date {
          font-size: 12px;
          color: #64748b;
        }

        .photo-caption {
          color: #94a3b8;
          margin: 12px 0;
        }

        .like-btn {
          background: rgba(100, 116, 139, 0.2);
          border: none;
          border-radius: 20px;
          padding: 10px 20px;
          color: white;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .like-btn.liked {
          background: rgba(236, 72, 153, 0.2);
          color: #ec4899;
        }

        .like-btn:hover {
          transform: scale(1.05);
        }

        .spinner.small {
          width: 20px;
          height: 20px;
        }

        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }

          .nav-btn {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default EventPhotoGallery;

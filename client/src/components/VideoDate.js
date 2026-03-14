import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Maximize2, Minimize2, X, ChevronUp } from 'lucide-react';

const VideoDate = ({ match, onClose, socket }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    startLocalVideo();
    simulateConnection();

    return () => {
      stopLocalVideo();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const stopLocalVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const simulateConnection = () => {
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      // Start call timer
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }, 2000);
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    stopLocalVideo();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onClose();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`video-date-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Remote Video (or connecting screen) */}
      <div className="remote-video-container">
        {isConnecting ? (
          <div className="connecting-screen">
            <img 
              src={match?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'} 
              alt={match?.name}
              className="connecting-avatar"
            />
            <div className="connecting-pulse"></div>
            <p className="connecting-text">Connecting to {match?.name}...</p>
            <div className="connecting-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : isConnected ? (
          <div className="connected-screen">
            {/* In real implementation, this would show remote video */}
            <img 
              src={match?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'} 
              alt={match?.name}
              className="remote-avatar-placeholder"
            />
            <p className="remote-name">{match?.name}</p>
            <p className="video-note">Video calling requires WebRTC setup</p>
          </div>
        ) : (
          <div className="error-screen">
            <p>{error || 'Connection failed'}</p>
          </div>
        )}

        {/* Call Duration */}
        {isConnected && (
          <div className="call-duration">
            <div className="duration-dot"></div>
            {formatDuration(callDuration)}
          </div>
        )}

        {/* Close Button */}
        <button className="close-btn-absolute" onClick={endCall}>
          <X size={24} />
        </button>
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="local-video-container">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={isCameraOn ? '' : 'hidden'}
        />
        {!isCameraOn && (
          <div className="camera-off-placeholder">
            <VideoOff size={32} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="video-controls">
        <button 
          className={`control-btn ${!isMicOn ? 'off' : ''}`}
          onClick={toggleMic}
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <button 
          className="control-btn end-call"
          onClick={endCall}
        >
          <PhoneOff size={24} />
        </button>

        <button 
          className={`control-btn ${!isCameraOn ? 'off' : ''}`}
          onClick={toggleCamera}
        >
          {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>

        <button 
          className="control-btn secondary"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      <style jsx>{`
        .video-date-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000;
          z-index: 10000;
          display: flex;
          flex-direction: column;
        }

        .video-date-container.fullscreen {
          /* Additional fullscreen styles if needed */
        }

        .remote-video-container {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }

        .connecting-screen {
          text-align: center;
          position: relative;
        }

        .connecting-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid #ec4899;
          position: relative;
          z-index: 1;
        }

        .connecting-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 3px solid #ec4899;
          animation: pulse 2s ease-out infinite;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        .connecting-text {
          color: #f8fafc;
          font-size: 18px;
          margin-top: 24px;
        }

        .connecting-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
        }

        .connecting-dots span {
          width: 8px;
          height: 8px;
          background: #ec4899;
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite;
        }

        .connecting-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .connecting-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
        }

        .connected-screen {
          text-align: center;
        }

        .remote-avatar-placeholder {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 4px solid #10b981;
          margin-bottom: 16px;
        }

        .remote-name {
          color: #f8fafc;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .video-note {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .call-duration {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.5);
          padding: 8px 16px;
          border-radius: 20px;
          color: #f8fafc;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .duration-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: blink 2s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .close-btn-absolute {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.5);
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

        .close-btn-absolute:hover {
          background: rgba(239, 68, 68, 0.8);
        }

        .local-video-container {
          position: absolute;
          bottom: 120px;
          right: 20px;
          width: 120px;
          height: 160px;
          border-radius: 16px;
          overflow: hidden;
          border: 3px solid #ec4899;
          background: #1e293b;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .local-video-container video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
        }

        .local-video-container video.hidden {
          display: none;
        }

        .camera-off-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1e293b;
          color: #64748b;
        }

        .video-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px;
          display: flex;
          justify-content: center;
          gap: 16px;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
        }

        .control-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .control-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .control-btn.off {
          background: rgba(239, 68, 68, 0.8);
        }

        .control-btn.end-call {
          width: 64px;
          height: 64px;
          background: #ef4444;
        }

        .control-btn.end-call:hover {
          background: #dc2626;
        }

        .control-btn.secondary {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 480px) {
          .local-video-container {
            width: 100px;
            height: 130px;
            bottom: 110px;
            right: 12px;
          }

          .control-btn {
            width: 48px;
            height: 48px;
          }

          .control-btn.end-call {
            width: 56px;
            height: 56px;
          }
        }
      `}</style>
    </div>
  );
};

// Video Call Button Component
export const VideoCallButton = ({ onClick, disabled }) => {
  return (
    <button 
      className="video-call-btn"
      onClick={onClick}
      disabled={disabled}
      title="Start video date"
    >
      <Video size={20} />
      <style jsx>{`
        .video-call-btn {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .video-call-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 5px 20px rgba(139, 92, 246, 0.4);
        }

        .video-call-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
};

export default VideoDate;

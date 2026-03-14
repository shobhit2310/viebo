import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Send, X } from 'lucide-react';

// Voice Recorder Component
const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setDuration(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSend = () => {
    if (audioUrl) {
      // Convert blob URL to base64
      fetch(audioUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            onSend(reader.result, duration);
          };
          reader.readAsDataURL(blob);
        });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder">
      <div className="voice-recorder-header">
        <h4>Voice Message</h4>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <div className="voice-recorder-content">
        {!audioUrl ? (
          <div className="recording-controls">
            <div className={`record-button ${isRecording ? 'recording' : ''}`}>
              {isRecording ? (
                <button onClick={stopRecording} className="stop-btn">
                  <Square size={24} />
                </button>
              ) : (
                <button onClick={startRecording} className="mic-btn">
                  <Mic size={32} />
                </button>
              )}
            </div>
            
            <div className="duration-display">
              {isRecording && (
                <>
                  <span className="recording-indicator"></span>
                  <span>{formatTime(duration)}</span>
                </>
              )}
              {!isRecording && duration === 0 && (
                <span className="hint">Tap to record</span>
              )}
            </div>
          </div>
        ) : (
          <div className="playback-controls">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
            />
            
            <button onClick={togglePlayback} className="play-btn">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <div className="waveform">
              {[...Array(30)].map((_, i) => (
                <div 
                  key={i} 
                  className={`wave-bar ${isPlaying ? 'animate' : ''}`}
                  style={{ 
                    height: `${Math.random() * 24 + 8}px`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
            
            <span className="duration">{formatTime(duration)}</span>
            
            <button onClick={deleteRecording} className="delete-btn">
              <Trash2 size={20} />
            </button>
            
            <button onClick={handleSend} className="send-btn">
              <Send size={20} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .voice-recorder {
          background: #1e293b;
          border-radius: 16px;
          overflow: hidden;
        }

        .voice-recorder-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(100, 116, 139, 0.2);
        }

        .voice-recorder-header h4 {
          margin: 0;
          color: #f8fafc;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
        }

        .close-btn:hover {
          color: #f8fafc;
        }

        .voice-recorder-content {
          padding: 32px 20px;
        }

        .recording-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .record-button {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .record-button.recording {
          animation: pulse 1.5s infinite;
          box-shadow: 0 0 30px rgba(236, 72, 153, 0.5);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .mic-btn, .stop-btn {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .duration-display {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #f8fafc;
          font-size: 24px;
          font-family: monospace;
        }

        .recording-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ef4444;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .hint {
          color: #94a3b8;
          font-size: 14px;
          font-family: inherit;
        }

        .playback-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .play-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .waveform {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 3px;
          height: 40px;
        }

        .wave-bar {
          width: 3px;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          border-radius: 2px;
          transition: height 0.1s ease;
        }

        .wave-bar.animate {
          animation: wave 0.5s ease-in-out infinite alternate;
        }

        @keyframes wave {
          from { transform: scaleY(0.5); }
          to { transform: scaleY(1); }
        }

        .duration {
          color: #94a3b8;
          font-family: monospace;
          font-size: 14px;
          min-width: 40px;
        }

        .delete-btn, .send-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .send-btn {
          background: #ec4899;
          color: white;
        }

        .send-btn:hover {
          background: #db2777;
        }
      `}</style>
    </div>
  );
};

// Voice Message Playback Component
export const VoiceMessage = ({ src, duration, isSent }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const prog = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(prog);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`voice-message ${isSent ? 'sent' : 'received'}`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
      />

      <button onClick={togglePlay} className="play-btn-small">
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
        <div className="waveform-mini">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className={`wave-bar-mini ${isPlaying ? 'animate' : ''}`}
              style={{ 
                height: `${Math.random() * 12 + 4}px`,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
      </div>

      <span className="duration-mini">{formatTime(duration)}</span>

      <style jsx>{`
        .voice-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 16px;
          min-width: 180px;
        }

        .voice-message.sent {
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
        }

        .voice-message.received {
          background: rgba(100, 116, 139, 0.3);
        }

        .play-btn-small {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .progress-container {
          flex: 1;
          position: relative;
          height: 24px;
        }

        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 1px;
          transition: width 0.1s linear;
        }

        .waveform-mini {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 100%;
        }

        .wave-bar-mini {
          width: 2px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 1px;
        }

        .wave-bar-mini.animate {
          animation: wave-mini 0.5s ease-in-out infinite alternate;
        }

        @keyframes wave-mini {
          from { transform: scaleY(0.5); }
          to { transform: scaleY(1); }
        }

        .duration-mini {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
};

export default VoiceRecorder;

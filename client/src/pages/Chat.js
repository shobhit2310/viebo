import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Send, Heart, Calendar, MessageCircle, Image, Video, X, ChevronDown, ChevronUp, Mic, Smile, Check, CheckCheck } from 'lucide-react';
import { useAuth, useSocket } from '../App';
import ParticleBackground from '../components/ParticleBackground';
import DatePlanner from '../components/DatePlanner';
import Icebreakers from '../components/Icebreakers';
import PhotoShare, { PhotoMessage } from '../components/PhotoShare';
import VideoDate, { VideoCallButton } from '../components/VideoDate';
import VoiceRecorder, { VoiceMessage } from '../components/VoiceRecorder';
import GifPicker from '../components/GifPicker';

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // 2nd Step Dating Features State
  const [showDatePlanner, setShowDatePlanner] = useState(false);
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const [showPhotoShare, setShowPhotoShare] = useState(false);
  const [showVideoDate, setShowVideoDate] = useState(false);
  const [showFeatureMenu, setShowFeatureMenu] = useState(false);
  
  // Chat Improvements State
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchChatData();
  }, [matchId]);

  useEffect(() => {
    if (socket && matchId) {
      socket.emit('join-chat', matchId);
      
      socket.on('new-message', (message) => {
        if (message.matchId === matchId) {
          setMessages(prev => [...prev, message]);
          // Mark message as read if we're viewing the chat
          markMessagesAsRead();
        }
      });

      // Typing indicator listener
      socket.on('user-typing', ({ userId, isTyping }) => {
        if (userId !== user?.id) {
          setOtherUserTyping(isTyping);
        }
      });

      // Read receipt listener
      socket.on('messages-read', ({ matchId: mId, readAt }) => {
        if (mId === matchId) {
          setMessages(prev => prev.map(msg => 
            msg.senderId === user?.id && !msg.readAt 
              ? { ...msg, readAt } 
              : msg
          ));
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new-message');
        socket.off('user-typing');
        socket.off('messages-read');
      }
    };
  }, [socket, matchId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatData = async () => {
    try {
      const [matchRes, messagesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/matches/my-matches'),
        axios.get(`http://localhost:5000/api/chat/${matchId}`)
      ]);
      
      const currentMatch = matchRes.data.find(m => m.id === matchId);
      if (!currentMatch) {
        navigate('/matches');
        return;
      }
      
      setMatch(currentMatch);
      setMessages(messagesRes.data);
      
      // Mark messages as read
      markMessagesAsRead();
    } catch (err) {
      console.error('Failed to fetch chat data:', err);
      navigate('/matches');
    } finally {
      setLoading(false);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    try {
      await axios.post(`http://localhost:5000/api/chat/${matchId}/read`);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [matchId]);

  // Handle typing indicator
  const handleTypingStart = useCallback(() => {
    if (!isTyping && socket && match) {
      setIsTyping(true);
      socket.emit('typing-start', { 
        matchId, 
        userId: user?.id, 
        userName: user?.name 
      });
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 2000);
  }, [isTyping, socket, matchId, user?.id, user?.name, match]);

  const handleTypingStop = useCallback(() => {
    if (isTyping && socket) {
      setIsTyping(false);
      socket.emit('typing-stop', { matchId, userId: user?.id });
    }
  }, [isTyping, socket, matchId, user?.id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await axios.post('http://localhost:5000/api/chat/send', {
        matchId,
        content: newMessage.trim()
      });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle photo send
  const handlePhotoSend = async (imageData) => {
    try {
      await axios.post('http://localhost:5000/api/chat/send', {
        matchId,
        content: imageData,
        type: 'image'
      });
      setShowPhotoShare(false);
    } catch (err) {
      console.error('Failed to send photo:', err);
    }
  };

  // Handle voice message send
  const handleVoiceSend = async (audioData, duration) => {
    try {
      await axios.post('http://localhost:5000/api/chat/send', {
        matchId,
        content: audioData,
        type: 'voice',
        duration
      });
      setShowVoiceRecorder(false);
    } catch (err) {
      console.error('Failed to send voice message:', err);
    }
  };

  // Handle GIF send
  const handleGifSend = async (gifUrl) => {
    try {
      await axios.post('http://localhost:5000/api/chat/send', {
        matchId,
        content: gifUrl,
        type: 'gif'
      });
      setShowGifPicker(false);
    } catch (err) {
      console.error('Failed to send GIF:', err);
    }
  };

  // Handle icebreaker question use - send directly
  const handleIcebreakerUse = async (question) => {
    try {
      await axios.post('http://localhost:5000/api/chat/send', {
        matchId,
        content: question
      });
      setShowIcebreakers(false);
    } catch (err) {
      console.error('Failed to send icebreaker:', err);
    }
  };

  // Handle date proposal
  const handleDatePropose = (dateData) => {
    // Send system message about date proposal
    const proposalMessage = `📅 I'd love to plan a date! How about ${dateData.activity} at ${dateData.location} on ${dateData.date} at ${dateData.time}?`;
    axios.post('http://localhost:5000/api/chat/send', {
      matchId,
      content: proposalMessage
    });
    setShowDatePlanner(false);
  };

  // Check if message is an image
  const isImageMessage = (content) => {
    return content && (content.startsWith('data:image') || content.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  };

  // Check if message is a GIF (URL from Tenor/GIPHY)
  const isGifMessage = (content, type) => {
    return type === 'gif' || (content && content.includes('tenor.com')) || (content && content.includes('giphy.com'));
  };

  // Check if message is a voice message
  const isVoiceMessage = (content, type) => {
    return type === 'voice' || (content && content.startsWith('data:audio'));
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (loading) {
    return (
      <ParticleBackground>
        <div className="loading-container" style={{ minHeight: '60vh' }}>
          <div className="spinner"></div>
        </div>
      </ParticleBackground>
    );
  }

  if (!match) {
    return null;
  }

  return (
    <ParticleBackground>
      <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <div style={{ 
        padding: '16px 20px',
        background: 'rgba(30, 41, 59, 0.95)',
        borderBottom: '1px solid rgba(100, 116, 139, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button 
          onClick={() => navigate('/matches')}
          className="btn btn-secondary"
          style={{ padding: '8px' }}
        >
          <ArrowLeft size={20} />
        </button>
        
        <img 
          src={match.otherUser.avatar} 
          alt={match.otherUser.name} 
          className="avatar"
        />
        
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '2px' }}>{match.otherUser.name}</h3>
          {match.event && (
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>
              <Heart size={12} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#ec4899' }} />
              Matched at {match.event.name}
            </p>
          )}
        </div>

        {/* Video Call Button */}
        <VideoCallButton 
          onClick={() => setShowVideoDate(true)}
          disabled={false}
        />
      </div>

      {/* Messages */}
      <div className="messages-container" style={{ flex: 1, padding: '20px' }}>
        {messages.length === 0 ? (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            <img 
              src={match.otherUser.avatar} 
              alt={match.otherUser.name}
              className="avatar avatar-large"
              style={{ marginBottom: '16px' }}
            />
            <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>
              You matched with {match.otherUser.name}! 💕
            </h3>
            <p>Say hi and start a conversation!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <React.Fragment key={date}>
              <div style={{ 
                textAlign: 'center', 
                color: '#64748b', 
                fontSize: '12px',
                margin: '16px 0'
              }}>
                {date}
              </div>
              {msgs.map(message => (
                <div 
                  key={message.id}
                  className={`message ${message.senderId === user.id ? 'message-sent' : 'message-received'}`}
                >
                  {isVoiceMessage(message.content, message.messageType) ? (
                    <VoiceMessage 
                      src={message.content}
                      duration={message.duration}
                      isSent={message.senderId === user.id}
                    />
                  ) : isGifMessage(message.content, message.messageType) ? (
                    <img 
                      src={message.content} 
                      alt="GIF" 
                      style={{ 
                        maxWidth: '200px', 
                        borderRadius: '12px',
                        display: 'block'
                      }} 
                    />
                  ) : isImageMessage(message.content) ? (
                    <PhotoMessage 
                      src={message.content} 
                      isSent={message.senderId === user.id}
                    />
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <div className="message-meta">
                    <span className="message-time">{formatTime(message.createdAt)}</span>
                    {message.senderId === user.id && (
                      <span className="read-receipt">
                        {message.readAt ? (
                          <CheckCheck size={14} style={{ color: '#3b82f6' }} />
                        ) : (
                          <Check size={14} style={{ color: '#64748b' }} />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))
        )}
        
        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">{match?.otherUser?.name} is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="chat-input-wrapper">
        {/* Feature Buttons */}
        <div className="chat-features">
          <button 
            className="feature-btn"
            onClick={() => setShowIcebreakers(!showIcebreakers)}
            title="Icebreaker questions"
          >
            <MessageCircle size={20} />
          </button>
          <button 
            className="feature-btn"
            onClick={() => setShowPhotoShare(true)}
            title="Send photo"
          >
            <Image size={20} />
          </button>
          <button 
            className="feature-btn"
            onClick={() => setShowGifPicker(true)}
            title="Send GIF"
          >
            <Smile size={20} />
          </button>
          <button 
            className="feature-btn"
            onClick={() => setShowVoiceRecorder(true)}
            title="Voice message"
          >
            <Mic size={20} />
          </button>
          <button 
            className="feature-btn"
            onClick={() => setShowDatePlanner(true)}
            title="Plan a date"
          >
            <Calendar size={20} />
          </button>
        </div>

        {/* Icebreakers Panel (inline) */}
        {showIcebreakers && (
          <div className="icebreakers-inline">
            <Icebreakers 
              onSelectQuestion={handleIcebreakerUse}
              compact={true}
            />
          </div>
        )}

        <form onSubmit={sendMessage} className="chat-input-container">
          <input
            type="text"
            className="form-input chat-input"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTypingStart();
            }}
            onBlur={handleTypingStop}
            disabled={sending}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>

    {/* Photo Share Modal */}
    {showPhotoShare && (
      <div className="modal-overlay" onClick={() => setShowPhotoShare(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <PhotoShare 
            onSend={handlePhotoSend}
            onCancel={() => setShowPhotoShare(false)}
          />
        </div>
      </div>
    )}

    {/* Voice Recorder Modal */}
    {showVoiceRecorder && (
      <div className="modal-overlay" onClick={() => setShowVoiceRecorder(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <VoiceRecorder 
            onSend={handleVoiceSend}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        </div>
      </div>
    )}

    {/* GIF Picker Modal */}
    {showGifPicker && (
      <div className="modal-overlay" onClick={() => setShowGifPicker(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <GifPicker 
            onSelect={handleGifSend}
            onCancel={() => setShowGifPicker(false)}
          />
        </div>
      </div>
    )}

    {/* Date Planner Modal */}
    {showDatePlanner && (
      <div className="modal-overlay" onClick={() => setShowDatePlanner(false)}>
        <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setShowDatePlanner(false)}>
            <X size={24} />
          </button>
          <DatePlanner 
            matchId={matchId}
            match={match}
            onPropose={handleDatePropose}
            onClose={() => setShowDatePlanner(false)}
          />
        </div>
      </div>
    )}

    {/* Video Date */}
    {showVideoDate && (
      <VideoDate 
        match={match?.otherUser}
        onClose={() => setShowVideoDate(false)}
        socket={socket}
      />
    )}

    <style jsx>{`
      .chat-input-wrapper {
        background: rgba(30, 41, 59, 0.95);
        border-top: 1px solid rgba(100, 116, 139, 0.2);
      }

      .chat-features {
        display: flex;
        gap: 8px;
        padding: 12px 16px 0;
      }

      .feature-btn {
        background: rgba(100, 116, 139, 0.2);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .feature-btn:hover {
        background: rgba(236, 72, 153, 0.2);
        color: #ec4899;
        transform: scale(1.1);
      }

      .icebreakers-inline {
        padding: 12px 16px;
        max-height: 200px;
        overflow-y: auto;
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

      .modal-content {
        background: #1e293b;
        border-radius: 16px;
        padding: 24px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
      }

      .modal-large {
        max-width: 600px;
      }

      .modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(100, 116, 139, 0.2);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        cursor: pointer;
        z-index: 10;
      }

      .modal-close:hover {
        background: rgba(239, 68, 68, 0.3);
        color: #ef4444;
      }

      .message-meta {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
      }

      .message-time {
        font-size: 11px;
        color: rgba(148, 163, 184, 0.8);
      }

      .read-receipt {
        display: flex;
        align-items: center;
      }

      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        margin-bottom: 8px;
      }

      .typing-dots {
        display: flex;
        gap: 4px;
      }

      .typing-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #64748b;
        animation: typingBounce 1.4s infinite ease-in-out;
      }

      .typing-dots span:nth-child(1) {
        animation-delay: 0s;
      }

      .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typingBounce {
        0%, 80%, 100% {
          transform: scale(0.6);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .typing-text {
        font-size: 13px;
        color: #64748b;
        font-style: italic;
      }

      @media (max-width: 480px) {
        .modal-content {
          padding: 16px;
          border-radius: 12px;
        }
      }
    `}</style>
    </ParticleBackground>
  );
};

export default Chat;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Users, X, ChevronDown } from 'lucide-react';
import { useAuth, useSocket } from '../App';

const EventGroupChat = ({ eventId, eventName, onClose }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    // Join event chat room
    if (socket && eventId) {
      socket.emit('join-event-chat', eventId);
      
      socket.on('event-message', (message) => {
        if (message.event_id === eventId) {
          setMessages(prev => [...prev, message]);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('event-message');
        socket.emit('leave-event-chat', eventId);
      }
    };
  }, [socket, eventId]);

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/event-features/${eventId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowJumpToBottom(!isNearBottom);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/event-features/${eventId}/messages`, {
        content: newMessage.trim()
      });
      
      // Emit to socket for real-time
      if (socket) {
        socket.emit('event-message-sent', {
          eventId,
          message: res.data
        });
      }
      
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

  return (
    <div className="event-chat-container">
      {/* Header */}
      <div className="event-chat-header">
        <div className="header-info">
          <Users size={20} />
          <div>
            <h3>Event Chat</h3>
            <p>{eventName}</p>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      {/* Messages */}
      <div 
        className="event-chat-messages" 
        ref={containerRef}
        onScroll={handleScroll}
      >
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h4>Start the conversation!</h4>
            <p>Be the first to say hi to everyone</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.user_id === user.id;
              const showAvatar = !isOwn && (
                index === 0 || 
                messages[index - 1].user_id !== message.user_id
              );
              
              return (
                <div 
                  key={message.id}
                  className={`event-message ${isOwn ? 'own' : ''}`}
                >
                  {!isOwn && showAvatar && (
                    <img 
                      src={message.users?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                      alt={message.users?.name}
                      className="message-avatar"
                    />
                  )}
                  {!isOwn && !showAvatar && <div className="avatar-spacer" />}
                  <div className="message-content">
                    {!isOwn && showAvatar && (
                      <span className="message-sender">{message.users?.name}</span>
                    )}
                    <div className="message-bubble">
                      <p>{message.content}</p>
                    </div>
                    <span className="message-time">{formatTime(message.created_at)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {showJumpToBottom && (
          <button className="jump-to-bottom" onClick={scrollToBottom}>
            <ChevronDown size={20} />
            New messages
          </button>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="event-chat-input">
        <input
          type="text"
          placeholder="Message the group..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
        />
        <button type="submit" disabled={!newMessage.trim() || sending}>
          <Send size={20} />
        </button>
      </form>

      <style jsx>{`
        .event-chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #1e293b;
          border-radius: 16px;
          overflow: hidden;
        }

        .event-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          color: white;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-info h3 {
          margin: 0;
          font-size: 16px;
        }

        .header-info p {
          margin: 0;
          font-size: 12px;
          opacity: 0.9;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .event-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }

        .loading-state, .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          text-align: center;
        }

        .empty-state h4 {
          color: #f8fafc;
          margin: 16px 0 8px 0;
        }

        .empty-state p {
          margin: 0;
        }

        .event-message {
          display: flex;
          gap: 8px;
          max-width: 80%;
        }

        .event-message.own {
          flex-direction: row-reverse;
          align-self: flex-end;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .avatar-spacer {
          width: 32px;
          flex-shrink: 0;
        }

        .message-content {
          display: flex;
          flex-direction: column;
        }

        .event-message.own .message-content {
          align-items: flex-end;
        }

        .message-sender {
          font-size: 11px;
          color: #94a3b8;
          margin-bottom: 2px;
          margin-left: 4px;
        }

        .message-bubble {
          background: rgba(100, 116, 139, 0.3);
          padding: 10px 14px;
          border-radius: 16px;
          border-top-left-radius: 4px;
        }

        .event-message.own .message-bubble {
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          border-top-left-radius: 16px;
          border-top-right-radius: 4px;
        }

        .message-bubble p {
          margin: 0;
          color: #f8fafc;
          font-size: 14px;
          word-break: break-word;
        }

        .message-time {
          font-size: 10px;
          color: #64748b;
          margin-top: 4px;
          margin-left: 4px;
        }

        .event-message.own .message-time {
          margin-left: 0;
          margin-right: 4px;
        }

        .jump-to-bottom {
          position: sticky;
          bottom: 8px;
          align-self: center;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          border: none;
          border-radius: 20px;
          padding: 8px 16px;
          color: white;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .event-chat-input {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: rgba(15, 23, 42, 0.5);
          border-top: 1px solid rgba(100, 116, 139, 0.2);
        }

        .event-chat-input input {
          flex: 1;
          background: rgba(100, 116, 139, 0.2);
          border: 1px solid rgba(100, 116, 139, 0.3);
          border-radius: 24px;
          padding: 12px 20px;
          color: #f8fafc;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .event-chat-input input:focus {
          border-color: #ec4899;
          background: rgba(100, 116, 139, 0.3);
        }

        .event-chat-input input::placeholder {
          color: #64748b;
        }

        .event-chat-input button {
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
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

        .event-chat-input button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
        }

        .event-chat-input button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .event-message {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default EventGroupChat;

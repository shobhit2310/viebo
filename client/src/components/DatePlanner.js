import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, X, Check, Send, ChevronDown, Sparkles, RefreshCw } from 'lucide-react';

const DatePlanner = ({ matchId, otherUser, onClose, onDateCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    activity: '',
    notes: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [sharedInterests, setSharedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSuggestions();
  }, [matchId]);

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/dates/suggestions/${matchId}`);
      setSuggestions(res.data.suggestions);
      setSharedInterests(res.data.sharedInterests);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectSuggestion = (suggestion) => {
    setFormData({
      ...formData,
      title: suggestion.title,
      activity: suggestion.title,
      notes: suggestion.description
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      setError('Please add a title and date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/dates/propose', {
        matchId,
        ...formData
      });
      onDateCreated?.(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create date proposal');
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="date-planner-overlay">
      <div className="date-planner-modal">
        <div className="date-planner-header">
          <div>
            <h2>Plan a Date</h2>
            <p>with {otherUser?.name}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Activity Suggestions */}
        <div className="suggestions-section">
          <div className="suggestions-header">
            <h3>
              <Sparkles size={18} />
              Suggested Activities
            </h3>
            <button className="refresh-btn" onClick={fetchSuggestions} disabled={loadingSuggestions}>
              <RefreshCw size={16} className={loadingSuggestions ? 'spinning' : ''} />
            </button>
          </div>
          
          {sharedInterests.length > 0 && (
            <p className="shared-interests">
              Based on shared interests: {sharedInterests.join(', ')}
            </p>
          )}

          <div className="suggestions-grid">
            {loadingSuggestions ? (
              <div className="loading-suggestions">Loading suggestions...</div>
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className={`suggestion-card ${formData.activity === suggestion.title ? 'selected' : ''}`}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <span className="suggestion-icon">{suggestion.icon}</span>
                  <div className="suggestion-content">
                    <span className="suggestion-title">{suggestion.title}</span>
                    <span className="suggestion-desc">{suggestion.description}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Date Form */}
        <form onSubmit={handleSubmit} className="date-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>
              <Calendar size={16} />
              What's the plan?
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g., Coffee & Walk in the Park"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Calendar size={16} />
                Date
              </label>
              <input
                type="date"
                name="date"
                min={minDate}
                value={formData.date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>
                <Clock size={16} />
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <MapPin size={16} />
              Location
            </label>
            <input
              type="text"
              name="location"
              placeholder="Where should we meet?"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Add a note</label>
            <textarea
              name="notes"
              placeholder="Any details or ideas..."
              value={formData.notes}
              onChange={handleChange}
              className="form-input"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <div className="spinner-small" />
              ) : (
                <>
                  <Send size={18} />
                  Send Date Proposal
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .date-planner-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .date-planner-modal {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 24px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid rgba(236, 72, 153, 0.2);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }

        .date-planner-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px;
          border-bottom: 1px solid rgba(100, 116, 139, 0.2);
        }

        .date-planner-header h2 {
          font-size: 24px;
          margin: 0 0 4px 0;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .date-planner-header p {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(100, 116, 139, 0.2);
          color: #f8fafc;
        }

        .suggestions-section {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(100, 116, 139, 0.2);
        }

        .suggestions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .suggestions-header h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          color: #f8fafc;
          margin: 0;
        }

        .refresh-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .refresh-btn:hover {
          background: rgba(100, 116, 139, 0.2);
          color: #f8fafc;
        }

        .refresh-btn .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .shared-interests {
          font-size: 12px;
          color: #ec4899;
          margin-bottom: 12px;
        }

        .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .suggestion-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: rgba(30, 41, 59, 0.8);
          border: 2px solid rgba(100, 116, 139, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .suggestion-card:hover {
          border-color: rgba(236, 72, 153, 0.3);
          background: rgba(236, 72, 153, 0.05);
        }

        .suggestion-card.selected {
          border-color: #ec4899;
          background: rgba(236, 72, 153, 0.1);
        }

        .suggestion-icon {
          font-size: 24px;
        }

        .suggestion-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .suggestion-title {
          font-size: 13px;
          font-weight: 600;
          color: #f8fafc;
        }

        .suggestion-desc {
          font-size: 11px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .loading-suggestions {
          grid-column: span 2;
          text-align: center;
          color: #64748b;
          padding: 20px;
        }

        .date-form {
          padding: 24px;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #cbd5e1;
          margin-bottom: 8px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(30, 41, 59, 0.8);
          border: 2px solid rgba(100, 116, 139, 0.3);
          border-radius: 12px;
          color: #f8fafc;
          font-size: 15px;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #ec4899;
        }

        .form-input::placeholder {
          color: #64748b;
        }

        textarea.form-input {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .form-actions .btn {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          color: white;
          border: none;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(236, 72, 153, 0.3);
        }

        .btn-secondary {
          background: transparent;
          color: #94a3b8;
          border: 2px solid rgba(100, 116, 139, 0.3);
        }

        .btn-secondary:hover {
          background: rgba(100, 116, 139, 0.1);
          border-color: #64748b;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @media (max-width: 480px) {
          .date-planner-modal {
            max-height: 95vh;
          }

          .suggestions-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DatePlanner;

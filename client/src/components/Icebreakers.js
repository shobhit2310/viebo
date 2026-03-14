import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, RefreshCw, MessageCircle, Heart, Zap, Send } from 'lucide-react';

const Icebreakers = ({ onSelectQuestion, compact = false }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'fun', label: 'Fun', icon: Zap },
    { id: 'deep', label: 'Deep', icon: Heart },
    { id: 'flirty', label: 'Flirty', icon: MessageCircle }
  ];

  useEffect(() => {
    fetchQuestions();
  }, [category]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/dates/icebreakers?category=${category}`);
      setQuestions(res.data);
    } catch (err) {
      console.error('Failed to fetch icebreakers:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (cat) => {
    const colors = {
      fun: '#ffc300',
      deep: '#8b5cf6',
      flirty: '#ec4899'
    };
    return colors[cat] || '#00f5ff';
  };

  const handleSelect = (question) => {
    setSelectedQuestion(question.id);
    onSelectQuestion?.(question.question);
  };

  if (compact) {
    return (
      <div className="icebreakers-compact">
        <div className="icebreakers-header">
          <span className="header-icon">💡</span>
          <span>Conversation Starters</span>
          <button className="refresh-btn" onClick={fetchQuestions} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          </button>
        </div>
        
        <div className="questions-scroll">
          {questions.map((q) => (
            <button
              key={q.id}
              className={`question-chip ${selectedQuestion === q.id ? 'selected' : ''}`}
              style={{ '--cat-color': getCategoryColor(q.category) }}
              onClick={() => handleSelect(q)}
            >
              {q.question.length > 40 ? q.question.substring(0, 40) + '...' : q.question}
            </button>
          ))}
        </div>

        <style jsx>{`
          .icebreakers-compact {
            background: rgba(30, 41, 59, 0.6);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 12px;
          }

          .icebreakers-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #94a3b8;
            margin-bottom: 10px;
          }

          .header-icon {
            font-size: 16px;
          }

          .refresh-btn {
            margin-left: auto;
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
          }

          .refresh-btn:hover {
            color: #f8fafc;
          }

          .refresh-btn .spinning {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .questions-scroll {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding-bottom: 4px;
            -webkit-overflow-scrolling: touch;
          }

          .questions-scroll::-webkit-scrollbar {
            height: 4px;
          }

          .questions-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .questions-scroll::-webkit-scrollbar-thumb {
            background: rgba(100, 116, 139, 0.3);
            border-radius: 2px;
          }

          .question-chip {
            flex-shrink: 0;
            padding: 8px 14px;
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 20px;
            color: #cbd5e1;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
          }

          .question-chip:hover {
            border-color: var(--cat-color);
            color: var(--cat-color);
          }

          .question-chip.selected {
            background: rgba(236, 72, 153, 0.1);
            border-color: #ec4899;
            color: #ec4899;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="icebreakers-full">
      <div className="icebreakers-header">
        <h3>
          <Sparkles size={20} />
          Icebreaker Questions
        </h3>
        <p>Break the ice with fun questions</p>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              className={`category-tab ${category === cat.id ? 'active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              <Icon size={16} />
              {cat.label}
            </button>
          );
        })}
        <button className="refresh-btn" onClick={fetchQuestions} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {/* Questions List */}
      <div className="questions-list">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className={`question-card ${selectedQuestion === q.id ? 'selected' : ''}`}
              style={{ '--cat-color': getCategoryColor(q.category) }}
            >
              <span className="category-badge">{q.category}</span>
              <p className="question-text">{q.question}</p>
              <button
                className="send-btn"
                onClick={() => handleSelect(q)}
              >
                <Send size={16} />
                Use This
              </button>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .icebreakers-full {
          background: rgba(30, 41, 59, 0.6);
          border-radius: 16px;
          padding: 20px;
        }

        .icebreakers-header {
          margin-bottom: 16px;
        }

        .icebreakers-header h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          color: #f8fafc;
          margin: 0 0 4px 0;
        }

        .icebreakers-header p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .category-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .category-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(30, 41, 59, 0.8);
          border: 2px solid rgba(100, 116, 139, 0.2);
          border-radius: 20px;
          color: #94a3b8;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .category-tab:hover {
          border-color: #64748b;
          color: #f8fafc;
        }

        .category-tab.active {
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2));
          border-color: #ec4899;
          color: #ec4899;
        }

        .refresh-btn {
          margin-left: auto;
          background: rgba(30, 41, 59, 0.8);
          border: 2px solid rgba(100, 116, 139, 0.2);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-btn:hover {
          border-color: #64748b;
          color: #f8fafc;
        }

        .refresh-btn .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .loading {
          display: flex;
          justify-content: center;
          padding: 40px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(236, 72, 153, 0.2);
          border-top-color: #ec4899;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .question-card {
          background: rgba(30, 41, 59, 0.8);
          border: 2px solid rgba(100, 116, 139, 0.2);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s ease;
        }

        .question-card:hover {
          border-color: var(--cat-color);
          transform: translateY(-2px);
        }

        .question-card.selected {
          border-color: #ec4899;
          background: rgba(236, 72, 153, 0.05);
        }

        .category-badge {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(100, 116, 139, 0.2);
          color: var(--cat-color);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .question-text {
          color: #f8fafc;
          font-size: 15px;
          line-height: 1.5;
          margin: 0 0 12px 0;
        }

        .send-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          border: none;
          border-radius: 20px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .send-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(236, 72, 153, 0.3);
        }

        @media (max-width: 480px) {
          .category-tabs {
            gap: 6px;
          }

          .category-tab {
            padding: 6px 12px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default Icebreakers;

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader } from 'lucide-react';

// Using Tenor's free API (no key required for basic usage)
const TENOR_API = 'https://tenor.googleapis.com/v2';
const TENOR_KEY = 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ'; // Public API key

const GifPicker = ({ onSelect, onCancel }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories] = useState([
    'love', 'happy', 'excited', 'laughing', 'flirty', 
    'kiss', 'heart', 'dancing', 'wink', 'cute'
  ]);

  const searchGifs = useCallback(async (query) => {
    setLoading(true);
    try {
      const endpoint = query 
        ? `${TENOR_API}/search?q=${encodeURIComponent(query)}&key=${TENOR_KEY}&limit=24&media_filter=gif`
        : `${TENOR_API}/featured?key=${TENOR_KEY}&limit=24&media_filter=gif`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (data.results) {
        setGifs(data.results.map(gif => ({
          id: gif.id,
          url: gif.media_formats?.gif?.url || gif.media_formats?.tinygif?.url,
          preview: gif.media_formats?.tinygif?.url || gif.media_formats?.nanogif?.url,
          width: gif.media_formats?.gif?.dims?.[0] || 200,
          height: gif.media_formats?.gif?.dims?.[1] || 200
        })));
      }
    } catch (err) {
      console.error('Failed to fetch GIFs:', err);
      // Fallback to GIPHY if Tenor fails
      try {
        const giphyUrl = query
          ? `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${encodeURIComponent(query)}&limit=24`
          : `https://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC&limit=24`;
        
        const res = await fetch(giphyUrl);
        const data = await res.json();
        
        if (data.data) {
          setGifs(data.data.map(gif => ({
            id: gif.id,
            url: gif.images.fixed_height.url,
            preview: gif.images.fixed_height_small.url,
            width: parseInt(gif.images.fixed_height.width),
            height: parseInt(gif.images.fixed_height.height)
          })));
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchGifs('');
  }, [searchGifs]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        searchGifs(searchQuery);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchGifs]);

  const handleCategoryClick = (category) => {
    setSearchQuery(category);
    searchGifs(category);
  };

  return (
    <div className="gif-picker">
      <div className="gif-picker-header">
        <h4>Send a GIF</h4>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <div className="gif-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search GIFs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="gif-categories">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`category-btn ${searchQuery === cat ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="gif-grid">
        {loading ? (
          <div className="loading">
            <Loader size={32} className="spin" />
          </div>
        ) : (
          gifs.map(gif => (
            <div 
              key={gif.id}
              className="gif-item"
              onClick={() => onSelect(gif.url)}
            >
              <img 
                src={gif.preview || gif.url} 
                alt="GIF" 
                loading="lazy"
              />
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .gif-picker {
          background: #1e293b;
          border-radius: 16px;
          overflow: hidden;
          max-height: 500px;
          display: flex;
          flex-direction: column;
        }

        .gif-picker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(100, 116, 139, 0.2);
        }

        .gif-picker-header h4 {
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

        .gif-search {
          padding: 12px 16px;
          position: relative;
        }

        .gif-search .search-icon {
          position: absolute;
          left: 28px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .gif-search input {
          width: 100%;
          background: rgba(100, 116, 139, 0.2);
          border: 1px solid transparent;
          border-radius: 24px;
          padding: 10px 16px 10px 44px;
          color: #f8fafc;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .gif-search input:focus {
          border-color: #ec4899;
        }

        .gif-search input::placeholder {
          color: #64748b;
        }

        .gif-categories {
          display: flex;
          gap: 8px;
          padding: 0 16px 12px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .gif-categories::-webkit-scrollbar {
          display: none;
        }

        .category-btn {
          background: rgba(100, 116, 139, 0.2);
          border: none;
          border-radius: 16px;
          padding: 6px 14px;
          color: #94a3b8;
          font-size: 13px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          text-transform: capitalize;
        }

        .category-btn:hover, .category-btn.active {
          background: rgba(236, 72, 153, 0.2);
          color: #ec4899;
        }

        .gif-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          padding: 0 16px 16px;
          overflow-y: auto;
          flex: 1;
          min-height: 200px;
        }

        .loading {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .spin {
          animation: spin 1s linear infinite;
          color: #ec4899;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .gif-item {
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          background: rgba(100, 116, 139, 0.1);
          transition: transform 0.2s ease;
        }

        .gif-item:hover {
          transform: scale(1.05);
        }

        .gif-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 480px) {
          .gif-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default GifPicker;

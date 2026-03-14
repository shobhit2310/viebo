import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, User, LogOut, Plus, UserPlus } from 'lucide-react';
import { useAuth } from '../App';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/dashboard" className="logo">
          Viebo 💕
        </Link>
        
        <div className="nav-links">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            <Home size={20} />
            <span>Home</span>
          </Link>
          
          <Link to="/create-event" className={`nav-link ${isActive('/create-event') ? 'active' : ''}`}>
            <Plus size={20} />
            <span>Create Event</span>
          </Link>
          
          <Link to="/join-event" className={`nav-link ${isActive('/join-event') ? 'active' : ''}`}>
            <UserPlus size={20} />
            <span>Join Event</span>
          </Link>
          
          <Link to="/matches" className={`nav-link ${isActive('/matches') ? 'active' : ''}`}>
            <Heart size={20} />
            <span>Matches</span>
          </Link>
          
          <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
            <User size={20} />
            <span>Profile</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px' }}>
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="avatar avatar-small"
            />
            <button 
              onClick={logout} 
              className="btn btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_URL } from './config';

// Components
import Navbar from './components/Navbar';
import { NotificationProvider, useNotifications } from './components/NotificationProvider';
import InstallPrompt from './components/InstallPrompt';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import JoinEvent from './pages/JoinEvent';
import EventDetail from './pages/EventDetail';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import CompleteProfile from './pages/CompleteProfile';
import EventDiscover from './pages/EventDiscover';
import VerifyEmail from './pages/VerifyEmail';
import VerifyPending from './pages/VerifyPending';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ResendVerification from './pages/ResendVerification';
import WaveBackground from './components/WaveBackground';

// Context
const AuthContext = createContext(null);
const SocketContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
export const useSocket = () => useContext(SocketContext);

// Socket Notification Handler - listens for socket events and shows notifications
const SocketNotificationHandler = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifyMatch, notifyMessage } = useNotifications();

  useEffect(() => {
    if (!socket || !user) return;

    // Handle new match notification (when not on the event page)
    const handleNewMatch = (data) => {
      if (data.users.includes(user.id)) {
        // Don't show notification if we're already on the event page (celebration modal handles it)
        const currentPath = window.location.pathname;
        if (!currentPath.includes(`/event/${data.eventId}`)) {
          notifyMatch(data.matchedUserName || 'Someone', () => {
            if (data.matchId) {
              navigate(`/chat/${data.matchId}`);
            } else {
              navigate('/matches');
            }
          });
        }
      }
    };

    // Handle new message notification
    const handleNewMessage = (data) => {
      // Don't show notification if we're already in the chat
      const currentPath = window.location.pathname;
      if (!currentPath.includes(`/chat/${data.matchId}`)) {
        notifyMessage(
          data.senderName || 'Someone',
          data.preview || data.content?.substring(0, 50) || 'New message',
          () => navigate(`/chat/${data.matchId}`)
        );
      }
    };

    socket.on('new-match-notification', handleNewMatch);
    socket.on('new-message-notification', handleNewMessage);

    return () => {
      socket.off('new-match-notification', handleNewMatch);
      socket.off('new-message-notification', handleNewMessage);
    };
  }, [socket, user, navigate, notifyMatch, notifyMessage]);

  return null;
};

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user data
      axios.get(`${API_URL}/auth/me`)
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      // Connect to socket
      const newSocket = io('http://localhost:5000');
      newSocket.emit('register', user.id);
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post(`${API_URL}/auth/register`, userData);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    }
    return res.data;
  };

  const googleLogin = async (credential, mode = 'signin') => {
    const res = await axios.post(`${API_URL}/auth/google`, { credential, mode });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    return res.data;
  };

  const completeProfile = async (profileData) => {
    const res = await axios.put(`${API_URL}/auth/complete-profile`, profileData);
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Check if user needs profile completion
  const needsProfileCompletion = user?.needsProfileCompletion;

  return (
    <AuthContext.Provider value={{ user, token, login, register, googleLogin, completeProfile, logout, updateUser }}>
        <SocketContext.Provider value={socket}>
          <NotificationProvider>
            <Router>
              <div className="App" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
                <WaveBackground />
              {user && !needsProfileCompletion && <Navbar />}
              <SocketNotificationHandler />
              <InstallPrompt />
              <ErrorBoundary>
              <Routes>
                <Route path="/" element={!user ? <Landing /> : <Navigate to={needsProfileCompletion ? "/complete-profile" : "/dashboard"} />} />
                <Route path="/login" element={!user ? <Login /> : <Navigate to={needsProfileCompletion ? "/complete-profile" : "/dashboard"} />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to={needsProfileCompletion ? "/complete-profile" : "/dashboard"} />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/verify-pending" element={!user ? <VerifyPending /> : <Navigate to={needsProfileCompletion ? "/complete-profile" : "/dashboard"} />} />
                <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
                <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />
                <Route path="/resend-verification" element={!user ? <ResendVerification /> : <Navigate to="/dashboard" />} />
                <Route path="/complete-profile" element={user && needsProfileCompletion ? <CompleteProfile /> : <Navigate to={user ? "/dashboard" : "/"} />} />
                <Route path="/dashboard" element={user && !needsProfileCompletion ? <Dashboard /> : <Navigate to={user ? "/complete-profile" : "/"} />} />
                <Route path="/create-event" element={user && !needsProfileCompletion ? <CreateEvent /> : <Navigate to="/" />} />
                <Route path="/join-event" element={user && !needsProfileCompletion ? <JoinEvent /> : <Navigate to="/" />} />
                <Route path="/discover" element={user && !needsProfileCompletion ? <EventDiscover /> : <Navigate to="/" />} />
                <Route path="/event/:id" element={user && !needsProfileCompletion ? <EventDetail /> : <Navigate to="/" />} />
                <Route path="/matches" element={user && !needsProfileCompletion ? <Matches /> : <Navigate to="/" />} />
                <Route path="/chat/:matchId" element={user && !needsProfileCompletion ? <Chat /> : <Navigate to="/" />} />
                <Route path="/profile" element={user && !needsProfileCompletion ? <Profile /> : <Navigate to="/" />} />
              </Routes>
              </ErrorBoundary>
            </div>
          </Router>
        </NotificationProvider>
      </SocketContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;

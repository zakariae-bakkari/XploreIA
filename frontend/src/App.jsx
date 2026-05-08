import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from './api'
import { User, LogOut, Folder, Search } from 'lucide-react'
import './App.css'

// Pages
import HomePage from './pages/HomePage'
import SignupPage from './pages/signup-page'
import LoginPage from './pages/login-page'
import ForgotPasswordPage from './pages/forgot-password-page'
import ProfilePage from './components/ProfilePage'
import PlaylistsPage from './components/PlaylistsPage'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authApi.checkStatus();
        if (data.connected) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [location.pathname]);

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <Link to="/" className="logo">
          XploreIA
        </Link>
        <nav className="header-nav">
          <Link to="/" className={location.pathname === '/' ? 'active-link' : ''}>
            <button className={location.pathname === '/' ? 'active' : ''}>Explorer</button>
          </Link>
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <Link to="/playlists" className={`icon-btn ${location.pathname === '/playlists' ? 'active' : ''}`} title="Mes Playlists">
                <Folder size={20} />
              </Link>
              <div 
                className={`profile-bar ${location.pathname === '/profile' ? 'active' : ''}`}
                onClick={() => navigate('/profile')}
              >
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span className="user-name">{user.name}</span>
                <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} title="Logout" className="logout-mini-btn">
                  <LogOut size={14} />
                </button>
              </div>
            </>
          ) : (
            <div className="header-auth-links">
              {!loading && (
                <>
                  <Link to="/login" className="login-link">Login</Link>
                  <Link to="/signup" className="signup-link-btn">Sign Up</Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage user={user} loading={loading} />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="/playlists" element={<PlaylistsPage user={user} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

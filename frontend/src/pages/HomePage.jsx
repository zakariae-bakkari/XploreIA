import { useState, useEffect } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import AiToolsPage from '../components/AiToolsPage'
import { authApi } from '../api'
import { User, LogOut } from 'lucide-react'

function HomePage() {
  const [count, setCount] = useState(0)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
    window.location.reload();
  };

  return (
    <>
      <section id="center">
        <div className="auth-status-indicator">
          {!loading && (
            user ? (
              <div className="user-badge connected">
                <div className="status-dot online"></div>
                <User size={16} />
                <span>{user.name}</span>
                <button onClick={handleLogout} title="Logout" className="logout-mini-btn">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="auth-buttons-top">
                <a href="/login" className="login-btn-sm">Login</a>
                <a href="/signup" className="signup-btn-sm">Sign Up</a>
              </div>
            )
          )}
        </div>
        <AiToolsPage />
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>XploreIA</h1>
          <p>
            The ultimate directory for AI tools.
          </p>
        </div>
        
        {!loading && !user && (
          <div className="hero-auth-buttons">
            <button className="main-login-btn" onClick={() => window.location.href='/login'}>
              Get Started
            </button>
            <button className="main-signup-btn" onClick={() => window.location.href='/signup'}>
              Create Account
            </button>
          </div>
        )}

        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Explore Count: {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join our community</p>
          <ul>
            <li>
              <a href="/login">
                Login
              </a>
            </li>
            <li>
              <a href="/signup">
                Sign Up Now
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default HomePage

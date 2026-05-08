
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Folder, LogOut } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {

   const {user, loading, logout} = useAuth();
   const location = useLocation();
   const navigate = useNavigate();

   const handleLogout = async () => {
      await logout();
   }

   return (
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
   )
}
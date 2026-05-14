import Navbar from '../components/layout/Navbar';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="flex flex-col gap-4">
            <p className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>Main Menu</p>
            <div className="sidebar-nav">
              <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}>
                <span className="material-symbols-outlined">grid_view</span>
                <span>Overview</span>
              </Link>
              <Link to="/discover" className="sidebar-link">
                <span className="material-symbols-outlined">explore</span>
                <span>discover</span>
              </Link>
              <Link to="/favorites" className="sidebar-link">
                <span className="material-symbols-outlined">favorite</span>
                <span>Favorites</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>Account</p>
            <div className="sidebar-nav">
              <Link to="/settings" className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`}>
                <span className="material-symbols-outlined">settings</span>
                <span>Settings</span>
              </Link>
               <Link to="/profile" className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}>
                <span className="material-symbols-outlined">person</span>
                <span>Profile</span>
              </Link>
            </div>
          </div>

        </aside>

        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

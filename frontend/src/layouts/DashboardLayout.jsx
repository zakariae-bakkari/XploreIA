import React from 'react';
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
                <span>Marketplace</span>
              </Link>
              <Link to="/favorites" className="sidebar-link">
                <span className="material-symbols-outlined">favorite</span>
                <span>Favorites</span>
              </Link>
              <Link to="/playground" className="sidebar-link">
                <span className="material-symbols-outlined">terminal</span>
                <span>API Playground</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>Account</p>
            <div className="sidebar-nav">
              <Link to="/settings" className="sidebar-link">
                <span className="material-symbols-outlined">settings</span>
                <span>Settings</span>
              </Link>
              <Link to="/support" className="sidebar-link">
                <span className="material-symbols-outlined">help_center</span>
                <span>Support</span>
              </Link>
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(219, 252, 255, 0.03)', border: '1px solid rgba(219, 252, 255, 0.1)' }}>
              <p className="label-sm" style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 'bold' }}>XploreIA Community</p>
              <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '8px', lineHeight: '1.4' }}>
                Join 10k+ developers sharing their best AI discoveries every day.
              </p>
              <button className="btn-primary" style={{ width: '100%', marginTop: '16px', padding: '8px', fontSize: '12px' }}>Join Discord</button>
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

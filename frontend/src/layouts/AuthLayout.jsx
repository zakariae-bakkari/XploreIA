import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="light-leak-1"></div>
      <div className="light-leak-2"></div>
      
      {/* Simplified Auth Header */}
      <header className="navbar" style={{ background: 'rgba(19, 19, 23, 0.3)', backdropFilter: 'blur(20px)' }}>
        <div className="container nav-content">
          <Link to="/" className="flex items-center gap-base">
            <span className="material-symbols-outlined" style={{ color: 'var(--primary-fixed-dim)', fontSize: '30px' }}>explore</span>
            <span className="h3-md" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>XploreIA</span>
          </Link>
          <div className="flex items-center gap-md">
            <Link to="/docs" className="nav-link" style={{ padding: '8px 16px' }}>Documentation</Link>
            <Link to="/support" className="nav-link" style={{ padding: '8px 16px' }}>Support API</Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </main>

      <footer className="footer" style={{ padding: '2rem 0' }}>
        <div className="container flex justify-between items-center flex-col md-flex-row gap-md">
          <div style={{ textAlign: 'center' }}>
            <span className="h3-md" style={{ color: 'var(--on-surface)', fontWeight: 'bold', fontSize: '18px' }}>XploreIA</span>
            <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none', fontSize: '10px' }}>
              © 2024 XploreIA AI Marketplace.
            </p>
          </div>
          <div className="flex gap-md" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/tos" className="nav-link" style={{ fontSize: '10px' }}>Terms</Link>
            <Link to="/privacy" className="nav-link" style={{ fontSize: '10px' }}>Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;

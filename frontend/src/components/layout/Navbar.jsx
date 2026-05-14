import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return 'X';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <nav className="navbar" style={{ background: 'rgba(19, 19, 23, 0.3)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="container nav-content" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%', maxWidth: '100%', padding: '0 64px' }}>
        
        <div className="flex items-center gap-xl">
          <Link to="/" className="flex items-center gap-base" style={{ textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary-fixed-dim)', fontSize: '30px' }}>explore</span>
            <span className="h3-md" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>XploreIA</span>
          </Link>
          
          <div className="nav-links flex gap-md">
            <Link to="/discover" className={`nav-link ${isActive('/discover') ? 'active' : ''}`} style={{ fontSize: '14px', fontWeight: '500' }}>Discovery</Link>
            {user && (
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} style={{ fontSize: '14px', fontWeight: '500' }}>Dashboard</Link>
            )}
            <Link to="/debug" className={`nav-link ${isActive('/debug') ? 'active' : ''}`} style={{ fontSize: '14px', fontWeight: '500' }}>debug</Link>
          </div>
        </div>

        <div className="flex items-center gap-lg" style={{ flex: 1, justifyContent: 'flex-end' }}>
          
          {/* Search Bar in Navbar */}
          <div className="hidden lg:flex items-center" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '99px', padding: '8px 16px', border: '1px solid rgba(255,255,255,0.1)', width: '300px' }}>
            <input 
              type="text" 
              placeholder="Search marketplace..." 
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '13px', outline: 'none', width: '100%' }}
            />
          </div>

          <div className="flex items-center gap-md">
            {user ? (
              <div className="flex items-center gap-md">
                <Link to="/dashboard" className="btn-primary" style={{ padding: '10px 24px', fontSize: '13px', borderRadius: '99px', textDecoration: 'none' }}>
                  Get Started
                </Link>
                <Link to="/profile" className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none', border: '1px solid rgba(0, 219, 233, 0.2)' }}>
                  {getInitials(user.name)}
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="nav-link" style={{ fontSize: '14px' }}>Login</Link>
                <Link to="/signup" className="btn-primary" style={{ padding: '10px 24px', fontSize: '13px', borderRadius: '99px', textDecoration: 'none' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;

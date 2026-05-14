import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container flex justify-between items-center flex-col md-flex-row gap-gutter">
        <div style={{ textAlign: 'center' }}>
          <span className="h3-md" style={{ color: 'var(--on-surface)', fontWeight: 'bold' }}>XploreIA</span>
          <p className="label-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '4px', textTransform: 'none' }}>
            © 2024 XploreIA AI Marketplace. Precision built for the future.
          </p>
        </div>
        <div className="flex gap-md" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/tos" className="nav-link">Terms of Service</Link>
          <Link to="/privacy" className="nav-link">Privacy Policy</Link>
          <Link to="/docs" className="nav-link">Documentation</Link>
          <Link to="/support" className="nav-link">Support API</Link>
        </div>
        <div className="flex gap-md">
          <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', cursor: 'pointer' }}>terminal</span>
          <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', cursor: 'pointer' }}>code</span>
          <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', cursor: 'pointer' }}>deployed_code</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

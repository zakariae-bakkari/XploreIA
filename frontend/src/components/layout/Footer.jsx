import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container flex justify-between items-center flex-col md-flex-row gap-gutter">
        <div style={{ textAlign: 'center' }}>
          <span className="h3-md" style={{ color: 'var(--on-surface)', fontWeight: 'bold' }}>XploreIA</span>
          <p className="label-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '4px', textTransform: 'none' }}>
            © 2026 Marché d'IA XploreIA. Conçu avec précision pour le futur.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

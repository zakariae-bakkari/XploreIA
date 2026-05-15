import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <span className="label-sm" style={{ color: 'var(--primary-fixed-dim)', letterSpacing: '0.2em' }}>
          MARCHÉ GLOBAL DE L'IA
        </span>
        <h1 className="h1-xl" style={{ marginTop: '24px' }}>
          Débloquez le Monde de <br /> <span className="cyber-gradient-text">l'Intelligence IA</span>
        </h1>
        <p className="body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: '700px', margin: '24px auto' }}>
          XploreIA est la première passerelle technique pour découvrir et explorer des services d'IA de précision. 
          Trouvez les modèles parfaits pour votre flux de travail dans notre répertoire curaté.
        </p>

        <form onSubmit={handleSearch} className="glass-panel search-bar" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span className="material-symbols-outlined" style={{ padding: '0 16px', color: 'var(--on-surface-variant)' }}>search</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Rechercher des outils IA, des modèles ou des catégories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>Rechercher</button>
        </form>

        <div className="flex justify-center gap-md" style={{ marginTop: '32px' }}>
          <Link to="/signup" className="btn-primary" style={{ padding: '12px 32px', textDecoration: 'none' }}>Commencer</Link>
          <Link to="/discover" className="glass-panel" style={{ padding: '12px 32px', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Explorer le Marché</Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

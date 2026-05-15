import React from 'react';
import { Link } from 'react-router-dom';

const BentoGrid = () => {
  return (
    <section className="bento-grid">
      {/* Main Feature - Discovery */}
      <div className="glass-panel bento-item col-8" style={{ minHeight: '400px', padding: 'var(--lg)' }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '400px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '48px' }}>search_insights</span>
          <h3 className="h2-lg" style={{ color: 'white', marginTop: '16px' }}>Découverte d'IA Curatée</h3>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: '12px' }}>
            Accédez à une sélection choisie des modèles d'IA les plus avancés du marché. Filtrez par catégorie, prix et performance.
          </p>
          <Link to="/discover" className="flex items-center gap-xs" style={{ background: 'none', color: 'var(--primary)', marginTop: '24px', fontWeight: '600', textDecoration: 'none' }}>
            Ouvrir le Marché <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
        <div style={{ position: 'absolute', right: '-80px', bottom: '-80px', width: '320px', height: '320px', background: 'rgba(0, 219, 233, 0.1)', filter: 'blur(100px)', borderRadius: '50%' }}></div>
      </div>

      {/* Feature 2 - Suggestions */}
      <div className="glass-panel bento-item col-4" style={{ padding: 'var(--lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '48px' }}>add_box</span>
        <h3 className="h3-md" style={{ color: 'white' }}>Suggérer des Outils</h3>
        <p style={{ color: 'var(--on-surface-variant)' }}>
          Vous avez trouvé un super outil que nous avons manqué ? Suggérez-le à notre communauté et aidez à construire le répertoire.
        </p>
      </div>

      {/* Feature 3 - Categories */}
      <div className="glass-panel bento-item col-4" style={{ padding: 'var(--lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '48px' }}>category</span>
        <h3 className="h3-md" style={{ color: 'white' }}>Catégorisation Profonde</h3>
        <p style={{ color: 'var(--on-surface-variant)' }}>
          Du NLP à l'Art Génératif, trouvez exactement ce dont vous avez besoin avec notre taxonomie précise.
        </p>
      </div>

      {/* Feature 4 - Community */}
      <div className="glass-panel bento-item col-8" style={{ padding: 'var(--lg)' }}>
        <div className="flex items-center justify-between" style={{ height: '100%', gap: '24px' }}>
          <div style={{ maxWidth: '400px' }}>
            <h3 className="h2-lg" style={{ color: 'white' }}>Avis Vérifiés</h3>
            <p style={{ color: 'var(--on-surface-variant)', marginTop: '12px' }}>
              Explorez les outils en toute confiance. Notre communauté fournit des retours réels sur la performance et le rapport qualité-prix.
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <div className="cyber-gradient-bg" style={{ width: '120px', height: '120px', borderRadius: '50%', filter: 'blur(20px)', opacity: 0.3, position: 'absolute', inset: '-8px' }}></div>
            <div className="glass-panel" style={{ width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
               <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'white' }}>verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;

import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section style={{ padding: 'var(--xl) 0', textAlign: 'center' }}>
      <div className="glass-panel" style={{ padding: 'var(--xl)', border: '1px solid rgba(0, 219, 233, 0.2)', borderRadius: '32px' }}>
        <h2 className="h2-lg">Prêt à Trouver Votre Prochaine Solution IA ?</h2>
        <p className="body-lg" style={{ color: 'var(--on-surface-variant)', margin: '16px auto', maxWidth: '600px' }}>
          Rejoignez plus de 10 000 pionniers techniques explorant les frontières de l'intelligence artificielle sur XploreIA.
        </p>
        <div className="flex justify-center gap-md" style={{ marginTop: '24px' }}>
          <Link to="/signup" className="btn-primary" style={{ padding: '12px 32px', textDecoration: 'none' }}>Commencer Maintenant</Link>
          <Link to="/community" className="glass-panel" style={{ padding: '12px 32px', color: 'var(--on-surface)', textDecoration: 'none' }}>Rejoindre la Communauté</Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

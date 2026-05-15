import React from 'react';

const SignupInfo = () => {
  return (
    <div style={{ flex: 1, maxWidth: '600px' }}>
      <h1 className="h1-xl" style={{ fontSize: '64px', lineHeight: '1.1', marginBottom: '24px', fontWeight: 'bold' }}>
        Rejoignez le Futur <br />
        <span style={{ color: 'var(--secondary)' }}>de la Découverte d'IA.</span>
      </h1>
      <p className="body-lg" style={{ color: 'var(--on-surface-variant)', marginBottom: '48px', maxWidth: '500px' }}>
        Connectez-vous à des modèles d'IA de précision et à des innovateurs techniques dans le marché le plus avancé jamais construit.
      </p>
      
      <div className="flex flex-col gap-lg">
        <div className="flex items-center gap-md">
           <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(219, 252, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <span className="material-symbols-outlined">bolt</span>
          </div>
          <p className="body-md" style={{ fontWeight: '500' }}>Flux de déploiement ultra-rapides</p>
        </div>
        <div className="flex items-center gap-md">
           <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(219, 252, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <span className="material-symbols-outlined">security</span>
          </div>
          <p className="body-md" style={{ fontWeight: '500' }}>Chiffrement et confidentialité de niveau entreprise</p>
        </div>
        <div className="flex items-center gap-md">
           <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(219, 252, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <span className="material-symbols-outlined">groups</span>
          </div>
          <p className="body-md" style={{ fontWeight: '500' }}>Communauté collaborative native de l'IA</p>
        </div>
      </div>
    </div>
  );
};

export default SignupInfo;

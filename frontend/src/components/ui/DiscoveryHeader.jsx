import React from 'react';

const DiscoveryHeader = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="flex justify-between items-end" style={{ marginBottom: '40px' }}>
      <div>
        <h1 className="h2-lg">Explorer les Modèles IA</h1>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>
          Découvrez la prochaine génération d'intelligence de précision.
        </p>
      </div>
      <div className="glass-panel" style={{ 
        padding: '8px 24px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        width: '400px', 
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.03)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '24px' }}>search</span>
        <input 
          type="text" 
          placeholder="Rechercher des modèles..." 
          className="body-md"
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'white', 
            width: '100%', 
            padding: '12px 0', 
            outline: 'none',
            fontSize: '16px'
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export default DiscoveryHeader;

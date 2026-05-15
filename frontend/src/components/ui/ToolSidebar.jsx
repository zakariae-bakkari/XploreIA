import React from 'react';

const ToolSidebar = ({ tool }) => {
  return (
    <aside>
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', marginBottom: '24px' }}>
        <h4 className="label-sm" style={{ color: 'var(--outline)', marginBottom: '16px' }}>DÉVELOPPEUR</h4>
        <div className="flex items-center gap-md">
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">api</span>
          </div>
          <div>
            <p style={{ fontWeight: 'bold' }}>{tool.provider_name || 'Xplore Labs'}</p>
            <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Fournisseur Vérifié</p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
        <h4 className="label-sm" style={{ color: 'var(--outline)', marginBottom: '16px' }}>STATISTIQUES</h4>
        <div className="flex flex-col gap-md">
          <div className="flex justify-between">
            <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Évaluation</span>
            <span style={{ fontWeight: 'bold' }}>{tool.global_rating || 'N/A'}/5</span>
          </div>
          <div className="flex justify-between">
            <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Sortie</span>
            <span style={{ fontWeight: 'bold' }}>{tool.release_date || 'Inconnue'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ToolSidebar;

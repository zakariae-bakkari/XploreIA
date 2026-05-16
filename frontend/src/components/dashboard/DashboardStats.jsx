
export const DashboardStats = ({ allToolsCount, playlistCount, suggestionCount }) => (
  <section className="stats-grid">
    <div className="glass-panel stats-card">
      <div className="flex justify-between">
        <div style={{ padding: '12px', background: 'rgba(0, 219, 233, 0.1)', color: 'var(--primary)', borderRadius: '12px' }}>
          <span className="material-symbols-outlined">explore</span>
        </div>
      </div>
      <div>
         <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none' }}>Outils du Marché</p>
         <h2 className="h2-lg" style={{ marginTop: '8px' }}>{allToolsCount} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--outline)' }}>actifs</span></h2>
      </div>
    </div>

    <div className="glass-panel stats-card">
      <div className="flex justify-between">
        <div style={{ padding: '12px', background: 'rgba(235, 178, 255, 0.1)', color: 'var(--secondary)', borderRadius: '12px' }}>
          <span className="material-symbols-outlined">auto_awesome_motion</span>
        </div>
      </div>
      <div>
         <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none' }}>Vos Collections</p>
         <h2 className="h2-lg" style={{ marginTop: '8px' }}>{playlistCount} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--outline)' }}>sauvegardées</span></h2>
      </div>
    </div>

    <div className="glass-panel stats-card">
      <div className="flex justify-between">
        <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--on-surface)', borderRadius: '12px' }}>
          <span className="material-symbols-outlined">history_edu</span>
        </div>
      </div>
      <div>
         <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none' }}>Suggestions</p>
         <h2 className="h2-lg" style={{ marginTop: '8px' }}>{suggestionCount} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--outline)' }}>en attente</span></h2>
      </div>
    </div>
  </section>
);

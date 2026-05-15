import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPlaylists = ({ playlists }) => (
  <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px', marginTop: '24px' }}>
    <h3 className="h3-md" style={{ marginBottom: '24px' }}>Mes Playlists</h3>
    <div className="flex flex-col gap-md">
      {playlists?.length > 0 ? (
        playlists.map(pl => (
          <div key={pl.id} className="flex items-center gap-md" style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 219, 233, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined">playlist_add_check</span>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '15px' }}>{pl.name}</h4>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                {pl.item_count || 0} éléments • {pl.is_public ? 'Public' : 'Privé'}
              </p>
            </div>
            <Link to="/playlists" className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
              Ouvrir
            </Link>
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--on-surface-variant)' }}>
          <p>Vous n'avez pas encore créé de playlist.</p>
          <Link to="/playlists" style={{ color: 'var(--primary)', fontSize: '14px', marginTop: '8px', display: 'inline-block' }}>Créer votre première collection</Link>
        </div>
      )}
    </div>
  </div>
);

export default DashboardPlaylists;

import React from 'react';
import { Link } from 'react-router-dom';

const PlaylistCard = ({ pl, handleOpenEdit, handleDelete }) => {
  return (
    <div className="glass-panel pl-card-premium" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="flex justify-between items-start" style={{ marginBottom: '20px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(0, 219, 233, 0.1) 0%, rgba(235, 178, 255, 0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>folder_special</span>
        </div>
        <div className="flex gap-xs">
          <button className="icon-btn-subtle" title="Edit" onClick={() => handleOpenEdit(pl)}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
          </button>
          <button className="icon-btn-subtle" title="Delete" onClick={() => handleDelete(pl.id)} style={{ color: 'var(--error)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
          </button>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h3 className="h3-sm" style={{ marginBottom: '8px' }}>{pl.name}</h3>
        <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {pl.description || "Aucune description fournie pour cette collection."}
        </p>

        <div className="flex items-center gap-sm" style={{ marginBottom: '24px' }}>
          <span className="label-sm" style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '99px', color: 'var(--outline)' }}>
            {pl.item_count || 0} Outils
          </span>
          <span className="label-sm" style={{ color: pl.is_public ? 'var(--primary)' : 'var(--outline)' }}>
            {pl.is_public ? 'Public' : 'Privé'}
          </span>
        </div>
      </div>

      <Link to={`/playlists/${pl.id}`} className="btn-secondary" style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}>
        Voir la Collection
      </Link>
    </div>
  );
};

export default PlaylistCard;

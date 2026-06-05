import React from 'react';

const ProviderList = ({ providers = [], loading = false, onEdit, onDelete }) => {
  return (
    <div className="glass-card" style={{ overflow: 'auto' }}>
      <table className="model-list" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Pays</th>
            <th>Description</th>
            <th>CEO</th>
            <th>Date fondation</th>
            <th>Site</th>
            <th>Logo</th>
            <th>Statut</th>
            <th style={{ width: 160 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={9}>Chargement...</td></tr>
          )}
          {!loading && providers.length === 0 && (
            <tr><td colSpan={9}>Aucun provider</td></tr>
          )}
          {!loading && providers.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.country}</td>
              <td style={{ maxWidth: 700, whiteSpace: 'normal', overflowWrap: 'break-word', paddingRight: 12 }}>{p.description}</td>
              <td>{p.ceo}</td>
              <td>{p.date_founded}</td>
              <td>{p.website_url ? (<a href={p.website_url} target="_blank" rel="noreferrer">site</a>) : ''}</td>
              <td style={{ maxWidth: 220 }}>
                {p.logo_url ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img
                      src={p.logo_url}
                      alt={p.name}
                      style={{ height: 40, width: 'auto', borderRadius: 6 }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div style={{ fontSize: 12, whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                      <a href={p.logo_url} target="_blank" rel="noreferrer" style={{ color: '#9ad4ff', wordBreak: 'break-all' }} title={p.logo_url}>{p.logo_url}</a>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#888' }}>—</div>
                )}
              </td>
              <td>{p.status}</td>
              <td>
                <div className="actions">
                  <button className="outline-btn" onClick={() => onEdit && onEdit(p)}>Éditer</button>
                  <button className="danger-btn" onClick={() => onDelete && onDelete(p.id)}>Supprimer</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProviderList;

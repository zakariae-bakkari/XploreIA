import React from 'react';

const ProviderList = ({ providers = [], loading = false, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { bg: 'rgba(69, 207, 123, 0.1)', text: '#45cf7b', border: 'rgba(69, 207, 123, 0.15)' };
      case 'pending':
        return { bg: 'rgba(255, 173, 51, 0.1)', text: '#ffad33', border: 'rgba(255, 173, 51, 0.15)' };
      case 'rejected':
      case 'inactive':
        return { bg: 'rgba(255, 74, 118, 0.1)', text: '#ff4a76', border: 'rgba(255, 74, 118, 0.15)' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.05)', text: 'var(--outline)', border: 'rgba(255, 255, 255, 0.08)' };
    }
  };

  return (
    <div className="provider-list-container">
      <style>{`
        .provider-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .provider-table th {
          padding: 16px 20px;
          color: var(--outline);
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .provider-table td {
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          font-size: 14px;
          color: var(--on-background);
          vertical-align: middle;
        }
        .provider-table tbody tr {
          transition: background-color 0.2s ease;
        }
        .provider-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .provider-logo-container {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .provider-logo-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .provider-status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .provider-actions-cell {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .provider-action-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--outline);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .provider-action-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: var(--on-background);
        }
        .provider-action-btn.edit-btn:hover {
          background: rgba(0, 219, 233, 0.15);
          color: var(--primary);
          border-color: rgba(0, 219, 233, 0.2);
        }
        .provider-action-btn.delete-btn:hover {
          background: rgba(255, 74, 118, 0.15);
          color: #ff4a76;
          border-color: rgba(255, 74, 118, 0.2);
        }
        .provider-website-link {
          color: var(--primary);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          transition: opacity 0.2s;
        }
        .provider-website-link:hover {
          text-decoration: underline;
          opacity: 0.8;
        }
        .provider-description-text {
          max-width: 320px;
          white-space: normal;
          overflow-wrap: break-word;
          color: var(--on-surface-variant);
          font-size: 13px;
          line-height: 1.5;
        }
      `}</style>

      <div style={{ overflowX: 'auto' }}>
        <table className="provider-table">
          <thead>
            <tr>
              <th>Nom / Logo</th>
              <th>Pays</th>
              <th>CEO</th>
              <th>Description</th>
              <th>Date fondation</th>
              <th>Site web</th>
              <th>Statut</th>
              <th style={{ width: 110, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--outline)' }}>
                  <div className="loader" style={{ margin: '0 auto 12px auto' }} />
                  Chargement des fournisseurs...
                </td>
              </tr>
            )}
            {!loading && providers.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--outline)' }}>
                  Aucun fournisseur d'IA enregistré.
                </td>
              </tr>
            )}
            {!loading && providers.map(p => {
              const badge = getStatusColor(p.status);
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="provider-logo-container">
                        {p.logo_url ? (
                          <img
                            src={p.logo_url}
                            alt={p.name}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--outline)' }}>
                            corporate_fare
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                    </div>
                  </td>
                  <td>{p.country || <span style={{ color: 'var(--outline)' }}>—</span>}</td>
                  <td>{p.ceo || <span style={{ color: 'var(--outline)' }}>—</span>}</td>
                  <td>
                    <p className="provider-description-text">
                      {p.description || <span style={{ color: 'var(--outline)' }}>Aucune description.</span>}
                    </p>
                  </td>
                  <td>{p.date_founded || <span style={{ color: 'var(--outline)' }}>—</span>}</td>
                  <td>
                    {p.website_url ? (
                      <a href={p.website_url} target="_blank" rel="noreferrer" className="provider-website-link">
                        Visiter
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
                      </a>
                    ) : (
                      <span style={{ color: 'var(--outline)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span
                      className="provider-status-badge"
                      style={{
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div className="provider-actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="provider-action-btn edit-btn"
                        title="Modifier"
                        onClick={() => onEdit && onEdit(p)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                      </button>
                      <button
                        className="provider-action-btn delete-btn"
                        title="Supprimer"
                        onClick={() => onDelete && onDelete(p.id)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProviderList;


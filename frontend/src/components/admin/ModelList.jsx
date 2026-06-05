import React from 'react';

const ModelList = ({ loading, models = [], onEdit, onDelete }) => {
  return (
    <div className="model-list-container">
      <style>{`
        .model-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .model-table th {
          padding: 16px 20px;
          color: var(--outline);
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .model-table td {
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          font-size: 14px;
          color: var(--on-background);
          vertical-align: middle;
        }
        .model-table tbody tr {
          transition: background-color 0.2s ease;
        }
        .model-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .model-tag-chip {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 8px;
          background: rgba(235, 178, 255, 0.08);
          color: #ebb2ff;
          font-size: 12px;
          font-weight: 600;
          margin-right: 6px;
          margin-bottom: 6px;
          border: 1px solid rgba(235, 178, 255, 0.12);
        }
        .model-perf-badge {
          display: inline-flex;
          flex-direction: column;
          gap: 2px;
        }
        .model-perf-value {
          font-weight: 700;
          color: var(--primary);
        }
        .model-perf-speed {
          font-size: 12px;
          color: var(--outline);
        }
        .model-action-btn {
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
        .model-action-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: var(--on-background);
        }
        .model-action-btn.edit-btn:hover {
          background: rgba(0, 219, 233, 0.15);
          color: var(--primary);
          border-color: rgba(0, 219, 233, 0.2);
        }
        .model-action-btn.delete-btn:hover {
          background: rgba(255, 74, 118, 0.15);
          color: #ff4a76;
          border-color: rgba(255, 74, 118, 0.2);
        }
        .model-desc-text {
          max-width: 300px;
          white-space: normal;
          overflow-wrap: break-word;
          color: var(--on-surface-variant);
          font-size: 13px;
          line-height: 1.5;
        }
      `}</style>

      <div style={{ overflowX: 'auto' }}>
        <table className="model-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Outil Associé</th>
              <th>Tags</th>
              <th>Performance</th>
              <th style={{ width: 110, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--outline)' }}>
                  <div className="loader" style={{ margin: '0 auto 12px auto' }} />
                  Chargement des modèles...
                </td>
              </tr>
            )}
            {!loading && models.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--outline)' }}>
                  Aucun modèle correspondant trouvé.
                </td>
              </tr>
            )}
            {!loading && models.map((m) => (
              <tr key={m.id}>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td>
                  <p className="model-desc-text">
                    {m.description || <span style={{ color: 'var(--outline)' }}>Aucune description.</span>}
                  </p>
                </td>
                <td>
                  {m.tool_name || (
                    <span style={{ fontStyle: 'italic', color: 'var(--outline)' }}>
                      ID: {m.tool_id || 'Non associé'}
                    </span>
                  )}
                </td>
                <td>
                  {m.tags ? (
                    m.tags.split(',').map((tag, i) => (
                      <span key={i} className="model-tag-chip">
                        {tag.trim()}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--outline)' }}>—</span>
                  )}
                </td>
                <td>
                  {m.response_quality ? (
                    <div className="model-perf-badge">
                      <span className="model-perf-value">Score: {m.response_quality} / 100</span>
                      {m.speed && <span className="model-perf-speed">Temps: {m.speed} ms</span>}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--outline)' }}>Non évalué</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      className="model-action-btn edit-btn"
                      title="Modifier"
                      onClick={(e) => { e.stopPropagation(); onEdit(m); }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                    </button>
                    <button
                      className="model-action-btn delete-btn"
                      title="Supprimer"
                      onClick={(e) => { e.stopPropagation(); onDelete(m.id); }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModelList;


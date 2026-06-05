import React from 'react';

const ModelList = ({ loading, models = [], onEdit, onDelete }) => {
  if (loading) return <div>Chargement...</div>;

  if (!models.length) return <div>Aucun modèle trouvé.</div>;

  return (
    <table className="model-list glass-card" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Description</th>
          <th>Tags</th>
          <th>Tool</th>
          <th>Performance</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {models.map((m) => (
          <tr key={m.id}>
            <td>{m.name}</td>
            <td>{m.description}</td>
            <td>{m.tags}</td>
            <td>{m.tool_name || m.tool_id || ''}</td>
            <td>{m.response_quality ? `${m.response_quality} / ${m.speed || '-'} ms` : '-'}</td>
            <td>
              <div className="actions">
                <button className="outline-btn" onClick={(e) => { e.stopPropagation(); onEdit(m); }}>Éditer</button>
                <button className="danger-btn" onClick={(e) => { e.stopPropagation(); onDelete(m.id); }}>Supprimer</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ModelList;

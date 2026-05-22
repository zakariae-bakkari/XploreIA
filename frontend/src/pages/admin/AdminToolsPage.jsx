import { useEffect, useMemo, useState } from 'react';
import { aiToolApi } from '../../api';

const AdminToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await aiToolApi.getAll();
        if (response.status === 'success') {
          setTools(response.data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredTools = useMemo(
    () => tools.filter((tool) => `${tool.name} ${tool.description} ${tool.category_name || ''}`.toLowerCase().includes(search.toLowerCase())),
    [tools, search],
  );

  if (loading) {
    return <div className="admin-loading"><div className="loader" /><p>Chargement des outils...</p></div>;
  }

  return (
    <div className="admin-page">
      <section className="admin-page-head">
        <div>
          <p className="label-sm" style={{ color: 'var(--outline)' }}>Gestion AI tools</p>
          <h1 className="h2-lg" style={{ marginTop: '8px' }}>Catalogue des outils</h1>
        </div>
        <label className="admin-search glass-panel">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un outil"
          />
        </label>
      </section>

      <section className="glass-panel admin-panel">
        <div className="admin-section-head">
          <div>
            <p className="label-sm" style={{ color: 'var(--outline)' }}>Outils publiés</p>
            <h2 className="h3-md" style={{ marginTop: '8px' }}>{filteredTools.length} résultats</h2>
          </div>
          <span className="admin-pill">Lecture seule</span>
        </div>

        <div className="admin-tool-grid">
          {filteredTools.map((tool) => (
            <article key={tool.id} className="admin-tool-card">
              <div className="admin-tool-header">
                <div className="admin-tool-logo">
                  {tool.logo_url ? <img src={tool.logo_url} alt={tool.name} /> : <span className="material-symbols-outlined">smart_toy</span>}
                </div>
                <div>
                  <h3>{tool.name}</h3>
                  <p>{tool.provider_name || 'Provider inconnu'}</p>
                </div>
              </div>

              <p className="admin-tool-description">{tool.description}</p>

              <div className="admin-tool-meta">
                <span className="admin-pill">{tool.category_name || 'No category'}</span>
                <span className="admin-pill">{tool.pricing_model || 'N/A'}</span>
                <span className="admin-score">{tool.global_rating || '0.0'} / 5</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminToolsPage;
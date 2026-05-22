import { useEffect, useMemo, useState } from 'react';
import { aiToolApi } from '../../api';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [characteristics, setCharacteristics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await aiToolApi.getFilters();
        if (response.status === 'success') {
          setCategories(response.data?.categories || []);
          setCharacteristics(response.data?.characteristics || []);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search],
  );

  const groupedCharacteristics = useMemo(() => {
    return characteristics.reduce((groups, item) => {
      const type = item.type || 'general';
      groups[type] = groups[type] || [];
      groups[type].push(item);
      return groups;
    }, {});
  }, [characteristics]);

  if (loading) {
    return <div className="admin-loading"><div className="loader" /><p>Chargement des catégories...</p></div>;
  }

  return (
    <div className="admin-page">
      <section className="admin-page-head">
        <div>
          <p className="label-sm" style={{ color: 'var(--outline)' }}>Gestion catalogue</p>
          <h1 className="h2-lg" style={{ marginTop: '8px' }}>Catégories et caractéristiques</h1>
        </div>
        <label className="admin-search glass-panel">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer les catégories"
          />
        </label>
      </section>

      <div className="admin-grid-two">
        <section className="glass-panel admin-panel">
          <div className="admin-section-head">
            <div>
              <p className="label-sm" style={{ color: 'var(--outline)' }}>Catégories</p>
              <h2 className="h3-md" style={{ marginTop: '8px' }}>{filteredCategories.length} éléments</h2>
            </div>
          </div>

          <div className="admin-table-grid">
            {filteredCategories.map((category) => (
              <div key={category.id} className="admin-table-row">
                <div>
                  <strong>{category.name}</strong>
                  <p>ID {category.id}</p>
                </div>
                <span className="admin-pill">Active</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel admin-panel">
          <div className="admin-section-head">
            <div>
              <p className="label-sm" style={{ color: 'var(--outline)' }}>Caractéristiques</p>
              <h2 className="h3-md" style={{ marginTop: '8px' }}>Répartition par type</h2>
            </div>
          </div>

          <div className="admin-type-stack">
            {Object.entries(groupedCharacteristics).map(([type, items]) => (
              <div key={type} className="admin-type-card">
                <div className="admin-type-head">
                  <strong>{type}</strong>
                  <span>{items.length}</span>
                </div>
                <div className="admin-chip-grid">
                  {items.map((item) => (
                    <div key={`${type}-${item.name}`} className="admin-chip">
                      <strong>{item.name}</strong>
                      <span>{item.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
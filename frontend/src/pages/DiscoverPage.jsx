import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { aiToolApi } from '../api';
import { Link } from 'react-router-dom';

const DiscoverPage = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await aiToolApi.getAll();
        if (response && Array.isArray(response)) {
          setTools(response);
        } else if (response && response.data) {
          setTools(response.data);
        } else {
          setTools([]);
        }
      } catch (err) {
        setError("Failed to fetch AI tools. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const categories = ['All', 'Image Generation', 'Code Helper', 'Text Analysis', 'Audio & Voice'];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="container discovery-layout">
        <aside className="sidebar">
          <div className="glass-panel" style={{ padding: 'var(--md)' }}>
            <h3 className="h3-md" style={{ marginBottom: '24px' }}>Categories</h3>
            <div className="flex flex-col gap-sm">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex items-center justify-between" 
                  style={{ 
                    padding: '12px', 
                    background: selectedCategory === cat ? 'rgba(0, 219, 233, 0.1)' : 'transparent', 
                    color: selectedCategory === cat ? 'var(--primary)' : 'var(--on-surface-variant)', 
                    borderRadius: '8px',
                    width: '100%',
                    border: 'none',
                    textAlign: 'left'
                  }}
                >
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined">
                      {cat === 'All' ? 'grid_view' : cat === 'Image Generation' ? 'image' : cat === 'Code Helper' ? 'code' : 'article'}
                    </span>
                    <span className="label-sm" style={{ textTransform: 'none' }}>{cat}</span>
                  </div>
                </button>
              ))}
            </div>

            <h3 className="h3-md" style={{ margin: '32px 0 24px' }}>Pricing</h3>
            <div className="flex flex-col gap-sm">
              <label className="flex items-center gap-sm" style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                <span>Free Access</span>
              </label>
              <label className="flex items-center gap-sm" style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                <span>Premium Only</span>
              </label>
            </div>
          </div>
        </aside>

        <main style={{ flex: 1 }}>
          <div className="flex justify-between items-end" style={{ marginBottom: '40px' }}>
            <div>
              <h1 className="h2-lg">Explore AI Models</h1>
              <p style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>
                Discover the next generation of precision-engineered intelligence.
              </p>
            </div>
            <div className="glass-panel" style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '8px', width: '300px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--outline)' }}>search</span>
              <input 
                type="text" 
                placeholder="Search models..." 
                className="body-md"
                style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', padding: '8px 0', outline: 'none' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px', color: 'var(--primary)' }}>
              <div className="animate-pulse">Loading AI Tools...</div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '100px', color: 'var(--error)' }}>
              {error}
            </div>
          ) : (
            <div className="tool-grid">
              {filteredTools.length > 0 ? (
                filteredTools.map(tool => (
                  <div key={tool.id} className="glass-panel tool-card">
                    <div style={{ position: 'relative' }}>
                      <img src={tool.image_url || tool.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"} alt={tool.name} className="tool-image" />
                      {tool.is_pro && (
                        <span className="label-sm" style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--primary-container)', color: 'var(--on-primary)', padding: '4px 12px', borderRadius: '99px' }}>
                          PRO
                        </span>
                      )}
                    </div>
                    <div style={{ padding: 'var(--md)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div className="flex items-center gap-sm" style={{ marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0, 219, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                          <span className="material-symbols-outlined">auto_awesome</span>
                        </div>
                        <h3 className="h3-md" style={{ margin: 0 }}>{tool.name}</h3>
                      </div>
                      <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginBottom: '16px', flex: 1 }}>{tool.description}</p>
                      <div className="flex gap-xs" style={{ marginBottom: '24px' }}>
                        {tool.tags && Array.isArray(tool.tags) ? tool.tags.map(tag => (
                          <span key={tag} className="tool-tag">{tag}</span>
                        )) : (
                          <span className="tool-tag">{tool.category || 'General'}</span>
                        )}
                      </div>
                      <Link to={`/tool/${tool.id}`} className="btn-primary" style={{ width: '100%', background: 'transparent', border: '1px solid var(--secondary)', color: 'var(--secondary)', textDecoration: 'none', textAlign: 'center' }}>
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', color: 'var(--on-surface-variant)' }}>
                  No tools found matching your search.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  );
};

export default DiscoverPage;

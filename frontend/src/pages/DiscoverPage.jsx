import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { aiToolApi } from '../api';
import { Link } from 'react-router-dom';

const DiscoverPage = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [pricingFilters, setPricingFilters] = useState({
    free: false,
    freemium: false,
    premium: false
  });

  const slugify = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  };

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await aiToolApi.getAll();
        const toolsData = Array.isArray(response) ? response : response.data;
        if (toolsData) {
          setTools(toolsData);
          // Store mapping for frontend-only slug routing
          const slugMap = {};
          toolsData.forEach(t => {
            slugMap[slugify(t.name)] = t.id;
          });
          localStorage.setItem('xplore_slug_map', JSON.stringify(slugMap));
        }
      } catch (err) {
        setError("Échec de la récupération des outils IA. Veuillez réessayer plus tard.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Dynamic categories from data
  const categories = ['Tout', ...new Set(tools.map(tool => tool.category_name || tool.category).filter(Boolean))];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category match (check both category ID or name if needed, but usually category_name is safer for labels)
    const matchesCategory = selectedCategory === 'Tout' || 
                           tool.category_name === selectedCategory || 
                           tool.category === selectedCategory;

    // Pricing match
    const noPricingSelected = !pricingFilters.free && !pricingFilters.freemium && !pricingFilters.premium;
    const matchesPricing = noPricingSelected || 
                          (pricingFilters.free && tool.pricing_model?.toLowerCase() === 'free') ||
                          (pricingFilters.freemium && tool.pricing_model?.toLowerCase() === 'freemium') ||
                          (pricingFilters.premium && tool.pricing_model?.toLowerCase() === 'premium');

    return matchesSearch && matchesCategory && matchesPricing;
  });

  const handlePricingChange = (type) => {
    setPricingFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <MainLayout>
      <div className="container discovery-layout">
        <aside className="sidebar">
          <div className="glass-panel" style={{ padding: 'var(--md)' }}>
            <h3 className="h3-md" style={{ marginBottom: '24px' }}>Catégories</h3>
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
                      {cat === 'Tout' ? 'grid_view' : 
                       cat.includes('Image') ? 'image' : 
                       cat.includes('Code') ? 'code' : 
                       cat.includes('Texte') || cat.includes('Text') ? 'article' : 
                       cat.includes('Audio') || cat.includes('Voix') ? 'mic' : 'category'}
                    </span>
                    <span className="label-sm" style={{ textTransform: 'none' }}>{cat}</span>
                  </div>
                </button>
              ))}
            </div>

            <h3 className="h3-md" style={{ margin: '32px 0 24px' }}>Prix</h3>
            <div className="flex flex-col gap-sm">
              <label className="flex items-center gap-sm" style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                <input 
                  type="checkbox" 
                  style={{ accentColor: 'var(--primary)' }} 
                  checked={pricingFilters.free}
                  onChange={() => handlePricingChange('free')}
                />
                <span>Gratuit</span>
              </label>
              <label className="flex items-center gap-sm" style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                <input 
                  type="checkbox" 
                  style={{ accentColor: 'var(--primary)' }} 
                  checked={pricingFilters.freemium}
                  onChange={() => handlePricingChange('freemium')}
                />
                <span>Freemium</span>
              </label>
              <label className="flex items-center gap-sm" style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                <input 
                  type="checkbox" 
                  style={{ accentColor: 'var(--primary)' }} 
                  checked={pricingFilters.premium}
                  onChange={() => handlePricingChange('premium')}
                />
                <span>Premium</span>
              </label>
            </div>
          </div>
        </aside>

        <main style={{ flex: 1 }}>
          <div className="flex justify-between items-end" style={{ marginBottom: '40px' }}>
            <div>
              <h1 className="h2-lg">Explorer les Modèles IA</h1>
              <p style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>
                Découvrez la prochaine génération d'intelligence de précision.
              </p>
            </div>
            <div className="glass-panel" style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '8px', width: '300px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--outline)' }}>search</span>
              <input 
                type="text" 
                placeholder="Rechercher des modèles..." 
                className="body-md"
                style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', padding: '8px 0', outline: 'none' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px', color: 'var(--primary)' }}>
              <div className="animate-pulse">Chargement des outils IA...</div>
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
                    <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
                      <img 
                        src={tool.image_url || tool.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"} 
                        alt={tool.name} 
                        className="tool-image" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800";
                        }}
                      />
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
                      <div className="flex flex-wrap gap-xs" style={{ marginBottom: '24px' }}>
                        <span className="tool-tag" style={{ background: 'rgba(0, 219, 233, 0.15)', color: 'var(--primary)' }}>
                          {tool.category_name || 'Général'}
                        </span>
                        {tool.models && tool.models.length > 0 && (
                          <span className="tool-tag" style={{ background: 'rgba(235, 178, 255, 0.1)', color: 'var(--secondary)', fontSize: '11px' }}>
                            {tool.models.slice(0, 2).map(m => m.name).join(' • ')}
                          </span>
                        )}
                      </div>
                      <Link to={`/tool/${slugify(tool.name)}`} className="btn-primary" style={{ width: '100%', background: 'transparent', border: '1px solid var(--secondary)', color: 'var(--secondary)', textDecoration: 'none', textAlign: 'center' }}>
                        Voir les Détails
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', color: 'var(--on-surface-variant)' }}>
                  Aucun outil trouvé correspondant à votre recherche.
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

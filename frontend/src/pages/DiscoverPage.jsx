import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { aiToolApi } from '../api';
import { useLocation } from 'react-router-dom';

// Modular Components
import FilterSidebar from '../components/ui/FilterSidebar';
import DiscoveryHeader from '../components/ui/DiscoveryHeader';
import ToolCard from '../components/ui/ToolCard';
import { slugify } from '../lib/utils';

const DiscoverPage = () => {
  const location = useLocation();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get initial search query from URL params
  const getQueryParam = () => new URLSearchParams(location.search).get('q') || '';
  const [searchQuery, setSearchQuery] = useState(getQueryParam());
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [pricingFilters, setPricingFilters] = useState({
    free: false,
    freemium: false,
    premium: false
  });

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await aiToolApi.getAll();
        
        if (response.status === 'error') {
          setError(response.message || "Échec de la récupération des outils IA.");
          return;
        }

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
        setError("Erreur de connexion au serveur.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Update searchQuery when URL param changes
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [location.search]);

  // Dynamic categories from data
  const categories = ['Tout', ...new Set(tools.map(tool => tool.category_name || tool.category).filter(Boolean))];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
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
        <FilterSidebar 
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          pricingFilters={pricingFilters}
          handlePricingChange={handlePricingChange}
        />

        <main style={{ flex: 1 }}>
          <DiscoveryHeader 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

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
                  <ToolCard key={tool.id} tool={tool} />
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

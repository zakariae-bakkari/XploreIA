import { useState, useEffect } from 'react';
import './AiToolsPage.css';

const AiToolsPage = () => {
    const [tools, setTools] = useState([]);
    const [filters, setFilters] = useState({ categories: [], characteristics: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Selected filter states
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedChar, setSelectedChar] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [toolsRes, filtersRes] = await Promise.all([
                    fetch('http://localhost/XploreIA/backend/public/ai-tools'),
                    fetch('http://localhost/XploreIA/backend/public/filters')
                ]);

                const toolsData = await toolsRes.json();
                const filtersData = await filtersRes.json();

                if (toolsData.status === 'success') setTools(toolsData.data);
                if (filtersData.status === 'success') setFilters(filtersData.data);
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredTools = tools.filter(tool => {
        const matchesCategory = selectedCategory === 'all' || tool.category_name === selectedCategory;
        const matchesChar = selectedChar === 'all' || tool.characteristics.some(c => c.name === selectedChar);
        const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             tool.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesCategory && matchesChar && matchesSearch;
    });

    if (loading) return <div className="loading">Exploration en cours...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="ai-explorer">
            <header className="explorer-header">
                <h1>Explore AI Tools</h1>
                <p>Découvrez les meilleurs outils d'intelligence artificielle pour vos projets.</p>
            </header>

            <section className="filter-bar">
                <div className="search-box">
                    <input 
                        type="text" 
                        placeholder="Rechercher un outil..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filters">
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="all">Toutes les catégories</option>
                        {filters.categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>

                    <select value={selectedChar} onChange={(e) => setSelectedChar(e.target.value)}>
                        <option value="all">Toutes les caractéristiques</option>
                        {filters.characteristics.map((char, index) => (
                            <option key={index} value={char.name}>{char.name} ({char.type})</option>
                        ))}
                    </select>
                </div>
            </section>

            <div className="tools-grid">
                {filteredTools.map(tool => (
                    <div key={tool.id} className="tool-card">
                        <div className="card-header">
                            <img src={tool.logo_url || '/default-logo.png'} alt={tool.name} className="tool-logo" />
                            <div className="tool-meta">
                                <h3>{tool.name}</h3>
                                <span className="category-badge">{tool.category_name}</span>
                            </div>
                            <div className="rating">⭐ {tool.global_rating || 'N/A'}</div>
                        </div>
                        
                        <p className="tool-description">{tool.description}</p>
                        
                        <div className="tool-tags">
                            {tool.characteristics.map((c, i) => (
                                <span key={i} className={`tag tag-${c.type}`}>{c.name}</span>
                            ))}
                        </div>

                        <div className="tool-models">
                            <h4>Models:</h4>
                            <ul>
                                {tool.models.map((m, i) => (
                                    <li key={i}>{m.name}</li>
                                ))}
                            </ul>
                        </div>

                        <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="visit-btn">
                            Visiter le site
                        </a>
                    </div>
                ))}
            </div>
            
            {filteredTools.length === 0 && (
                <div className="no-results">Aucun outil ne correspond à votre recherche.</div>
            )}
        </div>
    );
};

export default AiToolsPage;

import React from 'react';

const FilterSidebar = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  pricingFilters, 
  handlePricingChange 
}) => {
  return (
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
                textAlign: 'left',
                cursor: 'pointer'
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
          {['free', 'freemium', 'premium'].map((type) => (
            <label key={type} className="flex items-center gap-sm" style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
              <input 
                type="checkbox" 
                style={{ accentColor: 'var(--primary)' }} 
                checked={pricingFilters[type]}
                onChange={() => handlePricingChange(type)}
              />
              <span style={{ textTransform: 'capitalize' }}>
                {type === 'free' ? 'Gratuit' : type}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;

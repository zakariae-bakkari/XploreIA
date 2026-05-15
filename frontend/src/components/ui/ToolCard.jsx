import React from 'react';
import { Link } from 'react-router-dom';

const slugify = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
};

const ToolCard = ({ tool }) => {
  return (
    <div className="glass-panel tool-card">
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
      </div>
      <div style={{ padding: 'var(--md)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center gap-sm" style={{ marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0, 219, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <a href={tool.website_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 className="h3-md" style={{ margin: 0, cursor: 'pointer' }}>{tool.name}</h3>
          </a>
        </div>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginBottom: '16px', flex: 1 }}>
          {tool.description}
        </p>
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
  );
};

export default ToolCard;

import React from 'react';

const ToolHeader = ({ tool }) => {
  return (
    <div className="flex justify-between items-start" style={{ marginBottom: '24px' }}>
      <div>
        <h1 className="h1-xl" style={{ marginBottom: '8px' }}>{tool.name}</h1>
        <div className="flex gap-sm">
          <span className="tool-tag" style={{ background: 'rgba(0, 219, 233, 0.1)', color: 'var(--primary)' }}>
            {tool.category_name || 'Modèle IA'}
          </span>
          <span className="tool-tag" style={{ background: 'rgba(235, 178, 255, 0.1)', color: 'var(--secondary)' }}>
            {tool.pricing_model || 'Freemium'}
          </span>
          {tool.global_rating && (
            <span className="tool-tag" style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#FFC107' }}>
              ★ {tool.global_rating}
            </span>
          )}
        </div>
      </div>
      <a href={tool.website_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <button className="btn-primary" style={{ padding: '16px 32px' }}>
          Visiter le Site Web
        </button>
      </a>
    </div>
  );
};

export default ToolHeader;

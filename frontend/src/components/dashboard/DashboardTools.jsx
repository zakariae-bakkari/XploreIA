import React from 'react';
import { Link } from 'react-router-dom';

const DashboardTools = ({ allTools, slugify }) => (
  <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px' }}>
    <h3 className="h3-md" style={{ marginBottom: '24px' }}>
      Derniers Ajouts au Marché
    </h3>
    <div className="flex flex-col gap-md">
       {allTools.slice(0, 4).map(tool => (
         <div key={tool.id} className="flex items-center gap-md" style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(0, 219, 233, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {tool.logo_url ? (
                 <img 
                   src={tool.logo_url} 
                   alt={tool.name} 
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   onError={(e) => {
                     e.target.style.display = 'none';
                     e.target.nextSibling.style.display = 'flex';
                   }}
                 />
               ) : null}
               <div className="flex items-center justify-center" style={{ 
                 width: '100%', 
                 height: '100%', 
                 display: tool.logo_url ? 'none' : 'flex',
                 color: 'var(--primary)'
               }}>
                 <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>smart_toy</span>
               </div>
            </div>
            <div style={{ flex: 1 }}>
               <h4 style={{ fontWeight: 'bold', fontSize: '16px' }}>{tool.name}</h4>
               <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                 {tool.description}
               </p>
            </div>
            <div className="flex gap-sm">
                <Link to={`/tool/${slugify(tool.name)}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>Voir l'outil</Link>
            </div>
         </div>
       ))}
       {allTools.length === 0 && (
         <p style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: '20px' }}>Aucun outil trouvé dans le marché.</p>
       )}
    </div>
  </div>
);

export default DashboardTools;

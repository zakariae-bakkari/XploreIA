import React from 'react';

const ToolContent = ({ tool }) => {
  return (
    <>
      <p className="body-lg" style={{ color: 'var(--on-surface-variant)', lineHeight: '1.8', marginBottom: '40px' }}>
        {tool.description || "Aucune description détaillée disponible pour cet outil pour le moment. Notre communauté examine actuellement ses fonctionnalités et capacités."}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
        <div>
          <h3 className="h3-md" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: '#4CAF50' }}>add_circle</span>
            Avantages
          </h3>
          <div className="flex flex-col gap-sm">
             {tool.advantages?.length > 0 ? tool.advantages.map((adv, i) => (
               <div key={i} className="flex gap-sm body-md" style={{ color: 'var(--on-surface-variant)' }}>
                 <span style={{ color: '#4CAF50' }}>•</span> {adv.name}
               </div>
             )) : <p style={{ color: 'var(--outline)', fontSize: '14px' }}>Aucun avantage spécifique listé pour le moment.</p>}
          </div>
        </div>
        <div>
          <h3 className="h3-md" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: '#FF5252' }}>remove_circle</span>
            Inconvénients
          </h3>
          <div className="flex flex-col gap-sm">
             {tool.disadvantages?.length > 0 ? tool.disadvantages.map((dis, i) => (
               <div key={i} className="flex gap-sm body-md" style={{ color: 'var(--on-surface-variant)' }}>
                 <span style={{ color: '#FF5252' }}>•</span> {dis.name}
               </div>
             )) : <p style={{ color: 'var(--outline)', fontSize: '14px' }}>Aucun inconvénient spécifique listé pour le moment.</p>}
          </div>
        </div>
      </div>

      <h3 className="h3-md" style={{ marginBottom: '24px' }}>Modèles Disponibles</h3>
      <div className="flex flex-col gap-md" style={{ marginBottom: '48px' }}>
         {tool.models?.length > 0 ? tool.models.map((model, i) => (
           <div key={i} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.01)' }}>
             <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
               <h4 style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{model.name}</h4>
               <span className="label-sm" style={{ color: 'var(--outline)' }}>ACTIVE</span>
             </div>
             <p className="body-md" style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>{model.description}</p>
           </div>
         )) : <p style={{ color: 'var(--outline)', fontSize: '14px' }}>Aucun modèle spécialisé trouvé pour cet outil.</p>}
      </div>

      <h3 className="h3-md" style={{ marginBottom: '24px' }}>Capacités Clés</h3>
      <div className="flex flex-wrap gap-md" style={{ marginBottom: '48px' }}>
         {tool.characteristics?.length > 0 ? tool.characteristics.map((char, i) => (
           <div key={i} className="feature-tag flex items-center gap-sm">
             <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>check_circle</span>
             <span>{char.name}</span>
           </div>
         )) : <p style={{ color: 'var(--outline)', fontSize: '14px' }}>Les caractéristiques sont en cours de vérification par notre équipe.</p>}
      </div>
    </>
  );
};

export default ToolContent;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { aiToolApi } from '../api';

const ToolDetailsPage = () => {
  const { slug } = useParams();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        // Resolve ID from slug map stored in DiscoverPage
        const slugMap = JSON.parse(localStorage.getItem('xplore_slug_map') || '{}');
        const resolvedId = slugMap[slug];

        if (!resolvedId) {
           // Fallback: If map is missing (direct access), we might need to fetch all tools first
           // but for now we show not found
           setLoading(false);
           return;
        }

        const response = await aiToolApi.getById(resolvedId);
        if (response && response.success) {
          setTool(response.data);
        } else {
          setTool(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTool();
  }, [slug]);

  if (loading) return (
    <MainLayout>
      <div className="container" style={{ padding: '100px', textAlign: 'center', color: 'var(--primary)' }}>
        Chargement de l'intelligence de l'outil...
      </div>
    </MainLayout>
  );

  if (!tool) return (
    <MainLayout>
      <div className="container" style={{ padding: '100px', textAlign: 'center' }}>
        Outil non trouvé. <Link to="/discover" style={{ color: 'var(--primary)' }}>Retour au marché</Link>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container" style={{ padding: '40px 0' }}>
        <Link to="/discover" className="flex items-center gap-xs" style={{ color: 'var(--on-surface-variant)', marginBottom: '32px', textDecoration: 'none' }}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="label-sm">Retour au Marché</span>
        </Link>

        <div className="tool-details-grid">
          <div>
            <img src={tool.image_url || tool.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200"} alt={tool.name} className="tool-hero-img" style={{ marginBottom: '40px' }} />
            
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
              <button className="btn-primary" style={{ padding: '16px 32px' }}>
                Visiter le Site Web
              </button>
            </div>

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
          </div>

          <aside>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', marginBottom: '24px' }}>
              <h4 className="label-sm" style={{ color: 'var(--outline)', marginBottom: '16px' }}>DÉVELOPPEUR</h4>
              <div className="flex items-center gap-md">
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined">api</span>
                </div>
                <div>
                  <p style={{ fontWeight: 'bold' }}>{tool.provider_name || 'Xplore Labs'}</p>
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Fournisseur Vérifié</p>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
              <h4 className="label-sm" style={{ color: 'var(--outline)', marginBottom: '16px' }}>STATISTIQUES</h4>
              <div className="flex flex-col gap-md">
                <div className="flex justify-between">
                  <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Sauvegardes</span>
                  <span style={{ fontWeight: 'bold' }}>1.2k</span>
                </div>
                <div className="flex justify-between">
                  <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Évaluation</span>
                  <span style={{ fontWeight: 'bold' }}>{tool.global_rating || 'N/A'}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Sortie</span>
                  <span style={{ fontWeight: 'bold' }}>{tool.release_date || 'Inconnue'}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default ToolDetailsPage;

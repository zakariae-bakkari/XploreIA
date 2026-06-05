import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { aiToolApi } from '../api';

// Modular Components
import ToolHeader from '../components/ui/ToolHeader';
import ToolContent from '../components/ui/ToolContent';
import ToolSidebar from '../components/ui/ToolSidebar';
import ReviewSection from '../components/ui/ReviewSection';

const ToolDetailsPage = () => {
  const { slug } = useParams();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const slugMap = JSON.parse(localStorage.getItem('xplore_slug_map') || '{}');
        const resolvedId = slugMap[slug];

        if (!resolvedId) {
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
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <Link to="/discover" className="flex items-center gap-xs" style={{ color: 'var(--on-surface-variant)', marginBottom: '32px', textDecoration: 'none' }}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="label-sm">Retour au Marché</span>
        </Link>

        <div className="tool-details-grid">
          <div>
            <img src={tool.image_url || tool.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200"} alt={tool.name} className="tool-hero-img" style={{ marginBottom: '40px' }} />
            
            <ToolHeader tool={tool} />
            
            <ToolContent tool={tool} />

            <ReviewSection 
              tool={tool} 
              showReviews={showReviews} 
              setShowReviews={setShowReviews} 
            />
          </div>

          <ToolSidebar tool={tool} />
        </div>
      </div>
    </MainLayout>
  );
};

export default ToolDetailsPage;

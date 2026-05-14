import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { aiToolApi } from '../api';

const ToolDetailsPage = () => {
  const { id } = useParams();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const data = await aiToolApi.getById(id);
        setTool(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTool();
  }, [id]);

  if (loading) return (
    <MainLayout>
      <div className="container" style={{ padding: '100px', textAlign: 'center', color: 'var(--primary)' }}>
        Loading tool intelligence...
      </div>
    </MainLayout>
  );

  if (!tool) return (
    <MainLayout>
      <div className="container" style={{ padding: '100px', textAlign: 'center' }}>
        Tool not found. <Link to="/discover" style={{ color: 'var(--primary)' }}>Back to marketplace</Link>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container" style={{ padding: '40px 0' }}>
        <Link to="/discover" className="flex items-center gap-xs" style={{ color: 'var(--on-surface-variant)', marginBottom: '32px', textDecoration: 'none' }}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="label-sm">Back to Marketplace</span>
        </Link>

        <div className="tool-details-grid">
          <div>
            <img src={tool.image_url || tool.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200"} alt={tool.name} className="tool-hero-img" style={{ marginBottom: '40px' }} />
            
            <div className="flex justify-between items-start" style={{ marginBottom: '24px' }}>
              <div>
                <h1 className="h1-xl" style={{ marginBottom: '8px' }}>{tool.name}</h1>
                <div className="flex gap-sm">
                  <span className="tool-tag">{tool.category || 'AI Model'}</span>
                  <span className="tool-tag" style={{ background: 'rgba(235, 178, 255, 0.1)', color: 'var(--secondary)' }}>
                    {tool.is_pro ? 'Premium' : 'Free Access'}
                  </span>
                </div>
              </div>
              <button className="btn-primary" style={{ padding: '16px 32px' }}>
                Visit Website
              </button>
            </div>

            <p className="body-lg" style={{ color: 'var(--on-surface-variant)', lineHeight: '1.8', marginBottom: '40px' }}>
              {tool.description || "No detailed description available for this tool yet. Our community is currently reviewing its features and capabilities."}
            </p>

            <h3 className="h3-md" style={{ marginBottom: '24px' }}>Key Features</h3>
            <div className="flex flex-wrap gap-md" style={{ marginBottom: '48px' }}>
               {['Neural Processing', 'Cloud API', 'Real-time Analytics', 'Secure Workflow'].map(f => (
                 <div key={f} className="feature-tag flex items-center gap-sm">
                   <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>check_circle</span>
                   <span>{f}</span>
                 </div>
               ))}
            </div>
          </div>

          <aside>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', marginBottom: '24px' }}>
              <h4 className="label-sm" style={{ color: 'var(--outline)', marginBottom: '16px' }}>DEVELOPER</h4>
              <div className="flex items-center gap-md">
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined">api</span>
                </div>
                <div>
                  <p style={{ fontWeight: 'bold' }}>Xplore Labs</p>
                  <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Verified Provider</p>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
              <h4 className="label-sm" style={{ color: 'var(--outline)', marginBottom: '16px' }}>STATS</h4>
              <div className="flex flex-col gap-md">
                <div className="flex justify-between">
                  <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Saves</span>
                  <span style={{ fontWeight: 'bold' }}>1.2k</span>
                </div>
                <div className="flex justify-between">
                  <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Rating</span>
                  <span style={{ fontWeight: 'bold' }}>4.8/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Updated</span>
                  <span style={{ fontWeight: 'bold' }}>2 days ago</span>
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

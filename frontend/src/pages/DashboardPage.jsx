import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { userApi, aiToolApi } from '../api';
import { Link } from 'react-router-dom';

// Modular Components
import { DashboardStats } from '../components/dashboard/DashboardStats';
import DashboardTools from '../components/dashboard/DashboardTools';
import DashboardPlaylists from '../components/dashboard/DashboardPlaylists';

const DashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [allTools, setAllTools] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const role = user?.role || 'user';

  const slugify = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.email) {
          const [profileRes, toolsRes] = await Promise.all([
            userApi.getProfile(user.email),
            aiToolApi.getAll()
          ]);
          
          if (profileRes.status === 'success') setProfile(profileRes.data);
          
          if (toolsRes.status === 'success') {
            const toolsData = toolsRes.data;
            setAllTools(toolsData);
            
            // Sync slug map for consistent routing
            const slugMap = JSON.parse(localStorage.getItem('xplore_slug_map') || '{}');
            toolsData.forEach(t => {
              slugMap[slugify(t.name)] = t.id;
            });
            localStorage.setItem('xplore_slug_map', JSON.stringify(slugMap));
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: '100px', color: 'var(--primary)' }}>
        Loading your workspace...
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <div className="flex justify-between items-center" style={{ marginBottom: '40px' }}>
          <div>
            <h1 className="h1-xl" style={{ color: 'var(--primary)', fontSize: '40px' }}>
              {role === 'admin' ? 'Console de Gestion' : 'Mon Espace IA'}
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>
              {role === 'admin' 
                ? `Système actif. Gestion de ${allTools.length} outils IA en cours.` 
                : `Bon retour, ${profile?.name || user?.name || 'Explorateur'}. Vous avez ${profile?.playlists?.length || 0} collections actives.`}
            </p>
          </div>
          <div className="flex gap-md">
             <button className="btn-primary" style={{ padding: '12px 24px' }}>
               {role === 'admin' ? 'Ajouter un Outil IA' : 'Suggérer un Outil'}
             </button>
          </div>
        </div>

        <DashboardStats 
          allToolsCount={allTools.length}
          playlistCount={profile?.playlists?.length || 0}
          suggestionCount={profile?.suggestions?.length || 0}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px', marginTop: '40px' }}>
          <DashboardTools allTools={allTools} slugify={slugify} />
          
          <div className="flex flex-col">
            <DashboardPlaylists playlists={profile?.playlists} />

            <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px', marginTop: '24px' }}>
              <h3 className="h3-md" style={{ marginBottom: '24px' }}>Mes Soumissions</h3>
              <div className="flex flex-col gap-lg">
                 {profile?.suggestions?.length > 0 ? (
                   profile.suggestions.slice(0, 3).map(tool => (
                     <div key={tool.id} className="flex gap-md">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(235, 178, 255, 0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_awesome</span>
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', lineHeight: '1.4' }}>
                            Suggéré <span style={{ fontWeight: 'bold' }}>{tool.name}</span>
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                            Statut: <span style={{ color: 'var(--primary)' }}>{tool.status?.toUpperCase()}</span>
                          </p>
                        </div>
                     </div>
                   ))
                 ) : (
                   <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>Aucune activité pour le moment. Pourquoi ne pas suggérer un outil ?</p>
                 )}
              </div>
            </div>
          </div>
        </div>

        {role !== 'admin' && (
          <div style={{ marginTop: '40px' }}>
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(0, 219, 233, 0.05) 0%, rgba(235, 178, 255, 0.05) 100%)' }}>
              <h1 className="h2-lg">Prêt à explorer ?</h1>
              <p className="body-lg" style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>
                Rejoignez la communauté et aidez-nous à découvrir les meilleures IA.
              </p>
              <button className="btn-primary" style={{ marginTop: '24px' }}>Explorer le Marché</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;

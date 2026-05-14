import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.email) {
          const response = await userApi.getProfile(user.email);
          if (response.status === 'success') {
            setProfile(response.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const getInitials = (name) => {
    if (!name) return 'X';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: '100px', color: 'var(--primary)' }}>
        Synchronisation de vos données de profil...
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div className="flex items-center justify-center profile-avatar-lg" style={{ background: 'var(--primary)', color: 'var(--on-primary)', fontSize: '48px', fontWeight: 'bold' }}>
              {getInitials(user?.name)}
            </div>
            <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'var(--primary)', color: 'var(--on-primary)', padding: '6px', borderRadius: '50%', border: '4px solid var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>
            </div>
          </div>
           <h1 className="h1-xl" style={{ marginTop: '24px', marginBottom: '8px' }}>{profile?.name || user?.name}</h1>
          <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>{profile?.email || user?.email}</p>
          <p className="label-sm" style={{ color: 'var(--primary)', marginTop: '8px' }}>
             {profile?.role === 'admin' ? 'ADMINISTRATEUR' : 'MEMBRE'} • Membre depuis {formatDate(profile?.created_at)}
          </p>
          
          <button 
            onClick={logout}
            className="flex items-center gap-sm" 
            style={{ 
              margin: '24px auto 0', 
              background: 'rgba(255, 69, 58, 0.1)', 
              color: '#ff453a', 
              border: '1px solid rgba(255, 69, 58, 0.2)', 
              padding: '8px 20px', 
              borderRadius: '99px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
            Déconnexion
          </button>
        </header>

        <div className="flex flex-col gap-xl">
           <section className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
            <h3 className="h3-md" style={{ marginBottom: '24px' }}>Vue d'ensemble du compte</h3>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: '1.6' }}>
              Bon retour ! Vous êtes actuellement un membre actif de l'écosystème XploreIA. Voici un résumé de vos contributions à la communauté et de vos collections.
            </p>
            <div className="flex gap-md" style={{ marginTop: '32px' }}>
               <div className="glass-panel" style={{ padding: '16px 24px', borderRadius: '16px', flex: 1, textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '20px' }}>{profile?.playlists?.length || 0}</p>
                  <p className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>PLAYLISTS</p>
               </div>
               <div className="glass-panel" style={{ padding: '16px 24px', borderRadius: '16px', flex: 1, textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '20px' }}>{profile?.suggestions?.length || 0}</p>
                  <p className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>SUGGESTIONS</p>
               </div>
               <div className="glass-panel" style={{ padding: '16px 24px', borderRadius: '16px', flex: 1, textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '20px' }}>{profile?.status === 'active' ? 'ACTIF' : 'ACTIF'}</p>
                  <p className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>STATUT</p>
               </div>
            </div>
          </section>

          {profile?.playlists?.length > 0 && (
            <section>
              <h3 className="h3-md" style={{ marginBottom: '24px' }}>Vos Playlists</h3>
              <div className="flex flex-col gap-md">
                {profile.playlists.map(pl => (
                  <div key={pl.id} className="glass-panel" style={{ padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(0, 219, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <span className="material-symbols-outlined">playlist_add_check</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 'bold' }}>{pl.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                        {pl.item_count || 0} Outils • {pl.is_public ? 'Public' : 'Privé'}
                      </p>
                    </div>
                    <span className="material-symbols-outlined" style={{ color: 'var(--outline)' }}>chevron_right</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="h3-md" style={{ marginBottom: '24px' }}>Suggestions de la communauté</h3>
            <div className="flex flex-col gap-md">
               {profile?.suggestions?.length > 0 ? (
                 profile.suggestions.map(tool => (
                   <div key={tool.id} className="glass-panel" style={{ padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(235, 178, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                         <span className="material-symbols-outlined">auto_awesome</span>
                      </div>
                      <div style={{ flex: 1 }}>
                         <p style={{ fontWeight: 'bold' }}>{tool.name}</p>
                         <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                           Suggéré le {new Date(tool.created_at).toLocaleDateString('fr-FR')}
                         </p>
                      </div>
                      <span className="label-sm" style={{ 
                        color: tool.status === 'published' ? 'var(--primary)' : 'var(--secondary)', 
                        background: tool.status === 'published' ? 'rgba(0, 219, 233, 0.1)' : 'rgba(235, 178, 255, 0.1)', 
                        padding: '4px 12px', 
                        borderRadius: '99px' 
                      }}>
                        {tool.status === 'published' ? 'PUBLIÉ' : 'EN ATTENTE'}
                      </span>
                   </div>
                 ))
               ) : (
                 <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)', borderRadius: '24px' }}>
                    <p>Vous n'avez pas encore suggéré d'outils IA.</p>
                 </div>
               )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;

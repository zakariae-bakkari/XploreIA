import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api';
import { ProfileHeader, ProfileOverview } from '../components/profile/ProfileComponents';

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
        <ProfileHeader 
          user={user}
          profile={profile}
          logout={logout}
          getInitials={getInitials}
          formatDate={formatDate}
        />

        <div className="flex flex-col gap-xl">
          <ProfileOverview profile={profile} />

          {profile?.playlists?.length > 0 && (
            <section>
              <h3 className="h3-md" style={{ marginBottom: '24px' }}>Vos Playlists</h3>
              <div className="flex flex-col gap-md">
                {profile.playlists.map(pl => (
                  <Link 
                    key={pl.id} 
                    to={`/playlists/${pl.id}`} 
                    className="glass-panel" 
                    style={{ 
                      padding: '20px', 
                      borderRadius: '20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '20px',
                      textDecoration: 'none',
                      color: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
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
                  </Link>
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

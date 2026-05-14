import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { userApi, aiToolApi } from '../api';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState(null);
  const [allTools, setAllTools] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
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

  React.useEffect(() => {
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
              {role === 'admin' ? 'Management Console' : 'My AI Workspace'}
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>
              {role === 'admin' 
                ? `System active. Currently managing ${allTools.length} AI tools.` 
                : `Welcome back, ${profile?.name || user?.name}. You have ${profile?.playlists?.length || 0} collections active.`}
            </p>
          </div>
          <div className="flex gap-md">
             <button className="btn-primary" style={{ padding: '12px 24px' }}>
               {role === 'admin' ? 'Add New AI Tool' : 'Suggest AI Tool'}
             </button>
          </div>
        </div>

        {/* Stats Grid */}
         <section className="stats-grid">
          <div className="glass-panel stats-card">
            <div className="flex justify-between">
              <div style={{ padding: '12px', background: 'rgba(0, 219, 233, 0.1)', color: 'var(--primary)', borderRadius: '12px' }}>
                <span className="material-symbols-outlined">explore</span>
              </div>
            </div>
            <div>
              <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none' }}>Marketplace Tools</p>
              <h2 className="h2-lg" style={{ marginTop: '8px' }}>{allTools.length} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--outline)' }}>active</span></h2>
            </div>
          </div>

          <div className="glass-panel stats-card">
            <div className="flex justify-between">
              <div style={{ padding: '12px', background: 'rgba(235, 178, 255, 0.1)', color: 'var(--secondary)', borderRadius: '12px' }}>
                <span className="material-symbols-outlined">auto_awesome_motion</span>
              </div>
            </div>
            <div>
              <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none' }}>Your Collections</p>
              <h2 className="h2-lg" style={{ marginTop: '8px' }}>{profile?.playlists?.length || 0} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--outline)' }}>playlists</span></h2>
            </div>
          </div>

          <div className="glass-panel stats-card">
            <div className="flex justify-between">
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--on-surface)', borderRadius: '12px' }}>
                <span className="material-symbols-outlined">history_edu</span>
              </div>
            </div>
            <div>
              <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none' }}>Suggestions</p>
              <h2 className="h2-lg" style={{ marginTop: '8px' }}>{profile?.suggestions?.length || 0} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--outline)' }}>submitted</span></h2>
            </div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px', marginTop: '40px' }}>
          
          {/* Main List / Table */}
           <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px' }}>
            <h3 className="h3-md" style={{ marginBottom: '24px' }}>
              Latest Marketplace Additions
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
                        <Link to={`/tool/${slugify(tool.name)}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>View Tool</Link>
                    </div>
                 </div>
               ))}
               {allTools.length === 0 && (
                 <p style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: '20px' }}>No tools found in the marketplace.</p>
               )}
            </div>
          </div>

          {/* My Playlists Section */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px', marginTop: '24px' }}>
            <h3 className="h3-md" style={{ marginBottom: '24px' }}>My Playlists</h3>
            <div className="flex flex-col gap-md">
              {profile?.playlists?.length > 0 ? (
                profile.playlists.map(pl => (
                  <div key={pl.id} className="flex items-center gap-md" style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 219, 233, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined">playlist_add_check</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: 'bold', fontSize: '15px' }}>{pl.name}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                        {pl.item_count || 0} items • {pl.is_public ? 'Public' : 'Private'}
                      </p>
                    </div>
                    <Link to="/playlists" className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Open
                    </Link>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--on-surface-variant)' }}>
                  <p>You haven't created any playlists yet.</p>
                  <Link to="/playlists" style={{ color: 'var(--primary)', fontSize: '14px', marginTop: '8px', display: 'inline-block' }}>Create your first collection</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr', gap: '24px', marginTop: '40px' }}>
          <div className="flex flex-col gap-md">
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 className="h3-md" style={{ marginBottom: '24px' }}>My Submissions</h3>
              <div className="flex flex-col gap-lg">
                 {profile?.suggestions?.length > 0 ? (
                   profile.suggestions.slice(0, 3).map(tool => (
                     <div key={tool.id} className="flex gap-md">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(235, 178, 255, 0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_awesome</span>
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', lineHeight: '1.4' }}>
                            Suggested <span style={{ fontWeight: 'bold' }}>{tool.name}</span>
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                            Status: <span style={{ color: 'var(--primary)' }}>{tool.status?.toUpperCase()}</span>
                          </p>
                        </div>
                     </div>
                   ))
                 ) : (
                   <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>No activity yet. Why not suggest a tool?</p>
                 )}
              </div>
            </div>

            {role !== 'admin' && (
              <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(0, 219, 233, 0.05) 0%, rgba(235, 178, 255, 0.05) 100%)' }}>
                <h3 className="h3-md" style={{ marginBottom: '16px' }}>Need a missing tool?</h3>
                <p className="body-md" style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginBottom: '24px' }}>
                  If you can't find an AI tool you love, suggest it to our community!
                </p>
                <button className="btn-primary" style={{ width: '100%' }}>Suggest Tool</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;

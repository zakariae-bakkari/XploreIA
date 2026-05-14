import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'user';

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
                ? `System active. Currently managing 254 AI tools and 12,402 users.` 
                : `Welcome back, ${user?.name || 'Explorer'}. Discover and save the best AI tools for your workflow.`}
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
              <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none' }}>{role === 'admin' ? 'Total Tools' : 'Tools Discovered'}</p>
              <h2 className="h2-lg" style={{ marginTop: '8px' }}>{role === 'admin' ? '254' : '42'} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--outline)' }}>models</span></h2>
            </div>
          </div>

          <div className="glass-panel stats-card">
            <div className="flex justify-between">
              <div style={{ padding: '12px', background: 'rgba(235, 178, 255, 0.1)', color: 'var(--secondary)', borderRadius: '12px' }}>
                <span className="material-symbols-outlined">favorite</span>
              </div>
            </div>
            <div>
              <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none' }}>Saved to Favorites</p>
              <h2 className="h2-lg" style={{ marginTop: '8px' }}>{role === 'admin' ? '12.4k' : '18'} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--outline)' }}>saved</span></h2>
            </div>
          </div>

          <div className="glass-panel stats-card">
            <div className="flex justify-between">
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--on-surface)', borderRadius: '12px' }}>
                <span className="material-symbols-outlined">{role === 'admin' ? 'group' : 'reviews'}</span>
              </div>
            </div>
            <div>
              <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none' }}>{role === 'admin' ? 'Total Members' : 'Suggestions'}</p>
              <h2 className="h2-lg" style={{ marginTop: '8px' }}>{role === 'admin' ? '12.4k' : '3'} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--outline)' }}>{role === 'admin' ? 'users' : 'pending'}</span></h2>
            </div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px', marginTop: '40px' }}>
          
          {/* Main List / Table */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px' }}>
            <h3 className="h3-md" style={{ marginBottom: '24px' }}>
              {role === 'admin' ? 'Recently Added Tools' : 'Explore New AI Models'}
            </h3>
            <div className="flex flex-col gap-md">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="flex items-center gap-md" style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden' }}>
                       <img src={`https://images.unsplash.com/photo-${1677442136019 + i}-21780ecad995?w=128`} alt="Tool" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                       <h4 style={{ fontWeight: 'bold', fontSize: '16px' }}>Neural Engine v{i}.0</h4>
                       <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>Advanced text generation and code optimization model.</p>
                    </div>
                    <div className="flex gap-sm">
                       {role === 'admin' ? (
                         <>
                           <button className="glass-panel" style={{ padding: '8px' }}><span className="material-symbols-outlined">edit</span></button>
                           <button className="glass-panel" style={{ padding: '8px', color: 'var(--error)' }}><span className="material-symbols-outlined">delete</span></button>
                         </>
                       ) : (
                         <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>View Tool</button>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Activity / Suggestions */}
          <div className="flex flex-col gap-md">
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 className="h3-md" style={{ marginBottom: '24px' }}>Community Activity</h3>
              <div className="flex flex-col gap-lg">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex gap-md">
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 219, 233, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{i === 1 ? 'new_releases' : 'comment'}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', lineHeight: '1.4' }}>
                          <span style={{ fontWeight: 'bold' }}>User_{i}42</span> suggested a new tool: <span style={{ color: 'var(--primary)' }}>CodeMaster AI</span>
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>{i}h ago</p>
                      </div>
                   </div>
                 ))}
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

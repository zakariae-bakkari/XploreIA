import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || 'Alex Rivera',
    username: user?.username || 'alex_xplore',
    email: user?.email || 'alex.rivera@xplore.ia',
    bio: 'AI Research Lead & Developer. Building the future of neural marketplace automation.'
  });

  const getInitials = (name) => {
    if (!name) return 'X';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 className="h1-xl" style={{ fontSize: '40px' }}>Account Settings</h1>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>Manage your profile, security, and developer credentials.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          
          {/* Profile Section */}
          <section className="glass-panel" style={{ padding: '32px', borderRadius: '24px', position: 'relative' }}>
            <div className="flex justify-between items-start" style={{ marginBottom: '32px' }}>
              <div>
                <h2 className="h3-md">Profile Information</h2>
                <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none', marginTop: '4px' }}>Update your public profile and contact info.</p>
              </div>
              <button className="btn-primary" style={{ padding: '10px 24px' }}>Save Changes</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '48px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto' }}>
                   <div className="flex items-center justify-center" style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', fontSize: '48px', fontWeight: 'bold', border: '2px solid var(--primary)', padding: '4px' }}>
                     {getInitials(formData.name)}
                   </div>
                   <button className="btn-primary" style={{ position: 'absolute', bottom: '0', right: '0', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}>
                     <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                   </button>
                </div>
                <p className="label-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '16px', textTransform: 'none', fontSize: '10px' }}>JPG, PNG or WEBP. Max 5MB.</p>
              </div>

              <div className="flex flex-col gap-md">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="flex flex-col gap-xs">
                    <label className="label-sm" style={{ color: 'var(--primary)', opacity: 0.8 }}>Full Name</label>
                    <input type="text" className="cyber-input" style={{ padding: '12px 0', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0', background: 'transparent' }} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="label-sm" style={{ color: 'var(--primary)', opacity: 0.8 }}>Username</label>
                    <input type="text" className="cyber-input" style={{ padding: '12px 0', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0', background: 'transparent' }} value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                  </div>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="label-sm" style={{ color: 'var(--primary)', opacity: 0.8 }}>Email Address</label>
                  <input type="email" className="cyber-input" style={{ padding: '12px 0', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0', background: 'transparent' }} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="label-sm" style={{ color: 'var(--primary)', opacity: 0.8 }}>Bio</label>
                  <textarea className="cyber-input" style={{ padding: '12px 0', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0', background: 'transparent', minHeight: '80px', resize: 'none' }} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {/* Security */}
            <section className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
              <div className="flex items-center gap-md" style={{ marginBottom: '24px' }}>
                <div style={{ padding: '10px', background: 'rgba(0, 219, 233, 0.1)', color: 'var(--primary)', borderRadius: '12px' }}>
                  <span className="material-symbols-outlined">security</span>
                </div>
                <h3 className="h3-md">Security</h3>
              </div>
              <div className="flex flex-col gap-md">
                <div className="flex justify-between items-center" style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '14px' }}>Password</p>
                    <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Last changed 3 months ago</p>
                  </div>
                  <button style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Update</button>
                </div>
                <div className="flex justify-between items-center" style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '14px' }}>2-Factor Auth</p>
                    <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Enabled via App</p>
                  </div>
                  <div style={{ width: '40px', height: '20px', background: 'rgba(0, 219, 233, 0.2)', borderRadius: '10px', position: 'relative' }}>
                    <div style={{ position: 'absolute', right: '2px', top: '2px', width: '16px', height: '16px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Plan */}
            <section className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
              <div className="flex items-center gap-md" style={{ marginBottom: '24px' }}>
                <div style={{ padding: '10px', background: 'rgba(235, 178, 255, 0.1)', color: 'var(--secondary)', borderRadius: '12px' }}>
                  <span className="material-symbols-outlined">workspace_premium</span>
                </div>
                <h3 className="h3-md">Subscription</h3>
              </div>
              <div className="flex flex-col gap-md">
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Pro Dev Plan</p>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div className="cyber-gradient-bg" style={{ width: '75%', height: '100%' }}></div>
                  </div>
                  <div className="flex justify-between label-sm" style={{ marginTop: '8px', fontSize: '10px' }}>
                    <span>7.5k / 10k Credits</span>
                    <span style={{ color: 'var(--secondary)' }}>75%</span>
                  </div>
                </div>
                <button className="btn-primary" style={{ width: '100%', background: 'var(--secondary-container)', color: 'var(--on-secondary)' }}>Upgrade Now</button>
              </div>
            </section>
          </div>

          {/* API Keys Table */}
          <section className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
               <div className="flex items-center gap-md">
                  <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderRadius: '12px' }}>
                    <span className="material-symbols-outlined">key</span>
                  </div>
                  <div>
                    <h3 className="h3-md">API Keys</h3>
                    <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none' }}>Active tokens for development</p>
                  </div>
               </div>
               <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>+ Create New</button>
            </div>
            <div style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
               <div className="flex label-sm" style={{ padding: '8px 16px', color: 'var(--on-surface-variant)', opacity: 0.6 }}>
                  <div style={{ flex: 1 }}>Label</div>
                  <div style={{ flex: 1 }}>Key ID</div>
                  <div style={{ flex: 1 }}>Created</div>
                  <div style={{ flex: 1 }}>Status</div>
               </div>
               <div className="flex items-center" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ flex: 1, fontWeight: 'bold' }}>Production Main</div>
                  <div style={{ flex: 1, color: 'var(--primary)', fontFamily: 'monospace' }}>xp_live_••••89z2</div>
                  <div style={{ flex: 1, color: 'var(--on-surface-variant)', fontSize: '14px' }}>Oct 12, 2024</div>
                  <div style={{ flex: 1 }}>
                     <span className="flex items-center gap-xs" style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 'bold' }}>
                        <div style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }}></div> Active
                     </span>
                  </div>
               </div>
            </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

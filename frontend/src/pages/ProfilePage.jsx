import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  
  const getInitials = (name) => {
    if (!name) return 'X';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
          <h1 className="h1-xl" style={{ marginTop: '24px', marginBottom: '8px' }}>{user?.name || 'Explorer'}</h1>
          <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>@{user?.username || 'user_xplore'}</p>
        </header>

        <div className="flex flex-col gap-xl">
          <section className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
            <h3 className="h3-md" style={{ marginBottom: '24px' }}>About Me</h3>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: '1.6' }}>
              Digital pioneer and AI enthusiast. I'm exploring the boundaries of machine intelligence to streamline creative workflows and technical innovation.
            </p>
            <div className="flex gap-md" style={{ marginTop: '32px' }}>
               <div className="glass-panel" style={{ padding: '16px 24px', borderRadius: '16px', flex: 1, textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '20px' }}>12</p>
                  <p className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>TOOLS SAVED</p>
               </div>
               <div className="glass-panel" style={{ padding: '16px 24px', borderRadius: '16px', flex: 1, textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '20px' }}>4</p>
                  <p className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>SUGGESTIONS</p>
               </div>
               <div className="glass-panel" style={{ padding: '16px 24px', borderRadius: '16px', flex: 1, textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '20px' }}>2.4k</p>
                  <p className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>FOLLOWERS</p>
               </div>
            </div>
          </section>

          <section>
            <h3 className="h3-md" style={{ marginBottom: '24px' }}>Recent Suggestions</h3>
            <div className="flex flex-col gap-md">
               {[1, 2].map(i => (
                 <div key={i} className="glass-panel" style={{ padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(235, 178, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                       <span className="material-symbols-outlined">add_box</span>
                    </div>
                    <div style={{ flex: 1 }}>
                       <p style={{ fontWeight: 'bold' }}>Neural Studio Pro</p>
                       <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Category: Generative Art • Suggested 3 days ago</p>
                    </div>
                    <span className="label-sm" style={{ color: 'var(--primary)', background: 'rgba(0, 219, 233, 0.1)', padding: '4px 12px', borderRadius: '99px' }}>In Review</span>
                 </div>
               ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;

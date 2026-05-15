import React from 'react';

export const ProfileHeader = ({ user, profile, logout, getInitials, formatDate }) => (
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
);

export const ProfileOverview = ({ profile }) => (
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
);

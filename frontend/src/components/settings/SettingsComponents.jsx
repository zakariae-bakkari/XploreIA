import React from 'react';

export const PersonalSettings = ({ formData, setFormData, handleUpdateName, loading, getInitials }) => (
  <section className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
    <form onSubmit={handleUpdateName}>
      <div className="flex justify-between items-start" style={{ marginBottom: '32px' }}>
        <div>
          <h2 className="h2-lg" style={{ fontSize: '24px' }}>Informations Personnelles</h2>
          <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none', marginTop: '4px' }}>Mettez à jour votre nom et votre adresse email principale.</p>
        </div>
        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '10px 24px' }}>
          {loading ? 'Enregistrement...' : 'Enregistrer le Nom'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '48px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>
             <div className="flex items-center justify-center" style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', fontSize: '40px', fontWeight: 'bold' }}>
               {getInitials(formData.name)}
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className="label-sm" style={{ color: 'var(--primary)', opacity: 0.8 }}>Nom Complet</label>
            <input 
              type="text" 
              className="cyber-input" 
              style={{ 
                padding: '12px 16px', 
                border: '1px solid var(--outline-variant)', 
                borderRadius: '12px', 
                background: 'var(--surface-container-low)',
                color: 'var(--on-surface)',
                width: '100%',
                outline: 'none',
                transition: 'all 0.3s ease'
              }} 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="label-sm" style={{ color: 'var(--primary)', opacity: 0.5 }}>Adresse Email (Lecture seule)</label>
            <input 
              type="email" 
              className="cyber-input" 
              style={{ 
                padding: '12px 16px', 
                border: '1px solid var(--outline-variant)', 
                borderRadius: '12px', 
                background: 'var(--surface-container-low)',
                color: 'var(--on-surface)',
                opacity: 0.6,
                width: '100%',
                cursor: 'not-allowed'
              }} 
              value={formData.email} 
              disabled
            />
          </div>
        </div>
      </div>
    </form>
  </section>
);

export const SecuritySettings = ({ passwordData, setPasswordData, handleChangePassword, loading }) => (
  <section className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
    <form onSubmit={handleChangePassword}>
      <div className="flex justify-between items-start" style={{ marginBottom: '32px' }}>
        <div className="flex items-center gap-md">
          <div style={{ padding: '10px', background: 'rgba(0, 219, 233, 0.1)', color: 'var(--primary)', borderRadius: '12px' }}>
            <span className="material-symbols-outlined">security</span>
          </div>
          <div>
            <h3 className="h3-md">Sécurité & Mot de Passe</h3>
            <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'none' }}>Changez votre mot de passe en toute sécurité.</p>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '10px 24px', background: 'var(--secondary)', color: 'white' }}>
           Mettre à jour le mot de passe
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className="label-sm" style={{ color: 'var(--primary)', opacity: 0.8 }}>Mot de passe actuel</label>
            <input 
              type="password" 
              className="cyber-input" 
              style={{ 
                padding: '12px 16px', 
                border: '1px solid var(--outline-variant)', 
                borderRadius: '12px', 
                background: 'var(--surface-container-low)',
                color: 'var(--on-surface)',
                width: '100%',
                outline: 'none',
                transition: 'all 0.3s ease'
              }} 
              value={passwordData.old_password}
              onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
              required
            />
          </div>
        </div>
         <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className="label-sm" style={{ color: 'var(--primary)', opacity: 0.8 }}>Nouveau mot de passe</label>
            <input 
              type="password" 
              className="cyber-input" 
              style={{ 
                padding: '12px 16px', 
                border: '1px solid var(--outline-variant)', 
                borderRadius: '12px', 
                background: 'var(--surface-container-low)',
                color: 'var(--on-surface)',
                width: '100%',
                outline: 'none',
                transition: 'all 0.3s ease'
              }} 
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
              required
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="label-sm" style={{ color: 'var(--primary)', opacity: 0.8 }}>Confirmer le nouveau mot de passe</label>
            <input 
              type="password" 
              className="cyber-input" 
              style={{ 
                padding: '12px 16px', 
                border: '1px solid var(--outline-variant)', 
                borderRadius: '12px', 
                background: 'var(--surface-container-low)',
                color: 'var(--on-surface)',
                width: '100%',
                outline: 'none',
                transition: 'all 0.3s ease'
              }} 
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
              required
            />
          </div>
        </div>
      </div>
    </form>
  </section>
);

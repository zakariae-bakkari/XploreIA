import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api';

const SettingsPage = () => {
  const { user, checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userApi.updateName({ email: user.email, name: formData.name });
      if (res.status === 'success') {
        setStatus({ type: 'success', message: 'Nom mis à jour avec succès !' });
        checkAuth(); // Refresh global user state
      } else {
        setStatus({ type: 'error', message: res.message || 'Échec de la mise à jour du nom' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setStatus({ type: 'error', message: 'Les nouveaux mots de passe ne correspondent pas' });
      return;
    }

    setLoading(true);
    try {
      const res = await userApi.changePassword({
        email: user.email,
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });

      if (res.status === 'success') {
        setStatus({ type: 'success', message: 'Mot de passe changé avec succès !' });
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      } else {
        setStatus({ type: 'error', message: res.message || 'Échec du changement de mot de passe' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'X';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 className="h1-xl" style={{ fontSize: '40px' }}>Paramètres du Compte</h1>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>Gérez votre profil, votre sécurité et vos identifiants de développeur.</p>
        </header>

         <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          
          {status.message && (
            <div className={`glass-panel status-bar ${status.type}`} style={{ padding: '16px', borderRadius: '12px', textAlign: 'center', background: status.type === 'success' ? 'rgba(0, 219, 233, 0.1)' : 'rgba(255, 69, 58, 0.1)', color: status.type === 'success' ? 'var(--primary)' : '#ff453a' }}>
               {status.message}
            </div>
          )}

          {/* Profile Section */}
          <section className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
            <form onSubmit={handleUpdateName}>
              <div className="flex justify-between items-start" style={{ marginBottom: '32px' }}>
                <div>
                  <h2 className="h3-md">Informations Personnelles</h2>
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
                      style={{ padding: '12px 0', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0', background: 'transparent' }} 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="label-sm" style={{ color: 'var(--primary)', opacity: 0.8, opacity: 0.5 }}>Adresse Email (Lecture seule)</label>
                    <input 
                      type="email" 
                      className="cyber-input" 
                      style={{ padding: '12px 0', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '0', background: 'transparent', cursor: 'not-allowed' }} 
                      value={formData.email} 
                      disabled
                    />
                  </div>
                </div>
              </div>
            </form>
          </section>

          {/* Security / Password Section */}
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
                      style={{ padding: '12px 0', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0', background: 'transparent' }} 
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
                      style={{ padding: '12px 0', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0', background: 'transparent' }} 
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
                      style={{ padding: '12px 0', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0', background: 'transparent' }} 
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api';
import { PersonalSettings, SecuritySettings } from '../components/settings/SettingsComponents';

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

          <PersonalSettings 
            formData={formData}
            setFormData={setFormData}
            handleUpdateName={handleUpdateName}
            loading={loading}
            getInitials={getInitials}
          />

          <SecuritySettings 
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            handleChangePassword={handleChangePassword}
            loading={loading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

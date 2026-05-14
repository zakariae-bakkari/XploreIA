import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../contexts/AuthContext';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await signup(formData);
      if (data.status === 'success') {
        navigate('/login');
      } else {
        setError(data.message || "Échec de l'inscription.");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="container flex items-center justify-between gap-xl" style={{ minHeight: '80vh', padding: '64px 0' }}>
        
        {/* Left Content */}
        <div style={{ flex: 1, maxWidth: '600px' }}>
          <h1 className="h1-xl" style={{ fontSize: '64px', lineHeight: '1.1', marginBottom: '24px', fontWeight: 'bold' }}>
            Rejoignez le Futur <br />
            <span style={{ color: 'var(--secondary)' }}>de la Découverte d'IA.</span>
          </h1>
          <p className="body-lg" style={{ color: 'var(--on-surface-variant)', marginBottom: '48px', maxWidth: '500px' }}>
            Connectez-vous à des modèles d'IA de précision et à des innovateurs techniques dans le marché le plus avancé jamais construit.
          </p>
          
          <div className="flex flex-col gap-lg">
            <div className="flex items-center gap-md">
               <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(219, 252, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <p className="body-md" style={{ fontWeight: '500' }}>Flux de déploiement ultra-rapides</p>
            </div>
            <div className="flex items-center gap-md">
               <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(219, 252, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <span className="material-symbols-outlined">security</span>
              </div>
              <p className="body-md" style={{ fontWeight: '500' }}>Chiffrement et confidentialité de niveau entreprise</p>
            </div>
            <div className="flex items-center gap-md">
               <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(219, 252, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <span className="material-symbols-outlined">groups</span>
              </div>
              <p className="body-md" style={{ fontWeight: '500' }}>Communauté collaborative native de l'IA</p>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '48px', borderRadius: '24px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span>
          </div>

           <div style={{ marginBottom: '32px' }}>
            <h2 className="h2-lg" style={{ fontSize: '32px', marginBottom: '8px' }}>Créer un Compte</h2>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Entrez vos informations pour commencer votre voyage.</p>
          </div>

          {error && <div style={{ color: 'var(--error)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

          <form className="flex flex-col gap-md" onSubmit={handleSignup}>
             <div className="flex flex-col gap-xs">
              <label className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>NOM COMPLET</label>
              <div className="input-container">
                <span className="material-symbols-outlined input-icon">badge</span>
                <input type="text" name="name" className="cyber-input" placeholder="Jean Dupont" value={formData.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <label className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>EMAIL</label>
              <div className="input-container">
                <span className="material-symbols-outlined input-icon">alternate_email</span>
                <input type="email" name="email" className="cyber-input" placeholder="dev@xploreia.ai" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="flex flex-col gap-xs">
              <label className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>MOT DE PASSE</label>
                <div className="input-container">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input type={showPassword ? "text" : "password"} name="password" className="cyber-input" style={{ paddingRight: '48px' }} placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                  <span className="material-symbols-outlined" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--outline)', fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>
               <div className="flex flex-col gap-xs">
                <label className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>CONFIRMER</label>
                <div className="input-container">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="cyber-input" style={{ paddingRight: '48px' }} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                  <span className="material-symbols-outlined" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--outline)', fontSize: '20px' }}>
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>
            </div>

             <button className="btn-primary btn-full" type="submit" disabled={loading} style={{ background: 'var(--primary-container)', color: 'var(--on-primary)', padding: '20px', borderRadius: '12px', marginTop: '16px' }}>
              {loading ? "CRÉATION..." : "Créer le compte"}
            </button>
          </form>

           <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
              Vous avez déjà un compte ? <Link to="/login" style={{ color: 'white', fontWeight: 'bold', marginLeft: '8px' }}>Se connecter</Link>
            </p>
          </div>
        </div>

      </div>
    </AuthLayout>
  );
};

export default SignupPage;

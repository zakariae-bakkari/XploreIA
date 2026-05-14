import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // API Call would go here
    console.log("Resetting password for:", email);
  };

  return (
    <AuthLayout>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: 'var(--lg)', textAlign: 'center' }}>
        <div style={{ marginBottom: '24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'white' }}>key</span>
        </div>
        
        <h1 className="h2-lg" style={{ color: 'var(--on-surface)', marginBottom: '12px' }}>Réinitialiser le mot de passe</h1>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '32px', fontSize: '14px' }}>
          Entrez votre email pour recevoir un code de vérification.
        </p>

        <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
          <div className="input-container">
            <span className="material-symbols-outlined input-icon">mail</span>
            <input 
              type="email" 
              className="cyber-input" 
              placeholder="Adresse Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button className="btn-primary btn-full" type="submit" style={{ marginTop: '16px' }}>
            <span>Envoyer le code</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>

        <div style={{ marginTop: '32px' }}>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
            Vous vous souvenez de votre mot de passe ? 
            <Link to="/login" style={{ color: 'white', fontWeight: 'bold', marginLeft: '8px' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

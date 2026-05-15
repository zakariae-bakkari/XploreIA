import React from 'react';
import { Link } from 'react-router-dom';

export const StepEmail = ({ email, setEmail, handleSendCode, loading }) => (
  <form className="flex flex-col gap-md" onSubmit={handleSendCode}>
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
    <button className="btn-primary btn-full" type="submit" style={{ marginTop: '16px' }} disabled={loading}>
      <span>{loading ? 'Envoi...' : 'Envoyer le code'}</span>
      <span className="material-symbols-outlined">arrow_forward</span>
    </button>
  </form>
);

export const StepCode = ({ code, setCode, handleVerifyCode, loading, setStep }) => (
  <form className="flex flex-col gap-md" onSubmit={handleVerifyCode}>
    <div className="input-container">
      <span className="material-symbols-outlined input-icon">verified_user</span>
      <input 
        type="text" 
        className="cyber-input" 
        placeholder="Code à 6 chiffres" 
        maxLength="6"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }}
      />
    </div>
    <button className="btn-primary btn-full" type="submit" style={{ marginTop: '16px' }} disabled={loading}>
      <span>{loading ? 'Vérification...' : 'Vérifier le code'}</span>
      <span className="material-symbols-outlined">check_circle</span>
    </button>
    <button 
      type="button" 
      className="btn-text" 
      style={{ 
        marginTop: '16px', 
        fontSize: '14px', 
        color: 'var(--on-surface-variant)', 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        width: '100%',
        transition: 'color 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.color = 'white'}
      onMouseOut={(e) => e.currentTarget.style.color = 'var(--on-surface-variant)'}
      onClick={() => setStep(1)}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
      Changer d'adresse email
    </button>
  </form>
);

export const StepPassword = ({ password, setPassword, confirmPassword, setConfirmPassword, handleResetPassword, loading }) => (
  <form className="flex flex-col gap-md" onSubmit={handleResetPassword}>
    <div className="input-container">
      <span className="material-symbols-outlined input-icon">lock</span>
      <input 
        type="password" 
        className="cyber-input" 
        placeholder="Nouveau mot de passe" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>
    <div className="input-container">
      <span className="material-symbols-outlined input-icon">lock_clock</span>
      <input 
        type="password" 
        className="cyber-input" 
        placeholder="Confirmer le mot de passe" 
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
    </div>
    <button className="btn-primary btn-full" type="submit" style={{ marginTop: '16px' }} disabled={loading}>
      <span>{loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}</span>
      <span className="material-symbols-outlined">update</span>
    </button>
  </form>
);

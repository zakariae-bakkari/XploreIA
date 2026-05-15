import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { authApi } from '../api';
import { StepEmail, StepCode, StepPassword } from '../components/auth/ForgotSteps';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await authApi.forgotPassword(email);
      if (res.status === 'success') {
        setMessage("Code de vérification envoyé à votre adresse e-mail.");
        setStep(2);
      } else {
        setError(res.message || "Échec de l'envoi du code.");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await authApi.forgotPasswordVerify(code);
      if (res.status === 'success') {
        setMessage("Code vérifié. Vous pouvez maintenant définir un nouveau mot de passe.");
        setStep(3);
      } else {
        setError(res.message || "Code incorrect ou expiré.");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await authApi.resetPassword({
        code,
        password,
        confirm_password: confirmPassword
      });
      if (res.status === 'success') {
        setMessage("Mot de passe réinitialisé avec succès !");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(res.message || "Échec de la réinitialisation.");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: 'var(--lg)', textAlign: 'center' }}>
        <div style={{ marginBottom: '24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'white' }}>
            {step === 1 ? 'key' : step === 2 ? 'mark_email_read' : 'lock_reset'}
          </span>
        </div>
        
        <h1 className="h2-lg" style={{ color: 'var(--on-surface)', marginBottom: '12px' }}>
          {step === 1 ? 'Mot de passe oublié ?' : step === 2 ? 'Vérification' : 'Nouveau mot de passe'}
        </h1>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '32px', fontSize: '14px' }}>
          {step === 1 
            ? "Entrez votre email pour recevoir un code de vérification." 
            : step === 2 
            ? `Nous avons envoyé un code de 6 chiffres à ${email}`
            : "Choisissez un mot de passe fort pour sécuriser votre compte."}
        </p>

        {error ? (
          <div className="label-sm" style={{ color: 'var(--error)', background: 'rgba(255, 82, 82, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '24px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            {error}
          </div>
        ) : message ? (
          <div className="label-sm" style={{ color: 'var(--primary)', background: 'rgba(0, 219, 233, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '24px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            {message}
          </div>
        ) : null}

        {step === 1 && (
          <StepEmail 
            email={email} 
            setEmail={setEmail} 
            handleSendCode={handleSendCode} 
            loading={loading} 
          />
        )}

        {step === 2 && (
          <StepCode 
            code={code} 
            setCode={setCode} 
            handleVerifyCode={handleVerifyCode} 
            loading={loading} 
            setStep={setStep} 
          />
        )}

        {step === 3 && (
          <StepPassword 
            password={password} 
            setPassword={setPassword} 
            confirmPassword={confirmPassword} 
            setConfirmPassword={setConfirmPassword} 
            handleResetPassword={handleResetPassword} 
            loading={loading} 
          />
        )}

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

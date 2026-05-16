import { Link } from 'react-router-dom';

const SignupForm = ({ 
  step,
  formData, 
  handleChange, 
  handleSignup, 
  verificationCode,
  setVerificationCode,
  handleVerifyCode,
  setStep,
  loading, 
  error, 
  message,
  showPassword, 
  setShowPassword, 
  showConfirmPassword, 
  setShowConfirmPassword 
}) => {
  return (
    <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '48px', borderRadius: '24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 className="h2-lg" style={{ fontSize: '32px', marginBottom: '8px' }}>
          {step === 1 ? 'Créer un Compte' : 'Verifier Votre Email'}
        </h2>
        <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
          {step === 1
            ? 'Entrez vos informations pour commencer votre voyage.'
            : 'Entrez le code a 6 chiffres envoye a votre email.'}
        </p>
      </div>

      {error && <div style={{ color: 'var(--error)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
      {message && <div style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '14px' }}>{message}</div>}

      {step === 1 ? (
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
            {loading ? 'CREATION...' : 'Creer le compte'}
          </button>
        </form>
      ) : (
        <form className="flex flex-col gap-md" onSubmit={handleVerifyCode}>
          <div className="flex flex-col gap-xs">
            <label className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>CODE DE VERIFICATION</label>
            <div className="input-container">
              <span className="material-symbols-outlined input-icon">mark_email_read</span>
              <input
                type="text"
                className="cyber-input"
                placeholder="123456"
                maxLength="6"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }}
              />
            </div>
          </div>

          <button className="btn-primary btn-full" type="submit" disabled={loading} style={{ background: 'var(--primary-container)', color: 'var(--on-primary)', padding: '20px', borderRadius: '12px', marginTop: '16px' }}>
            {loading ? 'VERIFICATION...' : 'Verifier le code'}
          </button>

          <button
            type="button"
            className="btn-text"
            onClick={() => setStep(1)}
            style={{
              marginTop: '8px',
              fontSize: '14px',
              color: 'var(--on-surface-variant)',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Modifier les informations
          </button>
        </form>
      )}

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p className="body-md" style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
          Vous avez déjà un compte ? <Link to="/login" style={{ color: 'white', fontWeight: 'bold', marginLeft: '8px' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;

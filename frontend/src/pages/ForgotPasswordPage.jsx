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
        
        <h1 className="h2-lg" style={{ color: 'var(--on-surface)', marginBottom: '12px' }}>Reset Password</h1>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '32px', fontSize: '14px' }}>
          Enter your email to receive a verification code.
        </p>

        <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
          <div className="input-container">
            <span className="material-symbols-outlined input-icon">mail</span>
            <input 
              type="email" 
              className="cyber-input" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button className="btn-primary btn-full" type="submit" style={{ marginTop: '16px' }}>
            <span>Send Reset Code</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>

        <div style={{ marginTop: '32px' }}>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
            Remember your password? 
            <Link to="/login" style={{ color: 'white', fontWeight: 'bold', marginLeft: '8px' }}>Log in</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

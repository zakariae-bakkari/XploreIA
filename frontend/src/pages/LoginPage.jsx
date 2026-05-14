import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(formData);
      if (data.status === 'success') {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="container flex items-center justify-center" style={{ minHeight: '80vh' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '48px', borderRadius: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="h2-lg" style={{ fontSize: '32px', marginBottom: '12px' }}>Welcome Back</h1>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Sign in to access your AI workspace.</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(255, 180, 171, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-xs">
              <label className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>EMAIL ADDRESS</label>
              <div className="input-container">
                <span className="material-symbols-outlined input-icon">mail</span>
                <input 
                  type="email" 
                  className="cyber-input" 
                  placeholder="name@company.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <label className="label-sm" style={{ color: 'var(--outline)', fontSize: '10px' }}>PASSWORD</label>
              <div className="input-container">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="cyber-input" 
                  style={{ paddingRight: '48px' }}
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <span className="material-symbols-outlined" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--outline)', fontSize: '20px' }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-xs" style={{ cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                <span className="label-sm" style={{ textTransform: 'none', color: 'var(--on-surface-variant)' }}>Remember me</span>
              </label>
              <Link to="/forgot-password" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px' }} className="label-sm">
                Forgot Password?
              </Link>
            </div>

            <button className="btn-primary btn-full" type="submit" disabled={loading} style={{ background: 'var(--primary-container)', color: 'var(--on-primary)', padding: '20px', borderRadius: '12px', marginTop: '16px' }}>
              {loading ? "LOGGING IN..." : "Login to Platform"}
            </button>
          </form>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
              Don't have an account? 
              <Link to="/signup" style={{ color: 'var(--secondary)', fontWeight: 'bold', marginLeft: '8px' }}>Sign up for free</Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

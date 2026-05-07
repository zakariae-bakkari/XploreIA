import React from 'react';
import { LogIn, Mail, Lock } from 'lucide-react';

const LoginForm = ({ formData, handleChange, handleLogin, loading, error, onForgotPassword }) => {
    return (
        <div className="signup-step">
            <div className="signup-header">
                <div className="icon-wrapper">
                    <LogIn size={32} />
                </div>
                <h1>Welcome Back</h1>
                <p>Sign in to your XploreIA account.</p>
            </div>

            <form onSubmit={handleLogin}>
                <div className="input-group">
                    <Mail className="input-icon" size={20} />
                    <input
                        type="email" name="email" placeholder="Email Address"
                        value={formData.email} onChange={handleChange} required
                    />
                </div>
                <div className="input-group">
                    <Lock className="input-icon" size={20} />
                    <input
                        type="password" name="password" placeholder="Password"
                        value={formData.password} onChange={handleChange} required
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="signup-btn" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'} <LogIn size={20} />
                </button>
            </form>

            <p className="resend-text" style={{ marginTop: '20px' }}>
                Forgot your password?{' '}
                <button type="button" onClick={onForgotPassword}>Reset it</button>
            </p>

            <p className="resend-text">
                Don't have an account?{' '}
                <button type="button" onClick={() => window.location.href = '/signup'}>Sign up</button>
            </p>
        </div>
    );
};

export default LoginForm;

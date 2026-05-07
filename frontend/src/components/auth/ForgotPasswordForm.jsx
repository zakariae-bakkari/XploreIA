import React from 'react';
import { Mail, ArrowRight, KeyRound } from 'lucide-react';

const ForgotPasswordForm = ({ email, setEmail, handleSubmit, loading, error }) => {
    return (
        <div className="signup-step">
            <div className="signup-header">
                <div className="icon-wrapper">
                    <KeyRound size={32} />
                </div>
                <h1>Reset Password</h1>
                <p>Enter your email to receive a verification code.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <Mail className="input-icon" size={20} />
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="signup-btn" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Code'} <ArrowRight size={20} />
                </button>
                
                <p className="resend-text">
                    Remember your password? <button type="button" onClick={() => window.location.href = '/login'}>Log in</button>
                </p>
            </form>
        </div>
    );
};

export default ForgotPasswordForm;

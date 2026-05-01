import React from 'react';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

const SignupForm = ({ formData, handleChange, handleSignup, loading, error }) => {
    return (
        <div className="signup-step">
            <div className="signup-header">
                <div className="icon-wrapper">
                    <User size={32} />
                </div>
                <h1>Create Account</h1>
                <p>Join XploreIA and discover the best AI tools.</p>
            </div>

            <form onSubmit={handleSignup}>
                <div className="input-group">
                    <User className="input-icon" size={20} />
                    <input 
                        type="text" name="name" placeholder="Full Name" 
                        value={formData.name} onChange={handleChange} required 
                    />
                </div>
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
                <div className="input-group">
                    <Lock className="input-icon" size={20} />
                    <input 
                        type="password" name="confirmPassword" placeholder="Confirm Password" 
                        value={formData.confirmPassword} onChange={handleChange} required 
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="signup-btn" disabled={loading}>
                    {loading ? 'Processing...' : 'Next Step'} <ArrowRight size={20} />
                </button>
            </form>
        </div>
    );
};

export default SignupForm;

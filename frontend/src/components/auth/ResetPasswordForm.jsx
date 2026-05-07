import React from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const ResetPasswordForm = ({ formData, handleChange, handleSubmit, loading, error }) => {
    return (
        <div className="signup-step">
            <div className="signup-header">
                <div className="icon-wrapper accent">
                    <ShieldCheck size={32} />
                </div>
                <h1>New Password</h1>
                <p>Create a new strong password.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <Lock className="input-icon" size={20} />
                    <input 
                        type="password" name="password" placeholder="New Password" 
                        value={formData.password} onChange={handleChange} required minLength="8"
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
                    {loading ? 'Saving...' : 'Save Password'} <ArrowRight size={20} />
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordForm;

import React from 'react';
import { ShieldCheck } from 'lucide-react';

const VerificationForm = ({ email, code, setCode, handleVerify, loading, error, success, timer, formatTime, setStep }) => {
    return (
        <div className="signup-step">
            <div className="signup-header">
                <div className="icon-wrapper accent">
                    <ShieldCheck size={32} />
                </div>
                <h1>Verify Email</h1>
                <p>We've sent a 6-digit code to <strong>{email}</strong>.</p>
                <div className={`countdown ${timer < 60 ? 'urgent' : ''}`}>
                    Expires in: {formatTime(timer)}
                </div>
            </div>

            <form onSubmit={handleVerify}>
                <div className="code-input-wrapper">
                    <input 
                        type="text" 
                        maxLength="6" 
                        placeholder="000000"
                        className="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        disabled={timer === 0}
                    />
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button type="submit" className="signup-btn" disabled={loading || timer === 0}>
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
                
                <p className="resend-text">
                    Didn't receive code? <button type="button" onClick={() => setStep(1)}>Go back</button>
                </p>
            </form>
        </div>
    );
};

export default VerificationForm;

import React, { useState, useEffect } from 'react';
import { authApi } from '../api';
import '../styling/signup.css';

// Components
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import VerificationForm from '../components/auth/VerificationForm';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import SuccessStep from '../components/auth/SuccessStep';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: Verification, 3: Reset, 4: Success
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    // Countdown Timer Effect
    useEffect(() => {
        let interval = null;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0 && step === 2) {
            setError('Verification code expired. Please request a new one.');
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Step 1: Send Email
    const handleSendEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const data = await authApi.forgotPassword(email);

            if (data.status === 'success') {
                setStep(2);
                setSuccess('Verification code sent to your email!');
                const remaining = data.expires_at - Math.floor(Date.now() / 1000);
                setTimer(remaining > 0 ? remaining : 900);
            } else {
                setError(data.message || 'Failed to send verification code');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify Code
    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const data = await authApi.forgotPasswordVerify(code);

            if (data.status === 'success') {
                setStep(3);
                setSuccess('');
                setError('');
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleReset = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const data = await authApi.resetPassword({
                code: code,
                password: formData.password,
                confirm_password: formData.confirmPassword
            });

            if (data.status === 'success') {
                setStep(4);
                setSuccess('Password reset successfully!');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-glass">
                {step === 1 && (
                    <ForgotPasswordForm 
                        email={email} 
                        setEmail={setEmail} 
                        handleSubmit={handleSendEmail} 
                        loading={loading} 
                        error={error} 
                    />
                )}

                {step === 2 && (
                    <VerificationForm 
                        email={email}
                        code={code}
                        setCode={setCode}
                        handleVerify={handleVerify}
                        loading={loading}
                        error={error}
                        success={success}
                        timer={timer}
                        formatTime={formatTime}
                        setStep={setStep}
                        title="Verify Reset Code"
                        buttonText="Verify Code"
                    />
                )}

                {step === 3 && (
                    <ResetPasswordForm 
                        formData={formData}
                        handleChange={handleChange}
                        handleSubmit={handleReset}
                        loading={loading}
                        error={error}
                    />
                )}

                {step === 4 && (
                    <SuccessStep 
                        title="Password Reset Successful!"
                        message="Your password has been changed securely. Redirecting you to login..."
                    />
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;

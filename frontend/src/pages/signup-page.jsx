import React, { useState, useEffect } from 'react';
import { authApi } from '../api';
import './signup.css';

// Small Components
import SignupForm from '../components/auth/SignupForm';
import VerificationForm from '../components/auth/VerificationForm';
import SuccessStep from '../components/auth/SuccessStep';

const SignupPage = () => {
    const [step, setStep] = useState(1); // 1: Form, 2: Verification, 3: Success
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [code, setCode] = useState('');
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
            setError('Verification code expired. Please sign up again.');
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const data = await authApi.signup({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            if (data.status === 'success') {
                setStep(2);
                setSuccess('Verification code sent to your email!');
                const remaining = data.expires_at - Math.floor(Date.now() / 1000);
                setTimer(remaining > 0 ? remaining : 900);
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await authApi.verifyCode(code);

            if (data.status === 'success') {
                setStep(3);
                setSuccess('Account created successfully!');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                setError(data.message || 'Verification failed');
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
                    <SignupForm 
                        formData={formData} 
                        handleChange={handleChange} 
                        handleSignup={handleSignup} 
                        loading={loading} 
                        error={error} 
                    />
                )}

                {step === 2 && (
                    <VerificationForm 
                        email={formData.email}
                        code={code}
                        setCode={setCode}
                        handleVerify={handleVerify}
                        loading={loading}
                        error={error}
                        success={success}
                        timer={timer}
                        formatTime={formatTime}
                        setStep={setStep}
                    />
                )}

                {step === 3 && <SuccessStep />}
            </div>
        </div>
    );
};

export default SignupPage;

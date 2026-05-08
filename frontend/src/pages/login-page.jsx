import React, { useState } from 'react';
import { authApi } from '../api';
import './login.css';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const data = await authApi.login({
                email: formData.email,
                password: formData.password
            });

            if (data.status === 'success') {
                // Redirect to home page on success
                window.location.href = '/';
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        window.location.href = '/forgot-password';
    };

    return (
        <div className="login-container">
            <div className="login-glass">
                <LoginForm 
                    formData={formData} 
                    handleChange={handleChange} 
                    handleLogin={handleLogin} 
                    loading={loading} 
                    error={error} 
                    onForgotPassword={handleForgotPassword}
                />
            </div>
        </div>
    );
};

export default LoginPage;

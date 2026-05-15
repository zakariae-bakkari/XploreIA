import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';

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
      setError(err.message || "Identifiants invalides. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="container flex items-center justify-center" style={{ minHeight: '80vh' }}>
        <LoginForm 
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

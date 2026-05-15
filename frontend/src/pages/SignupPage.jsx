import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import SignupInfo from '../components/auth/SignupInfo';
import SignupForm from '../components/auth/SignupForm';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await signup(formData);
      if (data.status === 'success') {
        navigate('/login');
      } else {
        setError(data.message || "Échec de l'inscription.");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="container flex items-center justify-between gap-xl" style={{ minHeight: '80vh', padding: '64px 0' }}>
        <SignupInfo />
        <SignupForm 
          formData={formData}
          handleChange={handleChange}
          handleSignup={handleSignup}
          loading={loading}
          error={error}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
        />
      </div>
    </AuthLayout>
  );
};

export default SignupPage;

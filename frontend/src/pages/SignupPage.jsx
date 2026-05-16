import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import SignupInfo from '../components/auth/SignupInfo';
import SignupForm from '../components/auth/SignupForm';

const SignupPage = () => {
  const { signup, verifySignupCode } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await signup(formData);
      if (data.status === 'success') {
        setStep(2);
        setMessage("Un code de verification a ete envoye a votre email.");
      } else {
        setError(data.message || "Échec de l'inscription.");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await verifySignupCode(verificationCode);
      if (data.status === 'success') {
        setMessage("Compte verifie avec succes.");
        navigate('/dashboard');
      } else {
        setError(data.message || 'Code incorrect ou expire.');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="container flex items-center justify-between gap-xl" style={{ minHeight: '80vh', padding: '64px 0' }}>
        <SignupInfo />
        <SignupForm 
          step={step}
          formData={formData}
          handleChange={handleChange}
          handleSignup={handleSignup}
          verificationCode={verificationCode}
          setVerificationCode={setVerificationCode}
          handleVerifyCode={handleVerifyCode}
          setStep={setStep}
          loading={loading}
          error={error}
          message={message}
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

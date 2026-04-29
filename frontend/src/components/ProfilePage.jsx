import { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import './ProfilePage.css';

const ProfilePage = () => {
    const userEmail = 'noureddine@gmail.com';
    const [userData, setUserData] = useState({ name: 'Noureddine Oubraim', profile_url: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // UI States
    const [activeSection, setActiveSection] = useState('profile'); // 'profile', 'password', 'danger'
    
    // Password flow states
    const [passStep, setPassStep] = useState(1); // 1: initial, 2: forgot-code, 3: reset-new
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [mockCode, setMockCode] = useState('');
    const [timer, setTimer] = useState(900); // 15:00

    const [isEditingName, setIsEditingName] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [tempPhotoUrl, setTempPhotoUrl] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    useEffect(() => {
        let interval;
        if (passStep === 2 && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [passStep, timer]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    // 1. MODIFIER PROFIL (Photo)
    const handleUpdatePhoto = async (url) => {
        try {
            const res = await apiRequest('users/update-photo', {
                method: 'POST',
                body: JSON.stringify({ email: userEmail, profile_url: url })
            });
            if (res.status === 'success') {
                setUserData({ ...userData, profile_url: url });
                showMsg('success', res.message);
            }
        } catch (err) {
            showMsg('error', err.message);
        }
    };

    // 3. MODIFIER PROFIL (Nom)
    const handleUpdateName = async (newName) => {
        try {
            const res = await apiRequest('users/update-name', {
                method: 'POST',
                body: JSON.stringify({ email: userEmail, name: newName })
            });
            if (res.status === 'success') {
                setUserData({ ...userData, name: newName });
                showMsg('success', res.message);
            }
        } catch (err) {
            showMsg('error', err.message);
        }
    };

    // 2. MODIFIER PROFIL (Password)
    const handleVerifyOldPassword = async () => {
        try {
            await apiRequest('users/change-password', {
                method: 'POST',
                body: JSON.stringify({ email: userEmail, old_password: oldPassword, new_password: oldPassword }) 
            });
            setPassStep(3);
        } catch (err) {
            showMsg('error', 'Ancien mot de passe incorrect');
        }
    };

    const handleForgotPassword = async () => {
        try {
            const res = await apiRequest('users/send-reset-code', { method: 'POST', body: JSON.stringify({ email: userEmail }) });
            setMockCode(res.code);
            setPassStep(2);
            setTimer(900);
            showMsg('success', 'Code envoyé à votre email');
        } catch (err) {
            showMsg('error', err.message);
        }
    };

    const handleVerifyCode = () => {
        if (resetCode === mockCode) {
            setPassStep(3);
        } else {
            showMsg('error', 'Code erroné');
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            showMsg('error', 'Les mots de passe ne sont pas identiques');
            return;
        }
        try {
            const res = await apiRequest('users/reset-password', {
                method: 'POST',
                body: JSON.stringify({ email: userEmail, new_password: newPassword })
            });
            showMsg('success', res.message);
            setPassStep(1);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            showMsg('error', err.message);
        }
    };

    // 4. SUPPRIMER PROFIL (Compte)
    const handleDeleteAccount = async (pwd) => {
        try {
            await apiRequest('users/delete-account', {
                method: 'POST',
                body: JSON.stringify({ email: userEmail, password: pwd })
            });
            showMsg('success', 'Compte supprimé avec succès');
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            showMsg('error', 'Mot de passe incorrecte');
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-nav">
                <button className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>Profil</button>
                <button className={activeSection === 'password' ? 'active' : ''} onClick={() => setActiveSection('password')}>Sécurité</button>
                <button className={activeSection === 'danger' ? 'active' : ''} onClick={() => setActiveSection('danger')}>Compte</button>
            </div>

            {message.text && <div className={`message-banner ${message.type}`}>{message.text}</div>}

            <div className="section-content">
                {activeSection === 'profile' && (
                    <div className="card">
                        <h2>Informations du Profil</h2>
                        
                        <div className="profile-photo-section">
                            <div className="current-photo">
                                {userData.profile_url ? <img src={userData.profile_url} alt="Profil" /> : <div className="avatar-placeholder">N</div>}
                            </div>
                            <div className="photo-actions">
                                <button className="primary-btn" onClick={() => setShowPhotoModal(true)}>Changer profil</button>
                                <button className="outline-btn" onClick={() => handleUpdatePhoto(null)}>Supprimer ma photo</button>
                            </div>
                        </div>

                        {showPhotoModal && (
                            <div className="modal-overlay">
                                <div className="modal-card">
                                    <h3>Modifier la photo de profil</h3>
                                    <p>Saisissez le lien URL de votre nouvelle photo :</p>
                                    <input 
                                        type="text" 
                                        placeholder="https://exemple.com/photo.jpg" 
                                        value={tempPhotoUrl}
                                        onChange={e => setTempPhotoUrl(e.target.value)}
                                    />
                                    <div className="modal-actions">
                                        <button className="outline-btn" onClick={() => setShowPhotoModal(false)}>Annuler</button>
                                        <button className="primary-btn" onClick={() => {
                                            handleUpdatePhoto(tempPhotoUrl);
                                            setShowPhotoModal(false);
                                        }}>Enregistrer</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Nom complet</label>
                            <div className="input-group">
                                {isEditingName ? (
                                    <>
                                        <input type="text" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} />
                                        <button className="save-btn" onClick={() => {
                                            handleUpdateName(userData.name);
                                            setIsEditingName(false);
                                        }}>Enregistrer</button>
                                        <button className="text-btn" onClick={() => setIsEditingName(false)}>Annuler</button>
                                    </>
                                ) : (
                                    <>
                                        <span className="name-display">{userData.name}</span>
                                        <button className="edit-icon-btn" onClick={() => setIsEditingName(true)}>✏️ Modifier le nom</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'password' && (
                    <div className="card">
                        <h2>Changer le mot de passe</h2>
                        
                        {passStep === 1 && (
                            <div className="pass-step-1">
                                <label>Saisissez votre ancien mot de passe</label>
                                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                                <div className="actions">
                                    <button className="primary-btn" onClick={handleVerifyOldPassword}>Continuer</button>
                                    <button className="forgot-pass-btn" onClick={handleForgotPassword}>Mot de passe oublié ?</button>
                                </div>
                            </div>
                        )}

                        {passStep === 2 && (
                            <div className="pass-step-2">
                                <p>Un code a été envoyé. Il expire dans <strong>{formatTime(timer)}</strong></p>
                                <label>Saisissez le code reçu</label>
                                <input type="text" placeholder="123456" value={resetCode} onChange={e => setResetCode(e.target.value)} />
                                <button className="primary-btn" onClick={handleVerifyCode}>Vérifier le code</button>
                            </div>
                        )}

                        {passStep === 3 && (
                            <div className="pass-step-3">
                                <label>Nouveau mot de passe</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                <label>Valider le mot de passe</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                                <button className="primary-btn" onClick={handleResetPassword}>Changer mot de passe</button>
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'danger' && (
                    <div className="card danger-card">
                        <h2>Supprimer mon compte</h2>
                        <p>Cette action est irréversible. Toutes vos données seront désactivées.</p>
                        <button className="danger-btn" onClick={() => setShowDeleteModal(true)}>Supprimer mon compte</button>

                        {showDeleteModal && (
                            <div className="modal-overlay">
                                <div className="modal-card">
                                    <h3 style={{color: '#dc2626'}}>Confirmer la suppression</h3>
                                    <p>Veuillez saisir votre mot de passe pour confirmer la désactivation définitive de votre compte :</p>
                                    <input 
                                        type="password" 
                                        placeholder="Votre mot de passe" 
                                        value={deletePassword}
                                        onChange={e => setDeletePassword(e.target.value)}
                                    />
                                    <div className="modal-actions">
                                        <button className="outline-btn" onClick={() => setShowDeleteModal(false)}>Annuler</button>
                                        <button className="danger-btn" onClick={() => {
                                            handleDeleteAccount(deletePassword);
                                            setShowDeleteModal(false);
                                        }}>Confirmer la suppression</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;

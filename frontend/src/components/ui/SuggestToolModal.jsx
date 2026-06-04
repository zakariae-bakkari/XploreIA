import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';

const SuggestToolModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [pricing, setPricing] = useState('freemium');
  const [category, setCategory] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset form
      setName('');
      setDescription('');
      setUrl('');
      setPricing('freemium');
      setCategory('');
      setValidationResult(null);
      setError('');
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await apiRequest('filters');
        if (res.status === 'success' && res.data?.categories) {
          setCategories(res.data.categories);
          if (res.data.categories.length > 0) {
            setCategory(res.data.categories[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setValidating(true);
    setError('');
    setValidationResult(null);

    try {
      const res = await apiRequest('ai-tools/suggest', {
        method: 'POST',
        body: JSON.stringify({
          name: name,
          description: description,
          website_url: url,
          main_category_id: category,
          pricing_model: pricing
        })
      });

      if (res.status === 'success') {
        setValidationResult({
          valid: res.valid,
          message: res.message,
          data: res.data
        });
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || "Une erreur est survenue lors de la suggestion.");
      }
    } catch (err) {
      setError("Erreur inattendue. Veuillez réessayer.");
    } finally {
      setLoading(false);
      setValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="at-modal-overlay">
      <div className="at-modal-content" style={{ maxWidth: '550px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 className="at-modal-title">Suggérer un Outil IA</h3>
            <p className="at-modal-desc">Suggérez un outil manquant. Notre IA va instantanément valider son existence et l'ajouter s'il est légitime.</p>
          </div>
          {!loading && (
            <button 
              onClick={onClose} 
              style={{ background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {error && <div className="at-error-banner">{error}</div>}

        {/* Validation result view */}
        {validationResult ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: validationResult.valid ? 'rgba(69, 207, 123, 0.12)' : 'rgba(255, 74, 118, 0.12)', 
              color: validationResult.valid ? '#45cf7b' : '#ff4a76',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
                {validationResult.valid ? 'check_circle' : 'cancel'}
              </span>
            </div>
            
            <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
              {validationResult.valid ? 'Suggestion Approuvée !' : 'Suggestion Rejetée'}
            </h4>
            
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              {validationResult.message}
            </p>

            <button onClick={onClose} className="at-btn-submit" style={{ width: '100%' }}>
              Fermer
            </button>
          </div>
        ) : validating ? (
          /* AI Validation Loading View */
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="loader" style={{ 
              border: '3px solid rgba(255, 255, 255, 0.05)',
              borderTop: '3px solid var(--primary)',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 24px auto'
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
              Validation IA en cours...
            </h4>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '13px' }}>
              Notre agent intelligent recherche des informations sur l'outil et valide sa légitimité dans la base de données.
            </p>
          </div>
        ) : (
          /* Suggestion Form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            <div className="at-form-group">
              <label>Nom de l'outil IA *</label>
              <input 
                type="text" 
                className="at-input" 
                placeholder="Ex. Claude 3.5 Sonnet, Cursor, v0"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="at-form-group">
              <label>Description (Optionnel)</label>
              <textarea 
                className="at-input at-textarea" 
                placeholder="Décrivez brièvement ce que fait cet outil..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="at-form-group">
              <label>URL du site officiel</label>
              <input 
                type="url" 
                className="at-input" 
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="at-form-row">
              <div className="at-form-group" style={{ flex: 1 }}>
                <label>Modèle tarifaire</label>
                <select 
                  className="at-input" 
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  style={{ background: '#1e1e24' }}
                >
                  <option value="free">Gratuit (Free)</option>
                  <option value="freemium">Freemium</option>
                  <option value="premium">Payant (Premium)</option>
                </select>
              </div>

              <div className="at-form-group" style={{ flex: 1 }}>
                <label>Catégorie</label>
                <select 
                  className="at-input" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ background: '#1e1e24' }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="at-modal-actions">
              <button type="button" onClick={onClose} className="at-btn-cancel">
                Annuler
              </button>
              <button type="submit" className="at-btn-submit" disabled={!name.trim()}>
                Suggérer à l'IA
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SuggestToolModal;

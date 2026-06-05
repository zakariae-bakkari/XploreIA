import React, { useState, useEffect } from 'react';
import { apiRequest, suggestionApi } from '../../api';
import CustomSelect from './CustomSelect';

const DynamicListInput = ({ items, setItems, label, placeholder }) => {
  const addItem = () => setItems([...items, ""]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, val) => {
    const copy = [...items];
    copy[i] = val;
    setItems(copy);
  };

  return (
    <div className="at-form-group">
      <label>{label}</label>
      {items.map((item, i) => (
        <div key={i} className="at-dynamic-row">
          <input 
            className="at-input" 
            value={item} 
            onChange={(e) => updateItem(i, e.target.value)} 
            placeholder={`${placeholder} ${i + 1}`} 
          />
          {items.length > 1 && (
            <button type="button" className="at-remove-btn" onClick={() => removeItem(i)}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          )}
        </div>
      ))}
      <button type="button" className="at-add-btn" onClick={addItem} style={{ marginTop: "4px" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Ajouter
      </button>
    </div>
  );
};

const RelationChipsSelect = ({ selectedIds, setSelectedIds, allItems, label, placeholder }) => {
  const handleAdd = (id) => {
    if (id && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemove = (id) => {
    setSelectedIds(selectedIds.filter(x => x !== id));
  };

  return (
    <div className="at-form-group">
      <label>{label}</label>
      {selectedIds.length > 0 && (
        <div className="char-chips-grid" style={{ marginBottom: "12px" }}>
          {selectedIds.map(id => {
            const itemObj = allItems.find(x => String(x.id) === String(id));
            if (!itemObj) return null;
            return (
              <div 
                key={id} 
                className="char-chip" 
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", margin: "2px" }}
              >
                <span>{itemObj.name}</span>
                <span 
                  className="material-symbols-outlined char-delete-icon" 
                  style={{ fontSize: "16px" }} 
                  onClick={() => handleRemove(id)}
                >
                  close
                </span>
              </div>
            );
          })}
        </div>
      )}
      <CustomSelect
        value=""
        onChange={handleAdd}
        placeholder={placeholder}
        options={allItems
          .filter(x => !selectedIds.includes(x.id))
          .map(x => ({ value: x.id, label: x.name }))
        }
      />
    </div>
  );
};

const SuggestToolModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [pricing, setPricing] = useState('freemium');
  const [category, setCategory] = useState('');
  
  // Relations
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedChars, setSelectedChars] = useState([]);
  const [advantages, setAdvantages] = useState(['']);
  const [disadvantages, setDisadvantages] = useState(['']);

  const [categories, setCategories] = useState([]);
  const [allCharacteristics, setAllCharacteristics] = useState([]);
  const [allModels, setAllModels] = useState([]);

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
      setSelectedModels([]);
      setSelectedChars([]);
      setAdvantages(['']);
      setDisadvantages(['']);
      setValidationResult(null);
      setError('');
      return;
    }

    const fetchFormData = async () => {
      try {
        const res = await suggestionApi.getFormData();
        if (res.success && res.data) {
          setCategories(res.data.categories || []);
          setAllCharacteristics(res.data.characteristics || []);
          setAllModels(res.data.models || []);
          if (res.data.categories && res.data.categories.length > 0) {
            setCategory(res.data.categories[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load suggestions reference data", err);
      }
    };
    fetchFormData();
  }, [isOpen]);

  const pricingOptions = [
    { value: 'free', label: 'Gratuit (Free)' },
    { value: 'freemium', label: 'Freemium' },
    { value: 'premium', label: 'Payant (Premium)' }
  ];

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setValidating(true);
    setError('');
    setValidationResult(null);

    try {
      const res = await suggestionApi.submit({
        name: name,
        description: description,
        website_url: url,
        main_category_id: category,
        pricing_model: pricing,
        model_ids: selectedModels,
        characteristic_ids: selectedChars,
        advantages: advantages.filter(x => x.trim()),
        disadvantages: disadvantages.filter(x => x.trim())
      });

      if (res.success) {
        setValidationResult({
          valid: true,
          message: res.message,
          ai_score: res.data.ai_score,
          ai_feedback: res.data.ai_feedback,
          automatically_approved: res.data.automatically_approved
        });
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Une erreur est survenue lors de la suggestion.");
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
    <>
      <style>{`
        @keyframes atFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes atSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .at-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10, 10, 12, 0.85) !important;
          backdrop-filter: blur(12px) !important;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999 !important;
          animation: atFadeIn 0.2s ease-out;
          padding: 16px;
        }
        .at-modal-content {
          background: #141418 !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 24px !important;
          width: 100%;
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px !important;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6) !important;
          animation: atSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          color: white !important;
          text-align: left !important;
        }
        .at-modal-title {
          font-size: 24px !important;
          font-weight: 800 !important;
          margin-bottom: 8px !important;
          color: white !important;
        }
        .at-modal-desc {
          font-size: 13px !important;
          color: rgba(255, 255, 255, 0.6) !important;
          margin-bottom: 24px !important;
          line-height: 1.6 !important;
        }
        .at-form-group {
          margin-bottom: 20px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
          text-align: left !important;
        }
        .at-form-group label {
          font-size: 11px !important;
          font-weight: 700 !important;
          color: rgba(255, 255, 255, 0.5) !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
        }
        .at-form-row {
          display: flex !important;
          gap: 16px !important;
        }
        .at-input {
          padding: 12px 16px !important;
          border-radius: 12px !important;
          background: rgba(255, 255, 255, 0.04) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: white !important;
          outline: none !important;
          font-family: inherit !important;
          font-size: 14px !important;
          transition: all 0.2s ease !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .at-input:focus {
          border-color: var(--primary) !important;
          background: rgba(255, 255, 255, 0.06) !important;
          box-shadow: 0 0 0 3px rgba(0, 219, 233, 0.15) !important;
        }
        .at-textarea {
          resize: vertical !important;
          min-height: 100px !important;
        }
        .at-modal-actions {
          display: flex !important;
          justify-content: flex-end !important;
          gap: 12px !important;
          margin-top: 24px !important;
        }
        .at-btn-cancel, .at-btn-submit {
          padding: 12px 24px !important;
          border-radius: 12px !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          border: none !important;
          transition: all 0.2s ease !important;
        }
        .at-btn-cancel {
          background: rgba(255, 255, 255, 0.05) !important;
          color: white !important;
        }
        .at-btn-cancel:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        .at-btn-submit {
          background: var(--primary) !important;
          color: #0b0b0f !important;
        }
        .at-btn-submit:hover {
          background: #00bcd4 !important;
          box-shadow: 0 4px 16px rgba(0, 219, 233, 0.3) !important;
        }
        .at-btn-submit:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }
        .at-error-banner {
          background: rgba(255, 74, 118, 0.1) !important;
          border: 1px solid rgba(255, 74, 118, 0.2) !important;
          color: #ff4a76 !important;
          padding: 12px 16px !important;
          border-radius: 12px !important;
          margin-bottom: 20px !important;
          font-size: 13px !important;
        }
      `}</style>
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
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: validationResult.automatically_approved ? 'rgba(69, 207, 123, 0.12)' : 'rgba(102, 126, 234, 0.12)', 
                color: validationResult.automatically_approved ? '#45cf7b' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
                  {validationResult.automatically_approved ? 'check_circle' : 'hourglass_empty'}
                </span>
              </div>
              
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                {validationResult.automatically_approved ? 'Suggestion Publiée !' : 'Suggestion en Attente'}
              </h4>
              
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
                {validationResult.message}
              </p>

              {validationResult.ai_score !== undefined && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  textAlign: 'left',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Évaluation de l'IA</span>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '800',
                      color: validationResult.ai_score >= 70 ? '#45cf7b' : 
                             validationResult.ai_score >= 50 ? '#ffb020' : '#ff4a76'
                    }}>
                      {validationResult.ai_score}/100
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--outline)', lineHeight: '1.5', margin: 0 }}>
                    {validationResult.ai_feedback}
                  </p>
                </div>
              )}

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
            <form onSubmit={handleSubmit} className="flex flex-col gap-md" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
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
                  <CustomSelect
                    id="suggest-pricing-select"
                    value={pricing}
                    onChange={(val) => setPricing(val)}
                    options={pricingOptions}
                  />
                </div>

                <div className="at-form-group" style={{ flex: 1 }}>
                  <label>Catégorie</label>
                  <CustomSelect
                    id="suggest-category-select"
                    value={category}
                    onChange={(val) => setCategory(val)}
                    options={categoryOptions}
                    placeholder="Sélectionner une catégorie"
                  />
                </div>
              </div>

              {/* Models selection */}
              <RelationChipsSelect
                selectedIds={selectedModels}
                setSelectedIds={setSelectedModels}
                allItems={allModels}
                label="Modèles IA utilisés (Optionnel)"
                placeholder="Sélectionner un modèle..."
              />

              {/* Characteristics selection */}
              <RelationChipsSelect
                selectedIds={selectedChars}
                setSelectedIds={setSelectedChars}
                allItems={allCharacteristics}
                label="Caractéristiques (Optionnel)"
                placeholder="Sélectionner une caractéristique..."
              />

              {/* Advantages dynamic input */}
              <DynamicListInput
                items={advantages}
                setItems={setAdvantages}
                label="Avantages"
                placeholder="Avantage"
              />

              {/* Disadvantages dynamic input */}
              <DynamicListInput
                items={disadvantages}
                setItems={setDisadvantages}
                label="Inconvénients"
                placeholder="Inconvénient"
              />

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
    </>
  );
};

export default SuggestToolModal;

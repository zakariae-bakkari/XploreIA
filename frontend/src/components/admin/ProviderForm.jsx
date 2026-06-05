import React, { useState, useEffect } from 'react';
import SearchableSelect from '../../components/ui/SearchableSelect';

const ProviderForm = ({ provider, onSubmit, onCancel }) => {
  const prov = provider || {};
  const [form, setForm] = useState({
    id: prov.id || null,
    name: prov.name || '',
    country: prov.country || '',
    description: prov.description || '',
    ceo: prov.ceo || '',
    date_founded: prov.date_founded || '',
    website_url: prov.website_url || '',
    logo_url: prov.logo_url || '',
    status: prov.status || 'active',
  });

  useEffect(() => {
    const p = provider || {};
    setForm({
      id: p.id || null,
      name: p.name || '',
      country: p.country || '',
      description: p.description || '',
      ceo: p.ceo || '',
      date_founded: p.date_founded || '',
      website_url: p.website_url || '',
      logo_url: p.logo_url || '',
      status: p.status || 'active',
    });
  }, [provider]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!form.name || form.name.trim() === '') {
      setIsSubmitting(false);
      alert('Le nom est requis');
      return;
    }

    try {
      if (typeof onSubmit === 'function') {
        await onSubmit(form);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="provider-form-cyber">
      <style>{`
        .provider-form-cyber {
          padding: 8px;
        }
        .form-grid-cyber {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .form-grid-cyber {
            grid-template-columns: 1fr;
          }
        }
        .form-group-cyber {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group-cyber.full-width {
          grid-column: 1 / -1;
        }
        .form-group-cyber label {
          font-size: 13px;
          font-weight: 600;
          color: var(--outline);
        }
        .cyber-text-input {
          padding: 12px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--on-background);
          outline: none;
          font-family: inherit;
          font-size: 14px;
          transition: all 0.2s ease;
          width: 100%;
        }
        .cyber-text-input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 10px rgba(0, 219, 233, 0.15);
        }
        .cyber-textarea {
          resize: vertical;
          min-height: 100px;
        }
        .form-actions-cyber {
          margin-top: 32px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 20px;
        }
        .btn-cancel-cyber {
          background: rgba(255, 255, 255, 0.05);
          color: var(--on-background);
          border: none;
          padding: 12px 24px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-cancel-cyber:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .btn-submit-cyber {
          background: var(--primary);
          color: #0b0b0f;
          border: none;
          padding: 12px 24px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-submit-cyber:hover:not(:disabled) {
          background: #00bcd4;
          box-shadow: 0 4px 12px rgba(0, 219, 233, 0.3);
        }
        .btn-submit-cyber:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="form-grid-cyber">
        <div className="form-group-cyber">
          <label>Nom</label>
          <input
            className="cyber-text-input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ex: OpenAI"
            required
          />
        </div>
        <div className="form-group-cyber">
          <label>Pays</label>
          <input
            className="cyber-text-input"
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder="Ex: États-Unis"
          />
        </div>

        <div className="form-group-cyber full-width">
          <label>Description</label>
          <textarea
            className="cyber-text-input cyber-textarea"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description succincte de l'entreprise..."
          />
        </div>

        <div className="form-group-cyber">
          <label>CEO</label>
          <input
            className="cyber-text-input"
            name="ceo"
            value={form.ceo}
            onChange={handleChange}
            placeholder="Ex: Sam Altman"
          />
        </div>

        <div className="form-group-cyber">
          <label>Date fondation</label>
          <input
            className="cyber-text-input"
            type="date"
            name="date_founded"
            value={form.date_founded}
            onChange={handleChange}
          />
        </div>

        <div className="form-group-cyber">
          <label>Site web</label>
          <input
            className="cyber-text-input"
            name="website_url"
            value={form.website_url}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <div className="form-group-cyber">
          <label>Logo URL</label>
          <input
            className="cyber-text-input"
            name="logo_url"
            value={form.logo_url}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div className="form-group-cyber full-width">
          <label>Statut</label>
          <SearchableSelect
            options={[
              { id: 'active', name: 'active' },
              { id: 'pending', name: 'pending' },
              { id: 'rejected', name: 'rejected' },
            ]}
            value={form.status}
            onChange={(val) => setForm(s => ({ ...s, status: val }))}
            placeholder="Sélectionner le statut..."
          />
        </div>
      </div>

      <div className="form-actions-cyber">
        <button
          type="button"
          onClick={() => onCancel && onCancel()}
          className="btn-cancel-cyber"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn-submit-cyber"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
};

export default ProviderForm;


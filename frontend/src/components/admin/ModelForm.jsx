import React, { useState, useEffect } from 'react';
import { aiToolApi, adminApi, adminModelApi } from '../../api';
import SearchableSelect from '../ui/SearchableSelect';
import TagMultiSelect from '../ui/TagMultiSelect';

const ModelForm = ({ model = {}, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    id: model.id || null,
    name: model.name || '',
    description: model.description || '',
    tags: model.tags || '',
    provider_id: model.provider_id || '',
    tool_id: model.tool_id || '',
    characteristics: model.characteristics || [],
    performance: model.performance || {},
  });

  const [filters, setFilters] = useState({ categories: [], characteristics: [] });
  const [tools, setTools] = useState([]);
  const [providers, setProviders] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);

  useEffect(() => {
    setForm({
      id: model.id || null,
      name: model.name || '',
      description: model.description || '',
      tags: model.tags || '',
      provider_id: model.provider_id || '',
      tool_id: model.tool_id || '',
      characteristics: model.characteristics || [],
      performance: model.performance || {},
    });
  }, [model]);

  useEffect(() => {
    const loadFilters = async () => {
      // Load characteristics with their IDs (admincharacteristic returns {id, name, type, status})
      try {
        const charRes = await adminApi.characteristicApi.getAll();
        if (charRes && charRes.status === 'success') {
          const activeChars = (charRes.data || []).filter(c => c.status === 'active');
          setFilters(prev => ({ ...prev, characteristics: activeChars }));
        }
      } catch (e) {
        console.error('Failed to load characteristics:', e);
      }

      const toolsRes = await aiToolApi.getAll();
      if (toolsRes && toolsRes.status === 'success') {
        setTools(toolsRes.data || []);
      }

      try {
        const pj = await aiToolApi.getProviders();
        if (pj && pj.status === 'success') setProviders(pj.data || []);
      } catch (e) {
        console.error(e);
      }

      try {
        const mres = await adminModelApi.getAll();
        if (mres && mres.status === 'success') {
          const tags = new Set();
          (mres.data || []).forEach(md => {
            if (md.tags) {
              md.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => tags.add(t));
            }
          });
          setTagSuggestions(Array.from(tags));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadFilters();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handlePerfChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, performance: { ...s.performance, [name]: value } }));
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.performance) {
      payload.performance.response_quality = payload.performance.response_quality ? parseInt(payload.performance.response_quality, 10) : null;
      payload.performance.speed = payload.performance.speed ? parseInt(payload.performance.speed, 10) : null;
    }
    sendPayload(payload);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const sendPayload = async (payload) => {
    setIsSubmitting(true);
    setSubmitMessage('Envoi des données...');
    try {
      let res;
      if (payload.id) {
        setSubmitMessage('Mise à jour du modèle...');
        res = await adminModelApi.update(payload);
      } else {
        setSubmitMessage('Création du modèle...');
        res = await adminModelApi.create(payload);
      }

      setSubmitMessage('Finalisation...');
      await new Promise(r => setTimeout(r, 300));

      setIsSubmitting(false);
      setSubmitMessage('');

      if (typeof onSubmit === 'function') onSubmit(res);
    } catch (e) {
      setIsSubmitting(false);
      setSubmitMessage('Erreur lors de l\'envoi');
      if (typeof onSubmit === 'function') onSubmit({ status: 'error', message: e.message });
    }
  };

  return (
    <form className="model-form-cyber" onSubmit={submit}>
      <style>{`
        .model-form-cyber {
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
        .perf-fieldset {
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 20px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.01);
        }
        .perf-fieldset legend {
          font-size: 13px;
          font-weight: 700;
          color: var(--primary);
          padding: 0 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-actions-cyber {
          margin-top: 32px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 20px;
          align-items: center;
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
        .submit-status-message {
          color: var(--on-surface-variant);
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      <div className="form-grid-cyber">
        <div className="form-group-cyber">
          <label>Nom</label>
          <input
            className="cyber-text-input"
            placeholder="Nom du modèle"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group-cyber">
          <label>Provider</label>
          <SearchableSelect
            options={providers}
            value={form.provider_id}
            onChange={(val) => setForm(s => ({ ...s, provider_id: val }))}
            placeholder="-- Sélectionner un provider --"
          />
        </div>

        <div className="form-group-cyber full-width">
          <label>Description</label>
          <textarea
            className="cyber-text-input cyber-textarea"
            placeholder="Courte description des capacités ou limites..."
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group-cyber">
          <label>Tool (Associer à un AI Tool)</label>
          <SearchableSelect
            options={tools}
            value={form.tool_id}
            onChange={(val) => setForm(s => ({ ...s, tool_id: val }))}
            placeholder="-- Sélectionner un outil --"
          />
        </div>

        <div className="form-group-cyber">
          <label>Caractéristiques (Multiselect)</label>
          <TagMultiSelect
            options={filters.characteristics}
            values={form.characteristics}
            onChange={(vals) => setForm(s => ({ ...s, characteristics: vals }))}
          />
        </div>

        <div className="form-group-cyber full-width">
          <label>Tags</label>
          <TagMultiSelect
            options={(tagSuggestions || []).map(t => ({ id: t, name: t }))}
            values={form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []}
            onChange={(vals) => setForm(s => ({ ...s, tags: vals.join(',') }))}
          />
        </div>

        <div className="form-group-cyber full-width">
          <fieldset className="perf-fieldset">
            <legend>Performance (Optionnel)</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group-cyber">
                <label>Response Quality (0-100)</label>
                <input
                  className="cyber-text-input"
                  name="response_quality"
                  value={form.performance.response_quality || ''}
                  onChange={handlePerfChange}
                  placeholder="Ex: 94"
                />
              </div>
              <div className="form-group-cyber">
                <label>Speed (ms)</label>
                <input
                  className="cyber-text-input"
                  name="speed"
                  value={form.performance.speed || ''}
                  onChange={handlePerfChange}
                  placeholder="Ex: 88"
                />
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      <div className="form-actions-cyber">
        {isSubmitting && submitMessage && (
          <div className="submit-status-message">
            <div className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} />
            {submitMessage}
          </div>
        )}
        <button type="button" onClick={onCancel} className="btn-cancel-cyber">
          Annuler
        </button>
        <button type="submit" className="btn-submit-cyber" disabled={isSubmitting}>
          {isSubmitting ? 'Patientez...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
};

export default ModelForm;


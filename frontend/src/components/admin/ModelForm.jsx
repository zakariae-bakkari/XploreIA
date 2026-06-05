import React, { useState, useEffect } from 'react';
import { aiToolApi } from '../../api';
import SearchableSelect from '../ui/SearchableSelect';
import TagMultiSelect from '../ui/TagMultiSelect';
import { adminModelApi } from '../../api';

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
      const res = await aiToolApi.getFilters();
      if (res && res.status === 'success') {
        setFilters(res.data || { categories: [], characteristics: [] });
      }

      const toolsRes = await aiToolApi.getAll();
      if (toolsRes && toolsRes.status === 'success') {
        setTools(toolsRes.data || []);
      }
      // load providers
      try {
        const pj = await aiToolApi.getProviders();
        if (pj && pj.status === 'success') setProviders(pj.data || []);
      } catch (e) { /* ignore */ }
      // fetch existing model tags to provide suggestions
      try {
        const mres = await adminModelApi.getAll();
        if (mres && mres.status === 'success') {
          const tags = new Set();
          (mres.data || []).forEach(md => {
            if (md.tags) md.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => tags.add(t));
          });
          setTagSuggestions(Array.from(tags));
        }
      } catch (e) { /* ignore */ }
    };
    loadFilters();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleCharacteristicsChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm((s) => ({ ...s, characteristics: options }));
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
      // give user a short moment to see finalisation
      await new Promise(r => setTimeout(r, 300));

      setIsSubmitting(false);
      setSubmitMessage('');

      // propagate result to parent
      if (typeof onSubmit === 'function') onSubmit(res);
    } catch (e) {
      setIsSubmitting(false);
      setSubmitMessage('Erreur lors de l\'envoi');
      if (typeof onSubmit === 'function') onSubmit({ status: 'error', message: e.message });
    }
  };

  return (
    <form className="model-form" onSubmit={submit} style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="label-sm">Nom</label>
          <input className="cyber-input" placeholder="Nom du modèle" name="name" value={form.name} onChange={handleChange} required />
        
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label-sm">Description</label>
          <textarea className="cyber-input" placeholder="Courte description" name="description" value={form.description} onChange={handleChange} style={{ minHeight: 90, paddingTop: 12 }} />
        </div>

        <div>
          <label className="label-sm">Tool (associer à un AI Tool)</label>
          <SearchableSelect options={tools} value={form.tool_id} onChange={(val) => setForm(s => ({ ...s, tool_id: val }))} placeholder="-- Sélectionner un outil --" />
        </div>

        <div>
          <label className="label-sm">Provider</label>
          <SearchableSelect options={providers} value={form.provider_id} onChange={(val) => setForm(s => ({ ...s, provider_id: val }))} placeholder="-- Sélectionner un provider --" />
        </div>

        <div>
          <label className="label-sm">Caractéristiques (multiselect)</label>
          <TagMultiSelect options={filters.characteristics} values={form.characteristics} onChange={(vals) => setForm(s => ({ ...s, characteristics: vals }))} />
        </div>

        <div>
          <label className="label-sm">Tags</label>
          <TagMultiSelect options={(tagSuggestions || []).map(t => ({ id: t, name: t }))} values={form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []} onChange={(vals) => setForm(s => ({ ...s, tags: vals.join(',') }))} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <fieldset style={{ border: '1px solid rgba(255,255,255,0.06)', padding: 12, borderRadius: 8 }}>
            <legend className="label-sm">Performance (optionnel)</legend>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="label-sm">Response quality (0-100)</label>
                <input className="cyber-input" name="response_quality" value={form.performance.response_quality || ''} onChange={handlePerfChange} placeholder="94" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label-sm">Speed (ms)</label>
                <input className="cyber-input" name="speed" value={form.performance.speed || ''} onChange={handlePerfChange} placeholder="88" />
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" onClick={onCancel} className="outline-btn">Annuler</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Patientez...' : 'Enregistrer'}</button>
      </div>

      {isSubmitting && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="spinner" style={{ width: 20, height: 20, borderRadius: 10, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: 'var(--surface-tint)', animation: 'spin 1s linear infinite' }} />
          <div style={{ color: 'var(--on-surface-variant)' }}>{submitMessage}</div>
        </div>
      )}
    </form>
  );
};

export default ModelForm;

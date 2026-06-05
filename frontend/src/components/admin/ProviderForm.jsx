import React, { useState, useEffect } from 'react';
import SearchableSelect from '../../components/ui/SearchableSelect';
import { adminProviderApi } from '../../api';

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
    // Basic client-side validation
    if (!form.name || form.name.trim() === '') {
      setIsSubmitting(false);
      alert('Le nom est requis');
      return;
    }

    // Delegate actual API call to parent via onSubmit(form)
    try {
      if (typeof onSubmit === 'function') onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ padding: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="label-sm">Nom</label>
          <input className="cyber-input" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="label-sm">Pays</label>
          <input className="cyber-input" name="country" value={form.country} onChange={handleChange} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label-sm">Description</label>
          <textarea className="cyber-input" name="description" value={form.description} onChange={handleChange} style={{ minHeight: 90 }} />
        </div>

        <div>
          <label className="label-sm">CEO</label>
          <input className="cyber-input" name="ceo" value={form.ceo} onChange={handleChange} />
        </div>

        <div>
          <label className="label-sm">Date fondation</label>
          <input className="cyber-input" type="date" name="date_founded" value={form.date_founded} onChange={handleChange} />
        </div>

        <div>
          <label className="label-sm">Site web</label>
          <input className="cyber-input" name="website_url" value={form.website_url} onChange={handleChange} />
        </div>

        <div>
          <label className="label-sm">Logo URL</label>
          <input className="cyber-input" name="logo_url" value={form.logo_url} onChange={handleChange} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label-sm">Statut</label>
          <SearchableSelect
            options={[
              { id: 'active', name: 'active' },
              { id: 'pending', name: 'pending' },
              { id: 'rejected', name: 'rejected' },
            ]}
            value={form.status}
            onChange={(val) => setForm(s => ({ ...s, status: val }))}
            placeholder="Sélectionner..."
          />
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" onClick={() => onCancel && onCancel()} className="outline-btn">Annuler</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Patientez...' : 'Enregistrer'}</button>
      </div>
    </form>
  );
};

export default ProviderForm;

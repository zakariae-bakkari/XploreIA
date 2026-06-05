import React, { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import ProviderForm from '../../components/admin/ProviderForm';
import ProviderList from '../../components/admin/ProviderList';
import { adminProviderApi } from '../../api';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

const AdminProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchProviders = async () => {
    setLoading(true);
    const res = await adminProviderApi.getAll();
    if (res && res.status === 'success') setProviders(res.data || []);
    else setProviders([]);
    setLoading(false);
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleCreate = () => { setEditing(null); setShowModal(true); };
  const handleEdit = async (p) => {
    if (!p || !p.id) return;
    const res = await adminProviderApi.getById(p.id);
    if (res && res.status === 'success') setEditing(res.data);
    else setEditing(p);
    setShowModal(true);
  };

  const handleDelete = (id) => { setDeleting(id); };
  const confirmDelete = async () => {
    const id = deleting;
    setDeleting(null);
    const res = await adminProviderApi.delete(id);
    if (res && res.status === 'success') {
      fetchProviders();
      alert('Provider supprimé');
    } else {
      alert(res.message || 'Erreur');
    }
  };

  const handleSubmit = async (data) => {
    // Defensive client-side check before sending
    if (!data || !data.name || data.name.trim() === '') {
      alert('Le nom est requis');
      return;
    }

    try {
      let res;
      if (data.id) res = await adminProviderApi.update(data);
      else res = await adminProviderApi.create(data);

      if (res && res.status === 'success') {
        setShowModal(false);
        fetchProviders();
      } else {
        alert((res && (res.message || JSON.stringify(res))) || 'Erreur serveur');
      }
    } catch (err) {
      alert('Erreur réseau: ' + err.message);
    }
  };

  return (
    <ErrorBoundary>
    <div>
      <div className="page-header">
        <h2 className="page-title">Gestion des providers (Admin)</h2>
        <div className="page-actions">
          <button type="button" className="btn-primary" onClick={handleCreate}>Créer un provider</button>
        </div>
      </div>

      {/* Inline fallback removed to avoid duplicate forms when modal is open */}

      <ProviderList providers={providers} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />

      {showModal && (
        <Modal title={editing?.id ? 'Modifier provider' : 'Créer provider'} className="modal-large" onClose={() => setShowModal(false)}>
          <ProviderForm provider={editing} onCancel={() => setShowModal(false)} onSubmit={handleSubmit} />
        </Modal>
      )}

      {deleting && (
        <Modal title="Confirmer la suppression" className="confirm-modal" onClose={() => setDeleting(null)}>
          <p>Cette action va marquer le provider comme inactif. Voulez-vous continuer ?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button className="btn-ghost" onClick={() => setDeleting(null)}>Annuler</button>
            <button className="danger-btn" onClick={confirmDelete}>Confirmer</button>
          </div>
        </Modal>
      )}
    </div>
    </ErrorBoundary>
  );
};

export default AdminProvidersPage;

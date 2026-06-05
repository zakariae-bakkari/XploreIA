import { useEffect, useMemo, useState } from 'react';
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
  const [search, setSearch] = useState('');

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await adminProviderApi.getAll();
      if (res && res.status === 'success') {
        setProviders(res.data || []);
      } else {
        setProviders([]);
      }
    } catch (err) {
      console.error(err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const handleEdit = async (p) => {
    if (!p || !p.id) return;
    try {
      const res = await adminProviderApi.getById(p.id);
      if (res && res.status === 'success') {
        setEditing(res.data);
      } else {
        setEditing(p);
      }
    } catch {
      setEditing(p);
    }
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleting(id);
  };

  const confirmDelete = async () => {
    const id = deleting;
    setDeleting(null);
    try {
      const res = await adminProviderApi.delete(id);
      if (res && res.status === 'success') {
        fetchProviders();
      } else {
        alert(res.message || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      alert('Erreur réseau : ' + err.message);
    }
  };

  const handleSubmit = async (data) => {
    if (!data || !data.name || data.name.trim() === '') {
      alert('Le nom est requis');
      return;
    }

    try {
      let res;
      if (data.id) {
        res = await adminProviderApi.update(data);
      } else {
        res = await adminProviderApi.create(data);
      }

      if (res && res.status === 'success') {
        setShowModal(false);
        fetchProviders();
      } else {
        alert((res && (res.message || JSON.stringify(res))) || 'Erreur serveur');
      }
    } catch (err) {
      alert('Erreur réseau : ' + err.message);
    }
  };

  const filteredProviders = useMemo(() => {
    if (!search.trim()) return providers;
    const s = search.toLowerCase();
    return providers.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(s) ||
        (p.country || '').toLowerCase().includes(s) ||
        (p.description || '').toLowerCase().includes(s) ||
        (p.ceo || '').toLowerCase().includes(s)
    );
  }, [providers, search]);

  return (
    <ErrorBoundary>
      <div className="admin-page">
        <style>{`
          .provider-actions-container {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          @media (max-width: 900px) {
            .provider-actions-container {
              flex-direction: column;
              align-items: stretch;
              width: 100%;
            }
          }
        `}</style>

        <section className="admin-page-head">
          <div>
            <p className="label-sm" style={{ color: "var(--outline)" }}>
              Gestion Providers
            </p>
            <h1 className="h2-lg" style={{ marginTop: "8px" }}>
              Fournisseurs d'IA
            </h1>
            <p
              style={{
                color: "var(--on-surface-variant)",
                fontSize: "14px",
                marginTop: "6px",
              }}
            >
              Créez, modifiez et gérez les informations des fournisseurs de modèles IA.
            </p>
          </div>

          <div className="provider-actions-container">
            <label className="admin-search glass-panel">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un provider..."
              />
            </label>
            <button
              onClick={handleCreate}
              style={{
                background: "rgba(0, 219, 233, 0.08)",
                border: "1px solid rgba(0, 219, 233, 0.16)",
                color: "var(--primary)",
                borderRadius: "14px",
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "14px",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                add
              </span>
              Nouveau provider
            </button>
          </div>
        </section>

        <section className="glass-panel admin-panel">
          <div className="admin-section-head" style={{ marginBottom: "20px" }}>
            <div>
              <p className="label-sm" style={{ color: "var(--outline)" }}>
                Partenaires & Entreprises
              </p>
              <h2 className="h3-md" style={{ marginTop: "8px" }}>
                {filteredProviders.length} résultat{filteredProviders.length > 1 ? 's' : ''}
              </h2>
            </div>
          </div>

          <ProviderList
            providers={filteredProviders}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>

        {showModal && (
          <Modal
            title={editing?.id ? 'Modifier le provider' : 'Créer un provider'}
            className="modal-large"
            onClose={() => setShowModal(false)}
          >
            <ProviderForm
              provider={editing}
              onCancel={() => setShowModal(false)}
              onSubmit={handleSubmit}
            />
          </Modal>
        )}

        {deleting && (
          <Modal
            title="Confirmer la suppression"
            className="confirm-modal"
            onClose={() => setDeleting(null)}
          >
            <div style={{ padding: "8px 0" }}>
              <p style={{ color: "var(--on-surface-variant)", fontSize: "14px", lineHeight: "1.6" }}>
                Cette action va supprimer ou désactiver ce fournisseur. Voulez-vous continuer ?
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button
                  className="btn-cancel"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "none",
                    color: "var(--on-background)",
                    padding: "10px 18px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  onClick={() => setDeleting(null)}
                >
                  Annuler
                </button>
                <button
                  className="btn-danger"
                  style={{
                    background: "#ff4a76",
                    border: "none",
                    color: "#fff",
                    padding: "10px 18px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  onClick={confirmDelete}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AdminProvidersPage;


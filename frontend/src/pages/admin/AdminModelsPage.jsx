import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminModelApi, aiToolApi } from '../../api';
import ModelList from '../../components/admin/ModelList';
import ModelForm from '../../components/admin/ModelForm';
import Modal from '../../components/ui/Modal';
import SearchableSelect from '../../components/ui/SearchableSelect';
import TagMultiSelect from '../../components/ui/TagMultiSelect';

const AdminModelsPage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [filterToolId, setFilterToolId] = useState(null);
  const [searchParams] = useSearchParams();

  const [toolsList, setToolsList] = useState([]);
  
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [perfMin, setPerfMin] = useState('');
  const [perfMax, setPerfMax] = useState('');

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await adminModelApi.getAll();
      if (res && res.status === 'success') {
        setModels(res.data || []);
      } else {
        setModels([]);
      }
    } catch (err) {
      console.error(err);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const toolId = searchParams.get('tool_id');
    if (toolId) setFilterToolId(toolId);
    fetchModels();
    
    (async () => {
      try {
        const t = await aiToolApi.getAll();
        if (t && t.status === 'success') {
          setToolsList(t.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [searchParams]);

  useEffect(() => {
    const tags = new Set();
    (models || []).forEach(m => {
      if (m.tags) {
        m.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => tags.add(t));
      }
    });
    setTagOptions(Array.from(tags).map(t => ({ id: t, name: t })));
  }, [models]);

  const openEdit = async (model) => {
    try {
      if (!model || !model.id) return;
      const res = await adminModelApi.getById(model.id);
      if (res && res.status === 'success') {
        setEditing(res.data);
      } else {
        setEditing(model);
      }
    } catch {
      setEditing(model);
    }
    setShowModal(true);
  };

  const openCreate = (prefill = {}) => {
    setEditing(prefill);
    setShowModal(true);
  };

  const handleCreateForTool = () => openCreate({ tool_id: filterToolId || '' });

  const handleFilterByTool = (toolId) => {
    setFilterToolId(toolId || null);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
  };

  const confirmDelete = async () => {
    const id = deleting;
    setDeleting(null);
    try {
      const res = await adminModelApi.delete(id);
      if (res && res.status === 'success') {
        fetchModels();
      } else {
        alert(res.message || 'Erreur lors de la suppression');
      }
    } catch (e) {
      alert('Erreur réseau : ' + e.message);
    }
  };

  const cancelDelete = () => setDeleting(null);

  const filteredModels = models.filter(m => {
    if (filterToolId && m.tool_id !== filterToolId) return false;
    if (selectedTags && selectedTags.length > 0) {
      const mtags = (m.tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      const has = selectedTags.some(st => mtags.includes(st.toLowerCase()));
      if (!has) return false;
    }
    const rq = m.response_quality ? parseInt(m.response_quality, 10) : null;
    if (perfMin !== '') {
      const v = parseInt(perfMin, 10);
      if (isNaN(v) === false && (rq === null || rq < v)) return false;
    }
    if (perfMax !== '') {
      const v = parseInt(perfMax, 10);
      if (isNaN(v) === false && (rq === null || rq > v)) return false;
    }
    return true;
  });

  return (
    <div className="admin-page">
      <style>{`
        .models-filter-panel {
          position: relative;
          z-index: 10;
          padding: 24px;
          display: flex;
          gap: 20px;
          align-items: flex-end;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .models-filter-panel .tag-panel,
        .models-filter-panel .searchable-panel {
          z-index: 999;
          background: #18181f;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }
        .filter-item-cyber {
          flex: 1 1 240px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .filter-item-cyber.perf-inputs {
          flex: 0 0 200px;
        }
        .filter-item-cyber label {
          font-size: 13px;
          font-weight: 600;
          color: var(--outline);
        }
        .cyber-input-minmax {
          display: flex;
          gap: 8px;
        }
        .cyber-input-minmax input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--on-background);
          outline: none;
          font-family: inherit;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        .cyber-input-minmax input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.06);
        }
      `}</style>

      <section className="admin-page-head">
        <div>
          <p className="label-sm" style={{ color: "var(--outline)" }}>
            Gestion Modèles
          </p>
          <h1 className="h2-lg" style={{ marginTop: "8px" }}>
            Modèles de Langage (LLMs)
          </h1>
          <p
            style={{
              color: "var(--on-surface-variant)",
              fontSize: "14px",
              marginTop: "6px",
            }}
          >
            Configurez et associez les modèles d'IA aux outils correspondants.
          </p>
        </div>

        <div>
          <button
            onClick={handleCreateForTool}
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
            Nouveau modèle
          </button>
        </div>
      </section>

      <section className="glass-panel models-filter-panel">
        <div className="filter-item-cyber">
          <label>Filtrer par outil</label>
          <SearchableSelect
            options={toolsList}
            value={filterToolId || ''}
            onChange={(v) => handleFilterByTool(v || null)}
            placeholder="-- Tous les outils --"
          />
        </div>
        <div className="filter-item-cyber">
          <label>Filtrer par tags</label>
          <TagMultiSelect
            options={tagOptions}
            values={selectedTags}
            onChange={(vals) => setSelectedTags(vals)}
          />
        </div>
        <div className="filter-item-cyber perf-inputs">
          <label>Performance (Response quality)</label>
          <div className="cyber-input-minmax">
            <input
              type="number"
              placeholder="Min"
              value={perfMin}
              onChange={(e) => setPerfMin(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max"
              value={perfMax}
              onChange={(e) => setPerfMax(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="glass-panel admin-panel">
        <div className="admin-section-head" style={{ marginBottom: "20px" }}>
          <div>
            <p className="label-sm" style={{ color: "var(--outline)" }}>
              Modèles Répertoriés
            </p>
            <h2 className="h3-md" style={{ marginTop: "8px" }}>
              {filteredModels.length} résultat{filteredModels.length > 1 ? 's' : ''}
            </h2>
          </div>
        </div>

        <ModelList
          loading={loading}
          models={filteredModels}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </section>

      {showModal && (
        <Modal
          className="modal-large"
          title={editing?.id ? 'Modifier le modèle' : 'Créer un modèle'}
          onClose={() => setShowModal(false)}
        >
          <ModelForm
            model={editing}
            onCancel={() => setShowModal(false)}
            onSubmit={(res) => {
              if (res && res.status === 'success') {
                setEditing(null);
                fetchModels();
                setShowModal(false);
              } else {
                alert(res.message || 'Erreur lors de la soumission.');
              }
            }}
          />
        </Modal>
      )}

      {deleting && (
        <Modal title="Confirmer la suppression" className="confirm-modal" onClose={cancelDelete}>
          <div style={{ padding: "8px 0" }}>
            <p style={{ color: "var(--on-surface-variant)", fontSize: "14px", lineHeight: "1.6" }}>
              Cette action va marquer le modèle comme supprimé. Voulez-vous continuer ?
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
                onClick={cancelDelete}
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
                Confirmer la suppression
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminModelsPage;


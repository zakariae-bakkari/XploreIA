import React, { useEffect, useState } from 'react';
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
    const res = await adminModelApi.getAll();
    if (res && res.status === 'success') setModels(res.data || []);
    else setModels([]);
    setLoading(false);
  };

  useEffect(() => {
    const toolId = searchParams.get('tool_id');
    if (toolId) setFilterToolId(toolId);
    fetchModels();
    // load tools for filter
    (async () => {
      try {
        const t = await aiToolApi.getAll();
        if (t && t.status === 'success') setToolsList(t.data || []);
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    // derive tag options from models
    const tags = new Set();
    (models || []).forEach(m => {
      if (m.tags) m.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => tags.add(t));
    });
    setTagOptions(Array.from(tags).map(t => ({ id: t, name: t })));
  }, [models]);

  const openEdit = async (model) => {
    // fetch full model details before editing to ensure we have all fields
    try {
      if (!model || !model.id) return;
      const res = await adminModelApi.getById(model.id);
      if (res && res.status === 'success') {
        setEditing(res.data);
      } else {
        // fallback to provided model
        setEditing(model);
      }
    } catch (e) {
      setEditing(model);
    }
    setShowModal(true);
  };

  const openCreate = (prefill = {}) => {
    setEditing(prefill);
    setShowModal(true);
  };

  const handleCreate = () => openCreate({});
  // if a tool filter is active, prefill new model with that tool
  const handleCreateForTool = () => openCreate({ tool_id: filterToolId || '' });

  // remove view tool modal; set filter by tool
  const handleFilterByTool = (toolId) => {
    setFilterToolId(toolId || null);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
  };

  const confirmDelete = async () => {
    const id = deleting;
    setDeleting(null);
    const res = await adminModelApi.delete(id);
    if (res && res.status === 'success') {
      fetchModels();
      alert('Modèle supprimé');
    } else {
      alert(res.message || 'Erreur lors de la suppression');
    }
  };

  const cancelDelete = () => setDeleting(null);

  const handleSubmit = async (data) => {
    let res;
    if (data.id) {
      res = await adminModelApi.update(data);
    } else {
      res = await adminModelApi.create(data);
    }

    if (res && (res.status === 'success' || res.status === undefined)) {
      setEditing(null);
      fetchModels();
    } else {
      alert(res.message || 'Erreur');
    }
  };

  return (
    <div className="admin-models-page">
      <div className="page-header">
        <h2 className="page-title">Gestion des modèles (Admin)</h2>
        <div className="page-actions">
          <button className="btn-primary" onClick={handleCreateForTool}>Créer un modèle</button>
        </div>
      </div>

      {showModal && (
        <Modal className="modal-large" title={editing?.id ? 'Modifier le modèle' : 'Créer un modèle'} onClose={() => setShowModal(false)}>
          <ModelForm
            model={editing}
            onCancel={() => setShowModal(false)}
            onSubmit={(res) => {
              if (res && res.status === 'success') {
                setEditing(null);
                fetchModels();
                setShowModal(false);
              } else {
                alert(res.message || 'Erreur');
              }
            }}
          />
        </Modal>
      )}

      <div className="filters-row" style={{ margin: '12px 0', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 260, flex: '1 1 260px' }}>
          <label className="label-sm">Filtrer par tool</label>
          <SearchableSelect options={toolsList} value={filterToolId || ''} onChange={(v) => handleFilterByTool(v || null)} placeholder="-- Tous les outils --" />
        </div>
        <div style={{ minWidth: 320, flex: '1 1 320px' }}>
          <label className="label-sm">Filtrer par tags</label>
          <TagMultiSelect options={tagOptions} values={selectedTags} onChange={(vals) => setSelectedTags(vals)} />
        </div>
        <div style={{ minWidth: 220, flex: '0 0 220px' }}>
          <label className="label-sm">Performance (response quality)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" className="cyber-input" placeholder=">=" value={perfMin} onChange={(e) => setPerfMin(e.target.value)} />
            <input type="number" className="cyber-input" placeholder="<=" value={perfMax} onChange={(e) => setPerfMax(e.target.value)} />
          </div>
        </div>
      </div>

      <ModelList
        loading={loading}
        models={models.filter(m => {
          // tool filter
          if (filterToolId && m.tool_id !== filterToolId) return false;
          // tag filters (if any selected, require at least one match)
          if (selectedTags && selectedTags.length > 0) {
            const mtags = (m.tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
            const has = selectedTags.some(st => mtags.includes(st.toLowerCase()));
            if (!has) return false;
          }
          // performance filter
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
        })}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* viewTool modal removed — replaced by filters */}

      {deleting && (
        <Modal title="Confirmer la suppression" className="confirm-modal" onClose={cancelDelete}>
          <p>Cette action va marquer le modèle comme supprimé. Voulez-vous continuer ?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button className="btn-ghost" onClick={cancelDelete}>Annuler</button>
            <button className="danger-btn" onClick={confirmDelete}>Confirmer la suppression</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminModelsPage;

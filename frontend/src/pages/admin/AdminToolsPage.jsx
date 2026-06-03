import { useEffect, useMemo, useState } from "react";
import { adminApi, aiToolApi } from "../../api";

const AdminToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formPricing, setFormPricing] = useState("freemium");
  const [formStatus, setFormStatus] = useState("active");
  const [formAdvantages, setFormAdvantages] = useState([""]);
  const [formDisadvantages, setFormDisadvantages] = useState([""]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Selected tool for edit/delete/detail
  const [selectedTool, setSelectedTool] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadTools = async () => {
    setLoading(true);
    try {
      const response = await adminApi.aiToolApi.getAll();
      if (response.status === "success") {
        setTools(response.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  const filteredTools = useMemo(
    () =>
      tools.filter((tool) =>
        `${tool.name} ${tool.description} ${tool.category_name || ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [tools, search],
  );

  // Reset form
  const resetForm = () => {
    setFormName("");
    setFormDesc("");
    setFormUrl("");
    setFormPricing("freemium");
    setFormStatus("active");
    setFormAdvantages([""]);
    setFormDisadvantages([""]);
    setFormError("");
  };

  // Open Add
  const openAdd = () => {
    resetForm();
    setShowAdd(true);
  };

  // Open Edit
  const openEdit = async (tool) => {
    resetForm();
    setSelectedTool(tool);
    setFormName(tool.name || "");
    setFormDesc(tool.description || "");
    setFormUrl(tool.website_url || "");
    setFormPricing(tool.pricing_model || "freemium");
    setFormStatus(tool.status || "active");

    // Fetch details to get advantages/disadvantages
    try {
      const res = await adminApi.aiToolApi.getById(tool.id);
      if (res.status === "success" && res.data) {
        setFormAdvantages(
          res.data.advantages && res.data.advantages.length > 0
            ? res.data.advantages.map((a) => a.advantage_name)
            : [""]
        );
        setFormDisadvantages(
          res.data.disadvantages && res.data.disadvantages.length > 0
            ? res.data.disadvantages.map((d) => d.disadvantage_name)
            : [""]
        );
      }
    } catch (e) {
      console.error(e);
    }
    setShowEdit(true);
  };

  // Open Detail
  const openDetail = async (tool) => {
    setDetailData(null);
    setShowDetail(true);
    try {
      const res = await adminApi.aiToolApi.getById(tool.id);
      if (res.status === "success") {
        setDetailData(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Delete
  const openDelete = (tool) => {
    setDeleteTarget(tool);
    setShowDelete(true);
  };

  // Handle Create
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Le nom de l'outil est obligatoire.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const res = await adminApi.aiToolApi.create({
        name: formName.trim(),
        description: formDesc.trim(),
        website_url: formUrl.trim(),
        pricing_model: formPricing,
        status: formStatus,
        advantages: formAdvantages.filter((a) => a.trim()),
        disadvantages: formDisadvantages.filter((d) => d.trim()),
      });
      if (res.status === "success") {
        setShowAdd(false);
        resetForm();
        await loadTools();
      } else {
        setFormError(res.message || "Erreur lors de la création.");
      }
    } catch (err) {
      setFormError("Erreur inattendue.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Le nom de l'outil est obligatoire.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const res = await adminApi.aiToolApi.update({
        id: selectedTool.id,
        name: formName.trim(),
        description: formDesc.trim(),
        website_url: formUrl.trim(),
        pricing_model: formPricing,
        status: formStatus,
        advantages: formAdvantages.filter((a) => a.trim()),
        disadvantages: formDisadvantages.filter((d) => d.trim()),
      });
      if (res.status === "success") {
        setShowEdit(false);
        resetForm();
        setSelectedTool(null);
        await loadTools();
      } else {
        setFormError(res.message || "Erreur lors de la modification.");
      }
    } catch (err) {
      setFormError("Erreur inattendue.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await adminApi.aiToolApi.delete(deleteTarget.id);
      if (res.status === "success") {
        setShowDelete(false);
        setDeleteTarget(null);
        await loadTools();
      } else {
        alert(res.message || "Erreur lors de la suppression.");
      }
    } catch (err) {
      alert("Erreur inattendue.");
    } finally {
      setSaving(false);
    }
  };

  // Dynamic list helpers
  const addAdvantage = () => setFormAdvantages([...formAdvantages, ""]);
  const removeAdvantage = (i) => setFormAdvantages(formAdvantages.filter((_, idx) => idx !== i));
  const updateAdvantage = (i, val) => { const copy = [...formAdvantages]; copy[i] = val; setFormAdvantages(copy); };

  const addDisadvantage = () => setFormDisadvantages([...formDisadvantages, ""]);
  const removeDisadvantage = (i) => setFormDisadvantages(formDisadvantages.filter((_, idx) => idx !== i));
  const updateDisadvantage = (i, val) => { const copy = [...formDisadvantages]; copy[i] = val; setFormDisadvantages(copy); };

  // Pricing badge color
  const pricingColor = (model) => {
    switch (model) {
      case "free": return { bg: "rgba(69,207,123,0.12)", color: "#45cf7b" };
      case "paid": return { bg: "rgba(255,74,118,0.12)", color: "#ff4a76" };
      case "freemium": return { bg: "rgba(0,219,233,0.12)", color: "var(--primary)" };
      default: return { bg: "rgba(255,255,255,0.06)", color: "var(--outline)" };
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader" />
        <p>Chargement des outils...</p>
      </div>
    );
  }

  // Shared form JSX
  const renderForm = (onSubmit, submitLabel) => (
    <form onSubmit={onSubmit}>
      {formError && <div className="at-error-banner">{formError}</div>}

      <div className="at-form-group">
        <label>Nom de l'outil *</label>
        <input className="at-input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: ChatGPT" />
      </div>

      <div className="at-form-group">
        <label>Description</label>
        <textarea className="at-input at-textarea" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Description de l'outil..." rows={3} />
      </div>

      <div className="at-form-row">
        <div className="at-form-group" style={{flex:1}}>
          <label>URL du site</label>
          <input className="at-input" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="at-form-group" style={{flex:1}}>
          <label>Modèle tarifaire</label>
          <select className="at-input" value={formPricing} onChange={(e) => setFormPricing(e.target.value)}>
            <option value="free">Gratuit</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Payant</option>
          </select>
        </div>
      </div>

      <div className="at-form-group">
        <label>Statut</label>
        <select className="at-input" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
          <option value="active">Actif</option>
          <option value="draft">Brouillon</option>
          <option value="inactive">Inactif</option>
        </select>
      </div>

      {/* Advantages */}
      <div className="at-form-group">
        <label>Avantages</label>
        {formAdvantages.map((adv, i) => (
          <div key={i} className="at-dynamic-row">
            <input className="at-input" value={adv} onChange={(e) => updateAdvantage(i, e.target.value)} placeholder={`Avantage ${i + 1}`} />
            {formAdvantages.length > 1 && (
              <button type="button" className="at-remove-btn" onClick={() => removeAdvantage(i)}>
                <span className="material-symbols-outlined" style={{fontSize:18}}>close</span>
              </button>
            )}
          </div>
        ))}
        <button type="button" className="at-add-btn" onClick={addAdvantage}>
          <span className="material-symbols-outlined" style={{fontSize:16}}>add</span> Ajouter
        </button>
      </div>

      {/* Disadvantages */}
      <div className="at-form-group">
        <label>Inconvénients</label>
        {formDisadvantages.map((dis, i) => (
          <div key={i} className="at-dynamic-row">
            <input className="at-input" value={dis} onChange={(e) => updateDisadvantage(i, e.target.value)} placeholder={`Inconvénient ${i + 1}`} />
            {formDisadvantages.length > 1 && (
              <button type="button" className="at-remove-btn" onClick={() => removeDisadvantage(i)}>
                <span className="material-symbols-outlined" style={{fontSize:18}}>close</span>
              </button>
            )}
          </div>
        ))}
        <button type="button" className="at-add-btn" onClick={addDisadvantage}>
          <span className="material-symbols-outlined" style={{fontSize:16}}>add</span> Ajouter
        </button>
      </div>

      <div className="at-modal-actions">
        <button type="button" className="at-btn-cancel" onClick={() => { setShowAdd(false); setShowEdit(false); }}>Annuler</button>
        <button type="submit" className="at-btn-submit" disabled={saving}>{saving ? "Enregistrement..." : submitLabel}</button>
      </div>
    </form>
  );

  return (
    <div className="admin-page">
      <style>{`
        /* Admin Tools Page Premium Styles */
        .at-error-banner {
          background: rgba(255, 74, 118, 0.1);
          border: 1px solid rgba(255, 74, 118, 0.2);
          color: #ff4a76;
          padding: 12px 16px;
          border-radius: 14px;
          margin-bottom: 20px;
          font-size: 13px;
        }
        .at-form-group {
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .at-form-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--outline);
        }
        .at-form-row {
          display: flex;
          gap: 16px;
        }
        .at-input {
          padding: 12px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--on-background);
          outline: none;
          font-family: inherit;
          font-size: 14px;
          transition: border-color 0.2s ease;
          width: 100%;
        }
        .at-input:focus {
          border-color: var(--primary);
        }
        .at-textarea {
          resize: vertical;
          min-height: 80px;
        }
        .at-dynamic-row {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 6px;
        }
        .at-dynamic-row .at-input {
          flex: 1;
        }
        .at-remove-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 74, 118, 0.1);
          border: none;
          color: #ff4a76;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .at-remove-btn:hover {
          background: rgba(255, 74, 118, 0.25);
        }
        .at-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 12px;
          background: rgba(0, 219, 233, 0.08);
          border: 1px solid rgba(0, 219, 233, 0.16);
          color: var(--primary);
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .at-add-btn:hover {
          background: rgba(0, 219, 233, 0.15);
        }
        .at-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: atFadeIn 0.2s ease-out;
        }
        .at-modal-content {
          background: var(--surface-container-low, #1e1e24);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 28px;
          width: 90%;
          max-width: 600px;
          max-height: 85vh;
          overflow-y: auto;
          padding: 32px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          animation: atSlideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .at-modal-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--on-background);
        }
        .at-modal-desc {
          font-size: 14px;
          color: var(--on-surface-variant);
          margin-bottom: 24px;
        }
        .at-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 28px;
        }
        .at-btn-cancel, .at-btn-submit, .at-btn-danger {
          padding: 12px 20px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        .at-btn-cancel {
          background: rgba(255, 255, 255, 0.05);
          color: var(--on-background);
        }
        .at-btn-cancel:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .at-btn-submit {
          background: var(--primary);
          color: #0b0b0f;
        }
        .at-btn-submit:hover {
          background: #00bcd4;
          box-shadow: 0 4px 12px rgba(0, 219, 233, 0.3);
        }
        .at-btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .at-btn-danger {
          background: #ff4a76;
          color: #fff;
        }
        .at-btn-danger:hover {
          background: #ff2d60;
          box-shadow: 0 4px 12px rgba(255, 74, 118, 0.3);
        }
        .at-detail-section {
          margin-bottom: 20px;
        }
        .at-detail-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--outline);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .at-detail-value {
          font-size: 15px;
          color: var(--on-background);
          line-height: 1.5;
        }
        .at-detail-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .at-detail-chip {
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 500;
        }
        .at-adv-chip {
          background: rgba(69, 207, 123, 0.12);
          color: #45cf7b;
        }
        .at-dis-chip {
          background: rgba(255, 74, 118, 0.12);
          color: #ff4a76;
        }
        .at-tool-actions {
          display: flex;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .admin-tool-card:hover .at-tool-actions {
          opacity: 1;
        }
        .at-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: var(--outline);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .at-action-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: var(--on-background);
        }
        .at-action-btn.view-btn:hover {
          background: rgba(0, 219, 233, 0.15);
          color: var(--primary);
        }
        .at-action-btn.edit-btn:hover {
          background: rgba(235, 178, 255, 0.15);
          color: #ebb2ff;
        }
        .at-action-btn.delete-btn:hover {
          background: rgba(255, 74, 118, 0.15);
          color: #ff4a76;
        }
        .at-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
        }
        .at-status-active { background: #45cf7b; box-shadow: 0 0 8px rgba(69,207,123,0.6); }
        .at-status-draft { background: #ffad33; }
        .at-status-inactive { background: #ff4a76; }

        @keyframes atFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes atSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <section className="admin-page-head">
        <div>
          <p className="label-sm" style={{ color: "var(--outline)" }}>
            Gestion AI Tools
          </p>
          <h1 className="h2-lg" style={{ marginTop: "8px" }}>
            Catalogue des outils
          </h1>
          <p style={{ color: "var(--on-surface-variant)", fontSize: "14px", marginTop: "6px" }}>
            Créez, modifiez et supprimez les outils IA et leurs attributs.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <label className="admin-search glass-panel">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un outil"
            />
          </label>
          <button
            onClick={openAdd}
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
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Nouvel outil
          </button>
        </div>
      </section>

      <section className="glass-panel admin-panel">
        <div className="admin-section-head">
          <div>
            <p className="label-sm" style={{ color: "var(--outline)" }}>
              Outils enregistrés
            </p>
            <h2 className="h3-md" style={{ marginTop: "8px" }}>
              {filteredTools.length} résultats
            </h2>
          </div>
        </div>

        <div className="admin-tool-grid">
          {filteredTools.map((tool) => {
            const pc = pricingColor(tool.pricing_model);
            return (
              <article key={tool.id} className="admin-tool-card">
                <div className="admin-tool-header">
                  <div className="admin-tool-logo" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    {(tool.image_url || tool.logo_url || tool.image) ? (
                      <img src={tool.image_url || tool.logo_url || tool.image} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"; }} />
                    ) : (
                      <span className="material-symbols-outlined">smart_toy</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3>{tool.name}</h3>
                    <p style={{ fontSize: 13, color: "var(--outline)" }}>
                      <span className={`at-status-dot at-status-${tool.status || 'active'}`} />
                      {tool.provider_name || "Provider inconnu"}
                    </p>
                  </div>
                  <div className="at-tool-actions">
                    <button className="at-action-btn view-btn" title="Consulter" onClick={() => openDetail(tool)}>
                      <span className="material-symbols-outlined" style={{fontSize:18}}>visibility</span>
                    </button>
                    <button className="at-action-btn edit-btn" title="Modifier" onClick={() => openEdit(tool)}>
                      <span className="material-symbols-outlined" style={{fontSize:18}}>edit</span>
                    </button>
                    <button className="at-action-btn delete-btn" title="Supprimer" onClick={() => openDelete(tool)}>
                      <span className="material-symbols-outlined" style={{fontSize:18}}>delete</span>
                    </button>
                  </div>
                </div>

                <p className="admin-tool-description">
                  {tool.description ? (tool.description.length > 120 ? tool.description.substring(0, 120) + "..." : tool.description) : "Pas de description."}
                </p>

                <div className="admin-tool-meta">
                  <span className="admin-pill">
                    {tool.category_name || "Non classé"}
                  </span>
                  <span className="admin-pill" style={{ background: pc.bg, color: pc.color }}>
                    {tool.pricing_model || "N/A"}
                  </span>
                  <span className="admin-score">
                    {tool.global_rating || "0.0"} / 5
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="admin-empty-state">
            <span className="material-symbols-outlined">search_off</span>
            <p>Aucun outil trouvé.</p>
          </div>
        )}
      </section>

      {/* === ADD MODAL === */}
      {showAdd && (
        <div className="at-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="at-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="at-modal-title">Ajouter un outil IA</h2>
            <p className="at-modal-desc">Remplissez les informations de l'outil. Les avantages et inconvénients seront enregistrés automatiquement.</p>
            {renderForm(handleCreate, "Créer l'outil")}
          </div>
        </div>
      )}

      {/* === EDIT MODAL === */}
      {showEdit && (
        <div className="at-modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="at-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="at-modal-title">Modifier l'outil</h2>
            <p className="at-modal-desc">Modifiez les informations de « {selectedTool?.name} ».</p>
            {renderForm(handleUpdate, "Enregistrer")}
          </div>
        </div>
      )}

      {/* === DELETE MODAL === */}
      {showDelete && deleteTarget && (
        <div className="at-modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="at-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <h2 className="at-modal-title">Supprimer l'outil</h2>
            <p className="at-modal-desc">
              Êtes-vous sûr de vouloir supprimer <strong>« {deleteTarget.name} »</strong> ?
              Cette action est irréversible et supprimera également les avantages et inconvénients associés.
            </p>
            <div className="at-modal-actions">
              <button className="at-btn-cancel" onClick={() => setShowDelete(false)}>Annuler</button>
              <button className="at-btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? "Suppression..." : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === DETAIL MODAL === */}
      {showDetail && (
        <div className="at-modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="at-modal-content" onClick={(e) => e.stopPropagation()}>
            {!detailData ? (
              <div className="admin-loading" style={{ minHeight: 120 }}>
                <div className="loader" />
                <p>Chargement...</p>
              </div>
            ) : (
              <>
                <h2 className="at-modal-title">{detailData.name}</h2>
                <p className="at-modal-desc">{detailData.description || "Pas de description."}</p>

                <div className="at-detail-section">
                  <p className="at-detail-label">Informations</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    <span className="admin-pill">{detailData.pricing_model || "N/A"}</span>
                    <span className="admin-pill">
                      <span className={`at-status-dot at-status-${detailData.status || 'active'}`} />
                      {detailData.status || "active"}
                    </span>
                    {detailData.website_url && (
                      <a href={detailData.website_url} target="_blank" rel="noopener noreferrer" className="admin-pill" style={{textDecoration:"none"}}>
                        <span className="material-symbols-outlined" style={{fontSize:14, marginRight:4}}>open_in_new</span>
                        Site web
                      </a>
                    )}
                  </div>
                </div>

                {detailData.advantages && detailData.advantages.length > 0 && (
                  <div className="at-detail-section">
                    <p className="at-detail-label">Avantages</p>
                    <div className="at-detail-chips">
                      {detailData.advantages.map((a, i) => (
                        <span key={i} className="at-detail-chip at-adv-chip">✓ {a.advantage_name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {detailData.disadvantages && detailData.disadvantages.length > 0 && (
                  <div className="at-detail-section">
                    <p className="at-detail-label">Inconvénients</p>
                    <div className="at-detail-chips">
                      {detailData.disadvantages.map((d, i) => (
                        <span key={i} className="at-detail-chip at-dis-chip">✗ {d.disadvantage_name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {detailData.models && detailData.models.length > 0 && (
                  <div className="at-detail-section">
                    <p className="at-detail-label">Modèles associés</p>
                    <div className="at-detail-chips">
                      {detailData.models.map((m, i) => (
                        <span key={i} className="at-detail-chip" style={{background:"rgba(235,178,255,0.12)", color:"#ebb2ff"}}>{m.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="at-modal-actions">
                  <button className="at-btn-cancel" onClick={() => setShowDetail(false)}>Fermer</button>
                  <button className="at-btn-submit" onClick={() => { setShowDetail(false); openEdit(detailData); }}>Modifier</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminToolsPage;

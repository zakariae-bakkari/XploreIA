import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api";
import {
  AddToolModal,
  EditToolModal,
  ToolDetailModal,
  DeleteToolModal,
} from "../../components/admin/ToolModals";

const AdminToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Selected tool states
  const [selectedTool, setSelectedTool] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Catalog items lists
  const [allCharacteristics, setAllCharacteristics] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  // Form helpers
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [toolsRes, charRes, modelRes, catRes] = await Promise.all([
        adminApi.aiToolApi.getAll(),
        adminApi.characteristicApi.getAll(),
        adminApi.modelApi.getAll(),
        adminApi.categorieApi.getAll(),
      ]);
      if (toolsRes.status === "success") {
        setTools(toolsRes.data || []);
      }
      if (charRes.status === "success") {
        setAllCharacteristics(charRes.data || []);
      }
      if (modelRes.status === "success") {
        setAllModels(modelRes.data || []);
      }
      if (catRes.status === "success") {
        setAllCategories(catRes.data || []);
      }
    } catch (e) {
      console.error("Failed to load catalog data:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadTools = async () => {
    try {
      const response = await adminApi.aiToolApi.getAll();
      if (response.status === "success") {
        setTools(response.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadInitialData();
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

  // Open Add
  const openAdd = () => {
    setFormError("");
    setShowAdd(true);
  };

  // Open Edit
  const openEdit = (tool) => {
    setFormError("");
    setSelectedTool(tool);
    setShowEdit(true);
  };

  // Open Detail
  const openDetail = (tool) => {
    setSelectedTool(tool);
    setShowDetail(true);
  };

  // Open Delete
  const openDelete = (tool) => {
    setDeleteTarget(tool);
    setShowDelete(true);
  };

  // Handle Create
  const handleCreate = async (data) => {
    setSaving(true);
    setFormError("");
    try {
      const res = await adminApi.aiToolApi.create(data);
      if (res.status === "success") {
        setShowAdd(false);
        await loadTools();
      } else {
        setFormError(res.message || "Erreur lors de la création.");
      }
    } catch (err) {
      setFormError("Erreur inattendue. " + (err?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  // Handle Update
  const handleUpdate = async (data) => {
    setSaving(true);
    setFormError("");
    try {
      const res = await adminApi.aiToolApi.update(data);
      if (res.status === "success") {
        setShowEdit(false);
        setSelectedTool(null);
        await loadTools();
      } else {
        setFormError(res.message || "Erreur lors de la modification.");
      }
    } catch (err) {
      setFormError(`Erreur inattendue ${err.message}.`);
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
      alert("Erreur inattendue. " + (err?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  // Pricing badge color
  const pricingColor = (model) => {
    switch (model) {
      case "free":
        return { bg: "rgba(69,207,123,0.12)", color: "#45cf7b" };
      case "paid":
        return { bg: "rgba(255,74,118,0.12)", color: "#ff4a76" };
      case "freemium":
        return { bg: "rgba(0,219,233,0.12)", color: "var(--primary)" };
      default:
        return { bg: "rgba(255,255,255,0.06)", color: "var(--outline)" };
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

  return (
    <div className="admin-page">
      <style>{`
        /* Custom Select Styles */
        .custom-select-container {
          position: relative;
          cursor: pointer;
          font-family: inherit;
          width: 100%;
        }

        .custom-select-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--on-background);
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .custom-select-trigger:hover,
        .custom-select-trigger.open {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .select-arrow {
          color: var(--outline);
          font-size: 20px;
          transition: transform 0.2s ease;
        }

        .custom-select-options {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: #1e1e24;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
          z-index: 1100;
          max-height: 260px;
          overflow-y: auto;
          list-style: none;
          margin: 0;
        }

        .custom-select-option {
          padding: 10px 14px;
          border-radius: 10px;
          transition: all 0.2s ease;
          color: var(--on-background);
        }

        .custom-select-option:hover {
          background: rgba(0, 219, 233, 0.08);
          color: var(--primary);
        }

        .custom-select-option.selected {
          background: rgba(0, 219, 233, 0.12);
          color: var(--primary);
          font-weight: 600;
        }

        .option-content-flex {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .option-label {
          font-size: 14px;
          font-weight: 600;
        }

        .option-desc {
          font-size: 12px;
          color: var(--outline);
        }

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

        /* Chips for characteristics and models selection */
        .char-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .char-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 13px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .char-chip:hover {
          background: rgba(255, 255, 255, 0.07);
          transform: translateY(-1px);
        }

        .char-delete-icon {
          font-size: 16px;
          color: var(--outline);
          cursor: pointer;
          border-radius: 50%;
          padding: 2px;
          transition: all 0.2s ease;
        }

        .char-delete-icon:hover {
          background: rgba(255, 74, 118, 0.2);
          color: #ff4a76;
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
          <p
            style={{
              color: "var(--on-surface-variant)",
              fontSize: "14px",
              marginTop: "6px",
            }}
          >
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
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              add
            </span>
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
                  <div
                    className="admin-tool-logo"
                    style={{ borderRadius: "12px", overflow: "hidden" }}
                  >
                    {tool.image_url || tool.logo_url || tool.image ? (
                      <img
                        src={tool.image_url || tool.logo_url || tool.image}
                        alt={tool.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800";
                        }}
                      />
                    ) : (
                      <span className="material-symbols-outlined">
                        smart_toy
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3>{tool.name}</h3>
                    <p style={{ fontSize: 13, color: "var(--outline)" }}>
                      <span
                        className={`at-status-dot at-status-${tool.status || "active"}`}
                      />
                      {tool.provider_name || "Provider inconnu"}
                    </p>
                  </div>
                  <div className="at-tool-actions">
                    <button
                      className="at-action-btn view-btn"
                      title="Consulter"
                      onClick={() => openDetail(tool)}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 18 }}
                      >
                        visibility
                      </span>
                    </button>
                    <button
                      className="at-action-btn edit-btn"
                      title="Modifier"
                      onClick={() => openEdit(tool)}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 18 }}
                      >
                        edit
                      </span>
                    </button>
                    <button
                      className="at-action-btn delete-btn"
                      title="Supprimer"
                      onClick={() => openDelete(tool)}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 18 }}
                      >
                        delete
                      </span>
                    </button>
                  </div>
                </div>

                <p className="admin-tool-description">
                  {tool.description
                    ? tool.description.length > 120
                      ? tool.description.substring(0, 120) + "..."
                      : tool.description
                    : "Pas de description."}
                </p>

                <div className="admin-tool-meta">
                  <span className="admin-pill">
                    {tool.category_name || "Non classé"}
                  </span>
                  <span
                    className="admin-pill"
                    style={{ background: pc.bg, color: pc.color }}
                  >
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
      <AddToolModal
        isOpen={showAdd}
        onClose={() => {
          setShowAdd(false);
          setFormError("");
        }}
        onSubmit={handleCreate}
        saving={saving}
        error={formError}
        allCharacteristics={allCharacteristics}
        allModels={allModels}
        allCategories={allCategories}
      />

      {/* === EDIT MODAL === */}
      <EditToolModal
        isOpen={showEdit}
        onClose={() => {
          setShowEdit(false);
          setSelectedTool(null);
          setFormError("");
        }}
        onSubmit={handleUpdate}
        saving={saving}
        error={formError}
        tool={selectedTool}
        allCharacteristics={allCharacteristics}
        allModels={allModels}
        allCategories={allCategories}
      />

      {/* === DELETE MODAL === */}
      <DeleteToolModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        tool={deleteTarget}
        saving={saving}
      />

      {/* === DETAIL MODAL === */}
      <ToolDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        tool={selectedTool}
      />
    </div>
  );
};

export default AdminToolsPage;

import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api";

const CustomSelect = ({ value, onChange, options, placeholder = "Sélectionner..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  return (
    <div 
      className="custom-select-container" 
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
    >
      <div className={`custom-select-trigger ${isOpen ? "open" : ""}`}>
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="material-symbols-outlined select-arrow">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </div>

      {isOpen && (
        <ul className="custom-select-options">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`custom-select-option ${opt.value === value ? "selected" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              <div className="option-content-flex">
                <span className="option-label">{opt.label}</span>
                {opt.description && (
                  <span className="option-desc">{opt.description}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [characteristics, setCharacteristics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals & Dialogs State
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showDeleteCategory, setShowDeleteCategory] = useState(false);

  const [showAddChar, setShowAddChar] = useState(false);
  const [showEditChar, setShowEditChar] = useState(false);
  const [showDeleteChar, setShowDeleteChar] = useState(false);

  // Form States for Categories
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const [catError, setCatError] = useState("");

  // Form States for Characteristics
  const [charName, setCharName] = useState("");
  const [charDesc, setCharDesc] = useState("");
  const [charType, setCharType] = useState("capability");
  const [charStatus, setCharStatus] = useState("active");
  const [selectedChar, setSelectedChar] = useState(null);
  const [charError, setCharError] = useState("");

  // Deletion logic details
  const [deleteTargetCat, setDeleteTargetCat] = useState(null);
  const [deleteTargetChar, setDeleteTargetChar] = useState(null);
  const [affectedToolsCount, setAffectedToolsCount] = useState(0);
  const [replacementCatId, setReplacementCatId] = useState("");

  // Load Categories and Characteristics
  const loadData = async () => {
    setLoading(true);
    try {
      const catRes = await adminApi.categorieApi.getAll();
      if (catRes.status === "success") {
        setCategories(catRes.data || []);
      }

      const charRes = await adminApi.characteristicApi.getAll();
      if (charRes.status === "success") {
        setCharacteristics(charRes.data || []);
      }
    } catch (e) {
      console.error("Failed to load catalog data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Category Filtering
  const filteredCategories = useMemo(() => {
    return categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [categories, search]);

  // Group Characteristics by Type
  const groupedCharacteristics = useMemo(() => {
    const groups = {
      capability: [],
      limitation: [],
      modality: [],
      language: [],
      integration: [],
      other: [],
    };
    characteristics.forEach((char) => {
      const type = char.type || "other";
      if (groups[type]) {
        // Filter by search query if applicable
        if (
          search === "" ||
          char.name.toLowerCase().includes(search.toLowerCase()) ||
          (char.description && char.description.toLowerCase().includes(search.toLowerCase()))
        ) {
          groups[type].push(char);
        }
      }
    });
    return groups;
  }, [characteristics, search]);

  // Create Category Handler
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatError("Le nom de la catégorie est obligatoire.");
      return;
    }
    setCatError("");

    try {
      const res = await adminApi.categorieApi.create({
        name: catName.trim(),
        description: catDesc.trim(),
      });

      if (res.status === "success") {
        setCatName("");
        setCatDesc("");
        setShowAddCategory(false);
        await loadData();
      } else {
        setCatError(res.message || "Erreur lors de la création.");
      }
    } catch (err) {
      setCatError("Une erreur inattendue est survenue.");
    }
  };

  // Edit Category Handler
  const handleEditCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatError("Le nom de la catégorie est obligatoire.");
      return;
    }
    setCatError("");

    try {
      const res = await adminApi.categorieApi.update({
        id: selectedCat.id,
        name: catName.trim(),
        description: catDesc.trim(),
      });

      if (res.status === "success") {
        setCatName("");
        setCatDesc("");
        setSelectedCat(null);
        setShowEditCategory(false);
        await loadData();
      } else {
        setCatError(res.message || "Erreur lors de la modification.");
      }
    } catch (err) {
      setCatError("Une erreur inattendue est survenue.");
    }
  };

  // Delete Category Request (Trigger Dialog)
  const triggerDeleteCategory = async (cat) => {
    setDeleteTargetCat(cat);
    setReplacementCatId("");
    setAffectedToolsCount(0);

    // Call delete with no params to check usage
    try {
      const res = await adminApi.categorieApi.delete({ id: cat.id });
      if (res && res.code === "in_use") {
        setAffectedToolsCount(res.count || 0);
        setShowDeleteCategory(true);
      } else if (res && res.status === "success") {
        // Not in use, deleted immediately! Just refresh.
        await loadData();
      } else {
        // Other error or code, show dialog to ask user confirmation
        setShowDeleteCategory(true);
      }
    } catch (err) {
      console.error(err);
      setShowDeleteCategory(true);
    }
  };

  // Confirm Category Deletion
  const confirmDeleteCategory = async (mode) => {
    if (!deleteTargetCat) return;

    try {
      let params = { id: deleteTargetCat.id };
      if (mode === "reassign") {
        if (!replacementCatId) {
          alert("Veuillez sélectionner une catégorie de remplacement.");
          return;
        }
        params.replacement_id = replacementCatId;
      } else if (mode === "detach") {
        params.force = true;
      }

      const res = await adminApi.categorieApi.delete(params);
      if (res.status === "success") {
        setShowDeleteCategory(false);
        setDeleteTargetCat(null);
        await loadData();
      } else {
        alert(res.message || "Erreur lors de la suppression.");
      }
    } catch (err) {
      alert("Une erreur inattendue est survenue.");
    }
  };

  // Create Characteristic Handler
  const handleAddChar = async (e) => {
    e.preventDefault();
    if (!charName.trim()) {
      setCharError("Le nom de la caractéristique est obligatoire.");
      return;
    }
    setCharError("");

    try {
      const res = await adminApi.characteristicApi.create({
        name: charName.trim(),
        description: charDesc.trim(),
        type: charType,
        status: charStatus,
      });

      if (res.status === "success") {
        setCharName("");
        setCharDesc("");
        setCharType("capability");
        setCharStatus("active");
        setShowAddChar(false);
        await loadData();
      } else {
        setCharError(res.message || "Erreur lors de la création.");
      }
    } catch (err) {
      setCharError("Une erreur inattendue est survenue.");
    }
  };

  // Edit Characteristic Handler
  const handleEditChar = async (e) => {
    e.preventDefault();
    if (!charName.trim()) {
      setCharError("Le nom de la caractéristique est obligatoire.");
      return;
    }
    setCharError("");

    try {
      const res = await adminApi.characteristicApi.update({
        id: selectedChar.id,
        name: charName.trim(),
        description: charDesc.trim(),
        type: charType,
        status: charStatus,
      });

      if (res.status === "success") {
        setCharName("");
        setCharDesc("");
        setSelectedChar(null);
        setShowEditChar(false);
        await loadData();
      } else {
        setCharError(res.message || "Erreur lors de la modification.");
      }
    } catch (err) {
      setCharError("Une erreur inattendue est survenue.");
    }
  };

  // Delete Characteristic Handler
  const handleDeleteChar = async () => {
    if (!deleteTargetChar) return;

    try {
      const res = await adminApi.characteristicApi.delete({ id: deleteTargetChar.id });
      if (res.status === "success") {
        setShowDeleteChar(false);
        setDeleteTargetChar(null);
        await loadData();
      } else {
        alert(res.message || "Erreur lors de la suppression.");
      }
    } catch (err) {
      alert("Une erreur inattendue est survenue.");
    }
  };

  // Quick Open Edit Drawer for Category
  const openEditCategory = (cat) => {
    setSelectedCat(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || "");
    setCatError("");
    setShowEditCategory(true);
  };

  // Quick Open Edit Drawer for Characteristic
  const openEditChar = (char) => {
    setSelectedChar(char);
    setCharName(char.name);
    setCharDesc(char.description || "");
    setCharType(char.type);
    setCharStatus(char.status);
    setCharError("");
    setShowEditChar(true);
  };

  // Map system characteristic types to friendly labels
  const charTypeLabels = {
    capability: "Capacités",
    limitation: "Limites",
    modality: "Modalités",
    language: "Langues",
    integration: "Intégrations",
    other: "Autres",
  };

  // Map system characteristic types to specific colors
  const charTypeColors = {
    capability: "hsla(184, 100%, 46%, 0.12)",
    limitation: "hsla(342, 100%, 55%, 0.12)",
    modality: "hsla(280, 100%, 75%, 0.12)",
    language: "hsla(142, 70%, 45%, 0.12)",
    integration: "hsla(38, 100%, 50%, 0.12)",
    other: "hsla(210, 20%, 50%, 0.12)",
  };

  const charTypeTextColors = {
    capability: "var(--primary)",
    limitation: "#ff4a76",
    modality: "#e0adff",
    language: "#45cf7b",
    integration: "#ffad33",
    other: "var(--outline)",
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader" />
        <p style={{ marginTop: 12 }}>Chargement des catégories et caractéristiques...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <style>{`
        /* Styles personnalisés premiums pour les catégories et caractéristiques */
        /* Custom Select Styles */
        .custom-select-container {
          position: relative;
          width: 100%;
          cursor: pointer;
          font-family: inherit;
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

        .custom-select-option:hover .option-desc {
          color: rgba(255, 255, 255, 0.6);
        }

        .catalog-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .stats-summary {
          display: flex;
          gap: 16px;
        }

        .stat-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 14px;
        }

        .stat-badge strong {
          color: var(--primary);
          font-size: 16px;
        }

        .admin-page-vertical-layout {
          display: flex;
          flex-direction: column;
          gap: 28px;
          width: 100%;
        }

        .categories-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
        }

        /* Chips de catégories premiums */
        .premium-cat-chip {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
          border: 1px solid rgba(255, 255, 255, 0.07);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .premium-cat-chip:hover {
          transform: translateY(-2px);
          background: rgba(0, 219, 233, 0.07);
          border-color: rgba(0, 219, 233, 0.3);
          box-shadow: 0 6px 20px rgba(0, 219, 233, 0.08);
        }

        .cat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--outline);
        }

        .cat-dot.active {
          background: #45cf7b;
          box-shadow: 0 0 8px rgba(69, 207, 123, 0.6);
        }

        .cat-dot.inactive {
          background: #ff4a76;
        }

        .cat-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--on-background);
        }

        .cat-tools-badge {
          font-size: 11px;
          padding: 3px 7px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.06);
          color: var(--outline);
        }

        .cat-actions {
          display: flex;
          gap: 6px;
          margin-left: 6px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .premium-cat-chip:hover .cat-actions {
          opacity: 1;
        }

        .cat-action-btn {
          width: 24px;
          height: 24px;
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

        .cat-action-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: var(--on-background);
        }

        .cat-action-btn.delete-btn:hover {
          background: rgba(255, 74, 118, 0.15);
          color: #ff4a76;
        }

        /* Char cards grouping styling */
        .char-group-card {
          padding: 20px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .char-group-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .char-group-title {
          font-weight: 700;
          font-size: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

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
          background: rgba(255, 74, 118, 0.15);
          color: #ff4a76;
        }

        /* Premium Modals system */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: #1e1e24;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 28px;
          width: 90%;
          max-width: 500px;
          padding: 32px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--on-background);
        }

        .modal-desc {
          font-size: 14px;
          color: var(--on-surface-variant);
          margin-bottom: 24px;
        }

        .modal-form-group {
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .modal-form-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--outline);
        }

        .modal-input, .modal-textarea, .modal-select {
          padding: 12px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--on-background);
          outline: none;
          font-family: inherit;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .modal-input:focus, .modal-textarea:focus, .modal-select:focus {
          border-color: var(--primary);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 28px;
        }

        .btn-cancel, .btn-submit {
          padding: 12px 20px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .btn-cancel {
          background: rgba(255, 255, 255, 0.05);
          color: var(--on-background);
        }

        .btn-cancel:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .btn-submit {
          background: var(--primary);
          color: #0b0b0f;
        }

        .btn-submit:hover {
          background: #00bcd4;
          box-shadow: 0 4px 12px rgba(0, 219, 233, 0.3);
        }

        .btn-danger {
          background: #ff4a76;
          color: var(--on-background);
        }

        .btn-danger:hover {
          background: #ff2d60;
          box-shadow: 0 4px 12px rgba(255, 74, 118, 0.3);
        }

        .error-banner {
          background: rgba(255, 74, 118, 0.1);
          border: 1px solid rgba(255, 74, 118, 0.2);
          color: #ff4a76;
          padding: 12px 16px;
          border-radius: 14px;
          margin-bottom: 20px;
          font-size: 13px;
        }

        .alert-warning-box {
          background: rgba(255, 173, 51, 0.1);
          border: 1px solid rgba(255, 173, 51, 0.2);
          color: #ffad33;
          padding: 16px;
          border-radius: 18px;
          margin-bottom: 22px;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Catalog Title Header */}
      <section className="admin-page-head">
        <div>
          <p className="label-sm" style={{ color: "var(--outline)" }}>
            Gestion catalogue
          </p>
          <h1 className="h2-lg" style={{ marginTop: "8px" }}>
            Catégories et Caractéristiques
          </h1>
          <p style={{ color: "var(--on-surface-variant)", fontSize: "14px", marginTop: "6px" }}>
            Organisez les outils et modèles d’IA par domaines d’application et caractéristiques fonctionnelles.
          </p>
        </div>

        <div className="header-actions">
          {/* Real-time search/filter inputs */}
          <label className="admin-search glass-panel">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer par nom..."
            />
          </label>

          {/* Quick numbers summary */}
          <div className="stats-summary">
            <div className="stat-badge">
              <strong>{categories.length}</strong> Catégories
            </div>
            <div className="stat-badge">
              <strong>{characteristics.length}</strong> Caractéristiques
            </div>
          </div>
        </div>
      </section>

      {/* Container holding categories and characteristics stacked vertically */}
      <div className="admin-page-vertical-layout">
        {/* Left Component: Categories chips management panel */}
        <section className="glass-panel admin-panel">
          <div className="admin-section-head">
            <div>
              <h2 className="h3-md" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>category</span>
                Catégories ({filteredCategories.length})
              </h2>
            </div>
            <button
              onClick={() => {
                setCatName("");
                setCatDesc("");
                setCatError("");
                setShowAddCategory(true);
              }}
              style={{
                background: "rgba(0, 219, 233, 0.08)",
                border: "1px solid rgba(0, 219, 233, 0.16)",
                color: "var(--primary)",
                borderRadius: "14px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
              Ajouter
            </button>
          </div>

          <div className="categories-grid">
            {filteredCategories.length === 0 ? (
              <div className="admin-empty-state" style={{ width: "100%", minHeight: 180 }}>
                <span className="material-symbols-outlined">info</span>
                <p>Aucune catégorie trouvée</p>
              </div>
            ) : (
              filteredCategories.map((c) => (
                <div
                  key={c.id}
                  className="char-chip"
                  title={c.description || "Aucune description"}
                  onClick={() => openEditCategory(c)}
                  style={{ gap: 10 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={`cat-dot ${c.status === "inactive" ? "inactive" : "active"}`} />
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                  </div>
                  
                  {c.tool_count !== undefined && (
                    <span style={{ fontSize: "10px", color: "var(--outline)", opacity: 0.8 }}>
                      ({c.tool_count} outils)
                    </span>
                  )}

                  <span
                    className="material-symbols-outlined char-delete-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerDeleteCategory(c);
                    }}
                  >
                    close
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Component: Characteristics grouping and management panel */}
        <section className="glass-panel admin-panel">
          <div className="admin-section-head">
            <div>
              <h2 className="h3-md" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>tune</span>
                Caractéristiques
              </h2>
            </div>
            <button
              onClick={() => {
                setCharName("");
                setCharDesc("");
                setCharType("capability");
                setCharStatus("active");
                setCharError("");
                setShowAddChar(true);
              }}
              style={{
                background: "rgba(0, 219, 233, 0.08)",
                border: "1px solid rgba(0, 219, 233, 0.16)",
                color: "var(--primary)",
                borderRadius: "14px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
              Ajouter
            </button>
          </div>

          <div className="admin-type-stack" style={{ marginTop: 20 }}>
            {Object.entries(groupedCharacteristics).map(([type, items]) => {
              if (items.length === 0 && search !== "") return null; // Hide empty groups on search
              return (
                <div key={type} className="char-group-card">
                  <div className="char-group-head">
                    <span className="char-group-title" style={{ color: charTypeTextColors[type] }}>
                      {charTypeLabels[type] || type}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "99px",
                        background: charTypeColors[type],
                        color: charTypeTextColors[type]
                      }}
                    >
                      {items.length} éléments
                    </span>
                  </div>

                  <div className="char-chips-grid">
                    {items.length === 0 ? (
                      <p style={{ color: "var(--outline)", fontSize: "13px", fontStyle: "italic", margin: "4px 0" }}>
                        Aucun élément configuré
                      </p>
                    ) : (
                      items.map((char) => (
                        <div
                          key={char.id}
                          className="char-chip"
                          title={char.description || "Aucune description"}
                          onClick={() => openEditChar(char)}
                        >
                          <span style={{ fontWeight: 600 }}>{char.name}</span>
                          
                          {char.tool_count > 0 && (
                            <span style={{ fontSize: "10px", color: "var(--outline)", opacity: 0.8 }}>
                              ({char.tool_count} outils)
                            </span>
                          )}

                          <span
                            className="material-symbols-outlined char-delete-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTargetChar(char);
                              setShowDeleteChar(true);
                            }}
                          >
                            close
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* -------------------- MODALS & DIALOGS -------------------- */}

      {/* Modal 1: Add Category */}
      {showAddCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Créer une catégorie</h3>
            <p className="modal-desc">Définissez une nouvelle catégorie pour regrouper les solutions IA.</p>
            
            {catError && <div className="error-banner">{catError}</div>}

            <form onSubmit={handleAddCategory}>
              <div className="modal-form-group">
                <label>Nom de la catégorie</label>
                <input
                  type="text"
                  className="modal-input"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="ex: Génération Audio, Productivité..."
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Description (Optionnelle)</label>
                <textarea
                  className="modal-textarea"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Expliquez brièvement le type d'outils regroupés sous cette catégorie..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddCategory(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Category */}
      {showEditCategory && selectedCat && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Modifier la catégorie</h3>
            <p className="modal-desc">Ajustez le nom et la description de la catégorie.</p>

            {catError && <div className="error-banner">{catError}</div>}

            <form onSubmit={handleEditCategory}>
              <div className="modal-form-group">
                <label>Nom de la catégorie</label>
                <input
                  type="text"
                  className="modal-input"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Description</label>
                <textarea
                  className="modal-textarea"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditCategory(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Elegant Category Delete & Reassignment Flow */}
      {showDeleteCategory && deleteTargetCat && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: "#ff4a76" }}>warning</span>
              Are you sure you want to delete?
            </h3>
            
            <p className="modal-desc">
              Vous êtes sur le point de supprimer la catégorie <strong>{deleteTargetCat.name}</strong>.
            </p>

            {affectedToolsCount > 0 ? (
              <>
                <div className="alert-warning-box">
                  <strong>Warning:</strong> If you delete, all AI tools that are included in this category will have no category.
                  <br />
                  <span style={{ fontSize: "12px", opacity: 0.8 }}>(Si vous supprimez, tous les outils IA de cette catégorie n'auront plus de catégorie.)</span>
                </div>

                <div className="modal-form-group" style={{ marginBottom: 20 }}>
                  <label>Attribuer une nouvelle catégorie de remplacement aux outils :</label>
                  <CustomSelect
                    value={replacementCatId}
                    onChange={(val) => setReplacementCatId(val)}
                    placeholder="-- Choisir une catégorie --"
                    options={categories
                      .filter((c) => c.id !== deleteTargetCat.id && c.status !== "inactive")
                      .map((c) => ({
                        value: c.id,
                        label: c.name,
                        description: `${c.tool_count || 0} outil(s) actuellement dans cette catégorie`
                      }))
                    }
                  />
                </div>

                <div className="modal-actions" style={{ flexDirection: "column", gap: 10 }}>
                  <button
                    type="button"
                    className="btn-submit"
                    style={{ width: "100%", textAlign: "center" }}
                    onClick={() => confirmDeleteCategory("reassign")}
                    disabled={!replacementCatId}
                  >
                    Réassigner les outils et Supprimer la catégorie
                  </button>
                  
                  <button
                    type="button"
                    className="btn-danger"
                    style={{ width: "100%", textAlign: "center", background: "rgba(255, 74, 118, 0.12)", color: "#ff4a76", border: "1px solid rgba(255, 74, 118, 0.2)" }}
                    onClick={() => confirmDeleteCategory("detach")}
                  >
                    Détacher les outils (catégorie = vide) et Supprimer
                  </button>
                  
                  <button
                    type="button"
                    className="btn-cancel"
                    style={{ width: "100%", textAlign: "center" }}
                    onClick={() => setShowDeleteCategory(false)}
                  >
                    Annuler
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ color: "var(--on-surface-variant)", fontSize: "14px", marginBottom: "20px" }}>
                  Cette catégorie n’est liée à aucun outil. Elle peut être supprimée en toute sécurité.
                </p>
                
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowDeleteCategory(false)}>
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => confirmDeleteCategory("simple")}
                  >
                    Supprimer la catégorie
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal 4: Add Characteristic */}
      {showAddChar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Créer une caractéristique</h3>
            <p className="modal-desc">Ajoutez un nouvel attribut ou caractéristique technique.</p>

            {charError && <div className="error-banner">{charError}</div>}

            <form onSubmit={handleAddChar}>
              <div className="modal-form-group">
                <label>Nom de la caractéristique</label>
                <input
                  type="text"
                  className="modal-input"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  placeholder="ex: API REST, Traduction, Temps réel..."
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Type de caractéristique</label>
                <CustomSelect
                  value={charType}
                  onChange={(val) => setCharType(val)}
                  options={[
                    { value: "capability", label: "Capacité", description: "Fonctionnalités et compétences avancées de l'outil" },
                    { value: "limitation", label: "Limite", description: "Restrictions, limites ou quotas d'utilisation" },
                    { value: "modality", label: "Modalité (Input/Output)", description: "Modes d'entrées et de sorties pris en charge (Texte, Audio, Image...)" },
                    { value: "language", label: "Langues", description: "Langues supportées par le modèle d'IA" },
                    { value: "integration", label: "Intégration", description: "Capacité d'intégration avec d'autres systèmes (API, plugins...)" },
                    { value: "other", label: "Autres", description: "Autres types de spécifications" }
                  ]}
                />
              </div>

              <div className="modal-form-group">
                <label>Description (Optionnelle)</label>
                <textarea
                  className="modal-textarea"
                  value={charDesc}
                  onChange={(e) => setCharDesc(e.target.value)}
                  placeholder="Décrivez brièvement à quoi correspond cette caractéristique..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddChar(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Edit Characteristic */}
      {showEditChar && selectedChar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Modifier la caractéristique</h3>
            <p className="modal-desc">Modifiez les options de la caractéristique sélectionnée.</p>

            {charError && <div className="error-banner">{charError}</div>}

            <form onSubmit={handleEditChar}>
              <div className="modal-form-group">
                <label>Nom de la caractéristique</label>
                <input
                  type="text"
                  className="modal-input"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Type de caractéristique</label>
                <CustomSelect
                  value={charType}
                  onChange={(val) => setCharType(val)}
                  options={[
                    { value: "capability", label: "Capacité", description: "Fonctionnalités et compétences avancées de l'outil" },
                    { value: "limitation", label: "Limite", description: "Restrictions, limites ou quotas d'utilisation" },
                    { value: "modality", label: "Modalité (Input/Output)", description: "Modes d'entrées et de sorties pris en charge (Texte, Audio, Image...)" },
                    { value: "language", label: "Langues", description: "Langues supportées par le modèle d'IA" },
                    { value: "integration", label: "Intégration", description: "Capacité d'intégration avec d'autres systèmes (API, plugins...)" },
                    { value: "other", label: "Autres", description: "Autres types de spécifications" }
                  ]}
                />
              </div>

              <div className="modal-form-group">
                <label>Status</label>
                <CustomSelect
                  value={charStatus}
                  onChange={(val) => setCharStatus(val)}
                  options={[
                    { value: "active", label: "🟢 Active", description: "Visible et utilisable sur le site public" },
                    { value: "inactive", label: "🔴 Inactive", description: "Désactivée et masquée du catalogue public" },
                    { value: "pending", label: "🟡 En attente", description: "Attente de validation d'un modérateur" },
                    { value: "rejected", label: "⚫ Rejetée", description: "Rejetée par l'administration" }
                  ]}
                />
              </div>

              <div className="modal-form-group">
                <label>Description</label>
                <textarea
                  className="modal-textarea"
                  value={charDesc}
                  onChange={(e) => setCharDesc(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditChar(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Delete Characteristic Confirmation */}
      {showDeleteChar && deleteTargetChar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: "#ff4a76" }}>warning</span>
              Supprimer la caractéristique ?
            </h3>
            <p className="modal-desc">
              Voulez-vous vraiment supprimer définitivement <strong>{deleteTargetChar.name}</strong> ? 
              Cette action la retirera automatiquement de tous les outils et modèles d’IA associés.
            </p>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowDeleteChar(false)}>
                Annuler
              </button>
              <button type="button" className="btn-submit btn-danger" onClick={handleDeleteChar}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;

import React, { useState, useEffect } from "react";
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
      style={{ width: "100%" }}
    >
      <div className={`custom-select-trigger ${isOpen ? "open" : ""}`}>
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="material-symbols-outlined select-arrow">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </div>

      {isOpen && (
        <ul className="custom-select-options">
          {options.length > 0 ? (
            options.map((opt) => (
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
            ))
          ) : (
            <li className="custom-select-option" style={{ color: "var(--outline)", fontStyle: "italic", cursor: "default" }}>
              Aucune option disponible
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

// Form advantage/disadvantage helper
const DynamicListInput = ({ items, setItems, label, placeholder }) => {
  const addItem = () => setItems([...items, ""]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, val) => {
    const copy = [...items];
    copy[i] = val;
    setItems(copy);
  };

  return (
    <div className="at-form-group">
      <label>{label}</label>
      {items.map((item, i) => (
        <div key={i} className="at-dynamic-row">
          <input 
            className="at-input" 
            value={item} 
            onChange={(e) => updateItem(i, e.target.value)} 
            placeholder={`${placeholder} ${i + 1}`} 
          />
          {items.length > 1 && (
            <button type="button" className="at-remove-btn" onClick={() => removeItem(i)}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          )}
        </div>
      ))}
      <button type="button" className="at-add-btn" onClick={addItem} style={{ marginTop: "4px" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Ajouter
      </button>
    </div>
  );
};

// Chips selection component for characteristics and models
const RelationChipsSelect = ({ selectedIds, setSelectedIds, allItems, label, placeholder }) => {
  const handleAdd = (id) => {
    if (id && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemove = (id) => {
    setSelectedIds(selectedIds.filter(x => x !== id));
  };

  return (
    <div className="at-form-group">
      <label>{label}</label>
      {selectedIds.length > 0 && (
        <div className="char-chips-grid" style={{ marginBottom: "12px" }}>
          {selectedIds.map(id => {
            const itemObj = allItems.find(x => String(x.id) === String(id));
            if (!itemObj) return null;
            return (
              <div 
                key={id} 
                className="char-chip" 
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", margin: "2px" }}
              >
                <span>{itemObj.name}</span>
                <span 
                  className="material-symbols-outlined char-delete-icon" 
                  style={{ fontSize: "16px" }} 
                  onClick={() => handleRemove(id)}
                >
                  close
                </span>
              </div>
            );
          })}
        </div>
      )}
      <CustomSelect
        value=""
        onChange={handleAdd}
        placeholder={placeholder}
        options={allItems
          .filter(x => !selectedIds.includes(x.id) && x.status !== "inactive")
          .map(x => ({ value: x.id, label: x.name }))
        }
      />
    </div>
  );
};

// ==================== ADD TOOL MODAL ====================
export const AddToolModal = ({ isOpen, onClose, onSubmit, saving, error, allCharacteristics, allModels }) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [pricing, setPricing] = useState("freemium");
  const [status, setStatus] = useState("active");
  const [advantages, setAdvantages] = useState([""]);
  const [disadvantages, setDisadvantages] = useState([""]);
  const [selectedChars, setSelectedChars] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      description: desc.trim(),
      website_url: url.trim(),
      pricing_model: pricing,
      status: status,
      advantages: advantages.filter(x => x.trim()),
      disadvantages: disadvantages.filter(x => x.trim()),
      characteristics: selectedChars,
      models: selectedModels
    });
  };

  return (
    <div className="at-modal-overlay" onClick={onClose}>
      <div className="at-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="at-modal-title">Ajouter un outil IA</h2>
        <p className="at-modal-desc">Saisissez les informations de l'outil et associez-lui des caractéristiques et modèles d'IA.</p>
        
        {error && <div className="at-error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="at-form-group">
            <label>Nom de l'outil *</label>
            <input className="at-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: ChatGPT" required />
          </div>

          <div className="at-form-group">
            <label>Description</label>
            <textarea className="at-input at-textarea" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description..." rows={3} />
          </div>

          <div className="at-form-row">
            <div className="at-form-group" style={{ flex: 1 }}>
              <label>URL du site</label>
              <input className="at-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="at-form-group" style={{ flex: 1 }}>
              <label>Modèle tarifaire</label>
              <CustomSelect
                value={pricing}
                onChange={setPricing}
                options={[
                  { value: "free", label: "Gratuit" },
                  { value: "freemium", label: "Freemium" },
                  { value: "paid", label: "Payant" }
                ]}
              />
            </div>
          </div>

          <div className="at-form-group">
            <label>Statut</label>
            <CustomSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: "active", label: "Actif" },
                { value: "draft", label: "Brouillon" },
                { value: "inactive", label: "Inactif" }
              ]}
            />
          </div>

          {/* Advantages & Disadvantages */}
          <DynamicListInput items={advantages} setItems={setAdvantages} label="Avantages" placeholder="Avantage" />
          <DynamicListInput items={disadvantages} setItems={setDisadvantages} label="Inconvénients" placeholder="Inconvénient" />

          {/* Characteristics & Models Selection from existing database elements */}
          <RelationChipsSelect 
            selectedIds={selectedChars} 
            setSelectedIds={setSelectedChars} 
            allItems={allCharacteristics} 
            label="Caractéristiques (Attributs IA)" 
            placeholder="Sélectionner une caractéristique..." 
          />

          <RelationChipsSelect 
            selectedIds={selectedModels} 
            setSelectedIds={setSelectedModels} 
            allItems={allModels} 
            label="Modèles d'IA Associés" 
            placeholder="Sélectionner un modèle..." 
          />

          <div className="at-modal-actions">
            <button type="button" className="at-btn-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="at-btn-submit" disabled={saving}>
              {saving ? "Enregistrement..." : "Créer l'outil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== EDIT TOOL MODAL ====================
export const EditToolModal = ({ isOpen, onClose, onSubmit, saving, error, tool, allCharacteristics, allModels }) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [pricing, setPricing] = useState("freemium");
  const [status, setStatus] = useState("active");
  const [advantages, setAdvantages] = useState([""]);
  const [disadvantages, setDisadvantages] = useState([""]);
  const [selectedChars, setSelectedChars] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (isOpen && tool) {
      setName(tool.name || "");
      setDesc(tool.description || "");
      setUrl(tool.website_url || "");
      setPricing(tool.pricing_model || "freemium");
      setStatus(tool.status || "active");
      
      const fetchFullDetails = async () => {
        setLoadingDetails(true);
        try {
          const res = await adminApi.aiToolApi.getById(tool.id);
          if (res.status === "success" && res.data) {
            setAdvantages(
              res.data.advantages && res.data.advantages.length > 0
                ? res.data.advantages.map((a) => a.advantage_name)
                : [""]
            );
            setDisadvantages(
              res.data.disadvantages && res.data.disadvantages.length > 0
                ? res.data.disadvantages.map((d) => d.disadvantage_name)
                : [""]
            );
            setSelectedChars(
              res.data.characteristics && res.data.characteristics.length > 0
                ? res.data.characteristics.map((c) => c.id)
                : []
            );
            setSelectedModels(
              res.data.models && res.data.models.length > 0
                ? res.data.models.map((m) => m.id)
                : []
            );
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingDetails(false);
        }
      };

      fetchFullDetails();
    }
  }, [isOpen, tool]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: tool.id,
      name: name.trim(),
      description: desc.trim(),
      website_url: url.trim(),
      pricing_model: pricing,
      status: status,
      advantages: advantages.filter(x => x.trim()),
      disadvantages: disadvantages.filter(x => x.trim()),
      characteristics: selectedChars,
      models: selectedModels
    });
  };

  return (
    <div className="at-modal-overlay" onClick={onClose}>
      <div className="at-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="at-modal-title">Modifier l'outil</h2>
        <p className="at-modal-desc">Modifiez les informations de « {tool?.name} ».</p>
        
        {error && <div className="at-error-banner">{error}</div>}

        {loadingDetails ? (
          <div className="admin-loading" style={{ minHeight: 200 }}>
            <div className="loader" />
            <p>Chargement des relations...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="at-form-group">
              <label>Nom de l'outil *</label>
              <input className="at-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="at-form-group">
              <label>Description</label>
              <textarea className="at-input at-textarea" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
            </div>

            <div className="at-form-row">
              <div className="at-form-group" style={{ flex: 1 }}>
                <label>URL du site</label>
                <input className="at-input" value={url} onChange={(e) => setUrl(e.target.value)} />
              </div>
              <div className="at-form-group" style={{ flex: 1 }}>
                <label>Modèle tarifaire</label>
                <CustomSelect
                  value={pricing}
                  onChange={setPricing}
                  options={[
                    { value: "free", label: "Gratuit" },
                    { value: "freemium", label: "Freemium" },
                    { value: "paid", label: "Payant" }
                  ]}
                />
              </div>
            </div>

            <div className="at-form-group">
              <label>Statut</label>
              <CustomSelect
                value={status}
                onChange={setStatus}
                options={[
                  { value: "active", label: "Actif" },
                  { value: "draft", label: "Brouillon" },
                  { value: "inactive", label: "Inactif" }
                ]}
              />
            </div>

            {/* Advantages & Disadvantages */}
            <DynamicListInput items={advantages} setItems={setAdvantages} label="Avantages" placeholder="Avantage" />
            <DynamicListInput items={disadvantages} setItems={setDisadvantages} label="Inconvénients" placeholder="Inconvénient" />

            {/* Characteristics & Models Selection from existing database elements */}
            <RelationChipsSelect 
              selectedIds={selectedChars} 
              setSelectedIds={setSelectedChars} 
              allItems={allCharacteristics} 
              label="Caractéristiques (Attributs IA)" 
              placeholder="Sélectionner une caractéristique..." 
            />

            <RelationChipsSelect 
              selectedIds={selectedModels} 
              setSelectedIds={setSelectedModels} 
              allItems={allModels} 
              label="Modèles d'IA Associés" 
              placeholder="Sélectionner un modèle..." 
            />

            <div className="at-modal-actions">
              <button type="button" className="at-btn-cancel" onClick={onClose}>Annuler</button>
              <button type="submit" className="at-btn-submit" disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ==================== DELETE TOOL MODAL ====================
export const DeleteToolModal = ({ isOpen, onClose, onConfirm, tool, saving }) => {
  if (!isOpen || !tool) return null;

  return (
    <div className="at-modal-overlay" onClick={onClose}>
      <div className="at-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <h2 className="at-modal-title">Supprimer l'outil</h2>
        <p className="at-modal-desc">
          Êtes-vous sûr de vouloir supprimer <strong>« {tool.name} »</strong> ?
          Cette action est irréversible et supprimera également les avantages, inconvénients et relations associés.
        </p>
        <div className="at-modal-actions">
          <button type="button" className="at-btn-cancel" onClick={onClose}>Annuler</button>
          <button type="button" className="at-btn-danger" onClick={onConfirm} disabled={saving}>
            {saving ? "Suppression..." : "Supprimer définitivement"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== TOOL DETAIL MODAL ====================
export const ToolDetailModal = ({ isOpen, onClose, tool }) => {
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    if (isOpen && tool) {
      setDetailData(null);
      const fetchDetail = async () => {
        try {
          const res = await adminApi.aiToolApi.getById(tool.id);
          if (res.status === "success") {
            setDetailData(res.data);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchDetail();
    }
  }, [isOpen, tool]);

  if (!isOpen) return null;

  return (
    <div className="at-modal-overlay" onClick={onClose}>
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
                  <a href={detailData.website_url} target="_blank" rel="noopener noreferrer" className="admin-pill" style={{ textDecoration: "none" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4 }}>open_in_new</span>
                    Site web
                  </a>
                )}
              </div>
            </div>

            {/* Display characteristics in details */}
            {detailData.characteristics && detailData.characteristics.length > 0 && (
              <div className="at-detail-section">
                <p className="at-detail-label">Caractéristiques</p>
                <div className="at-detail-chips">
                  {detailData.characteristics.map((c, i) => (
                    <span key={i} className="at-detail-chip at-adv-chip" style={{ background: "rgba(0, 219, 233, 0.1)", color: "var(--primary)" }}>
                      ★ {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                    <span key={i} className="at-detail-chip" style={{ background: "rgba(235, 178, 255, 0.12)", color: "#ebb2ff" }}>
                      🤖 {m.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="at-modal-actions">
              <button type="button" className="at-btn-cancel" onClick={onClose}>Fermer</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

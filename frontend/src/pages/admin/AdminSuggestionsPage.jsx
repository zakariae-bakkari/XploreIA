import React, { useEffect, useState } from "react";
import { suggestionApi, adminApi } from "../../api";
import SuggestToolModal from "../../components/ui/SuggestToolModal";
import CustomSelect from "../../components/ui/CustomSelect";

const AdminSuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    website_url: "",
    logo_url: "",
    main_category_id: "",
    pricing_model: "freemium",
    provider_name: ""
  });

  // Reject Form State
  const [rejectReason, setRejectReason] = useState("");

  // Status/Toast State
  const [status, setStatus] = useState({ type: "", message: "" });
  const [actionLoading, setActionLoading] = useState(false);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [sugRes, catRes, settingsRes] = await Promise.all([
        suggestionApi.getPending(),
        adminApi.categorieApi.getAll(),
        suggestionApi.getSettings()
      ]);

      if (sugRes.success) {
        setSuggestions(sugRes.data || []);
      }
      if (catRes.status === "success") {
        setCategories(catRes.data || []);
      }
      if (settingsRes.success) {
        setAutoApprove(settingsRes.ai_auto_approval);
      }
    } catch (e) {
      console.error("Failed to load suggestions page data:", e);
      showToast("error", "Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 4000);
  };

  // Toggle Auto Approve Setting
  const handleToggleAutoApprove = async () => {
    if (toggling) return;
    setToggling(true);
    const nextValue = !autoApprove;
    try {
      const res = await suggestionApi.updateSettings({ ai_auto_approval: nextValue });
      if (res.success) {
        setAutoApprove(res.ai_auto_approval);
        showToast("success", nextValue ? "Auto-approbation par l'IA activée !" : "Auto-approbation par l'IA désactivée.");
      } else {
        showToast("error", "Échec de la mise à jour du paramètre.");
      }
    } catch (e) {
      showToast("error", "Erreur de connexion.");
    } finally {
      setToggling(false);
    }
  };

  // Direct Approve
  const handleApprove = async (id) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await suggestionApi.approve(id);
      if (res.success) {
        showToast("success", "Outil approuvé et ajouté au catalogue !");
        setSuggestions(suggestions.filter(s => s.id !== id));
      } else {
        showToast("error", res.error || "Une erreur est survenue lors de l'approbation.");
      }
    } catch (e) {
      showToast("error", "Erreur de connexion.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setEditForm({
      name: suggestion.name || "",
      description: suggestion.description || "",
      website_url: suggestion.website_url || "",
      logo_url: suggestion.logo_url || "",
      main_category_id: suggestion.main_category_id || "",
      pricing_model: suggestion.pricing_model || "freemium",
      provider_name: suggestion.provider_name || ""
    });
    setShowEditModal(true);
  };

  // Submit Edit & Approve
  const handleEditAndApproveSubmit = async (e) => {
    e.preventDefault();
    if (actionLoading) return;
    setActionLoading(true);

    try {
      // Step 1: Update suggestion fields
      const updateRes = await suggestionApi.update(selectedSuggestion.id, editForm);
      if (!updateRes.success) {
        showToast("error", updateRes.error || "Échec de la modification.");
        setActionLoading(false);
        return;
      }

      // Step 2: Approve updated suggestion
      const approveRes = await suggestionApi.approve(selectedSuggestion.id);
      if (approveRes.success) {
        showToast("success", "Suggestion modifiée et approuvée !");
        setSuggestions(suggestions.filter(s => s.id !== selectedSuggestion.id));
        setShowEditModal(false);
      } else {
        showToast("error", approveRes.error || "Échec de l'approbation.");
      }
    } catch (e) {
      showToast("error", "Erreur de connexion.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Reject Modal
  const openRejectModal = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setRejectReason("");
    setShowRejectModal(true);
  };

  // Confirm Reject
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (actionLoading) return;
    setActionLoading(true);

    try {
      const res = await suggestionApi.reject(selectedSuggestion.id, rejectReason);
      if (res.success) {
        showToast("success", "Suggestion rejetée.");
        setSuggestions(suggestions.filter(s => s.id !== selectedSuggestion.id));
        setShowRejectModal(false);
      } else {
        showToast("error", res.error || "Échec du rejet.");
      }
    } catch (e) {
      showToast("error", "Erreur de connexion.");
    } finally {
      setActionLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return { bg: "rgba(69, 207, 123, 0.12)", color: "#45cf7b", label: "Excellent" };
    if (score >= 50) return { bg: "rgba(255, 176, 32, 0.12)", color: "#ffb020", label: "Moyen" };
    return { bg: "rgba(255, 74, 118, 0.12)", color: "#ff4a76", label: "Faible" };
  };

  const pricingOptions = [
    { value: "free", label: "Gratuit" },
    { value: "freemium", label: "Freemium" },
    { value: "premium", label: "Payant (Premium)" }
  ];

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  return (
    <div className="admin-page-content" style={{ padding: "24px", minHeight: "100vh" }}>
      {/* Toast Notification */}
      {status.message && (
        <div style={{
          position: "fixed",
          top: "80px",
          right: "24px",
          padding: "12px 24px",
          borderRadius: "8px",
          zIndex: 1000,
          background: status.type === "success" ? "rgba(69, 207, 123, 0.95)" : "rgba(255, 74, 118, 0.95)",
          color: "white",
          fontWeight: "bold",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease"
        }}>
          {status.message}
        </div>
      )}

      {/* Header section */}
      <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="h1-xl" style={{ fontSize: "36px", fontWeight: "800" }}>Suggestions IA</h1>
          <p style={{ color: "var(--on-surface-variant)", marginTop: "4px" }}>
            Modérez les outils IA suggérés par la communauté et configurez l'approbation automatique.
          </p>
        </div>
        
        <button
          onClick={() => setShowSuggestModal(true)}
          style={{
            background: "var(--primary)",
            color: "var(--on-primary)",
            border: "none",
            borderRadius: "99px",
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "14px",
            transition: "all 0.2s"
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Suggérer un outil
        </button>
      </header>

      {/* Auto Approval Setting Section */}
      <section className="glass-panel" style={{
        padding: "24px",
        borderRadius: "16px",
        marginBottom: "32px",
        background: "rgba(30, 30, 36, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "rgba(102, 126, 234, 0.1)",
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>psychology</span>
          </div>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Validation automatique par l'IA</h3>
            <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", marginTop: "2px" }}>
              Activer l'auto-approbation et la publication instantanée pour les outils dont le score d'évaluation IA est supérieur ou égal à 70.
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="label-sm" style={{ 
            color: autoApprove ? "#45cf7b" : "var(--outline)",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span style={{ 
              width: "8px", 
              height: "8px", 
              borderRadius: "50%", 
              background: autoApprove ? "#45cf7b" : "var(--outline)",
              boxShadow: autoApprove ? "0 0 8px #45cf7b" : "none",
              display: "inline-block" 
            }} />
            {autoApprove ? "ACTIVÉ" : "DESACTIVÉ"}
          </span>
          <button 
            onClick={handleToggleAutoApprove}
            disabled={toggling}
            style={{
              width: "56px",
              height: "28px",
              borderRadius: "14px",
              background: autoApprove ? "var(--primary)" : "rgba(255, 255, 255, 0.1)",
              border: "none",
              position: "relative",
              cursor: toggling ? "not-allowed" : "pointer",
              transition: "background 0.3s ease",
              padding: 0
            }}
          >
            <div style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "white",
              position: "absolute",
              top: "3px",
              left: autoApprove ? "31px" : "3px",
              transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }} />
          </button>
        </div>
      </section>

      {/* Main Panel suggestions list */}
      <section className="glass-panel" style={{ padding: "24px", borderRadius: "16px", background: "rgba(30, 30, 36, 0.2)" }}>
        <div style={{ marginBottom: "20px" }}>
          <h2 className="h3-md">{suggestions.length} suggestion{suggestions.length !== 1 && "s"} en attente</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--outline)" }}>
            Chargement des suggestions...
          </div>
        ) : suggestions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--outline)" }}>lightbulb_outline</span>
            <p style={{ marginTop: "12px", color: "var(--on-surface-variant)" }}>Aucune suggestion d'outil en attente de modération.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            {suggestions.map((suggestion) => {
              const scoreColor = getScoreColor(suggestion.ai_score ?? 50);
              return (
                <div key={suggestion.id} className="glass-panel" style={{
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  background: "rgba(30, 30, 36, 0.3)",
                  position: "relative",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
                    
                    {/* Tool info */}
                    <div style={{ flex: 1, minWidth: "250px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <h3 style={{ fontSize: "20px", fontWeight: "700" }}>{suggestion.name}</h3>
                        <span style={{
                          background: scoreColor.bg,
                          color: scoreColor.color,
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}>
                          Score IA: {suggestion.ai_score ?? "N/A"}/100 ({scoreColor.label})
                        </span>
                      </div>

                      <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", marginTop: "8px", lineHeight: "1.5" }}>
                        {suggestion.description}
                      </p>

                      <div style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap", fontSize: "13px" }}>
                        <span style={{ color: "var(--outline)" }}>
                          <strong>Catégorie :</strong> {suggestion.category_name || "Non classée"}
                        </span>
                        <span style={{ color: "var(--outline)" }}>
                          <strong>Tarif :</strong> {suggestion.pricing_model}
                        </span>
                        <span style={{ color: "var(--outline)" }}>
                          <strong>Créateur :</strong> {suggestion.provider_name || "Inconnu"}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap", fontSize: "13px" }}>
                        <span style={{ color: "var(--outline)" }}>
                          <strong>Soumis par :</strong> {suggestion.submitter_name || "Utilisateur"} ({suggestion.submitter_email || "N/A"})
                        </span>
                        <span style={{ color: "var(--outline)" }}>
                          <strong>Date :</strong> {new Date(suggestion.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      {/* Clickable website URL */}
                      <div style={{ marginTop: "12px" }}>
                        <a href={suggestion.website_url} target="_blank" rel="noopener noreferrer" style={{
                          color: "var(--primary)",
                          textDecoration: "none",
                          fontSize: "14px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>open_in_new</span>
                          Visiter le site web
                        </a>
                      </div>
                    </div>

                    {/* Actions buttons */}
                    <div style={{ display: "flex", gap: "8px", alignSelf: "center" }}>
                      <button 
                        onClick={() => handleApprove(suggestion.id)}
                        disabled={actionLoading}
                        style={{
                          background: "#45cf7b",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          padding: "10px 16px",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          fontSize: "14px"
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check_circle</span>
                        Approuver
                      </button>

                      <button 
                        onClick={() => openEditModal(suggestion)}
                        disabled={actionLoading}
                        style={{
                          background: "rgba(255, 255, 255, 0.08)",
                          color: "white",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          padding: "10px 16px",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          fontSize: "14px"
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                        Modifier & Approuver
                      </button>

                      <button 
                        onClick={() => openRejectModal(suggestion)}
                        disabled={actionLoading}
                        style={{
                          background: "rgba(255, 74, 118, 0.1)",
                          color: "#ff4a76",
                          border: "1px solid rgba(255, 74, 118, 0.2)",
                          borderRadius: "8px",
                          padding: "10px 16px",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          fontSize: "14px"
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>cancel</span>
                        Rejeter
                      </button>
                    </div>

                  </div>

                  {/* AI Feedback Details */}
                  {suggestion.ai_feedback && (
                    <details style={{ marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
                      <summary style={{ cursor: "pointer", color: "var(--primary)", fontSize: "13px", fontWeight: "bold" }}>
                        Afficher l'évaluation détaillée de l'IA
                      </summary>
                      <div style={{
                        marginTop: "8px",
                        padding: "12px",
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "var(--on-surface-variant)",
                        whiteSpace: "pre-line",
                        lineHeight: "1.6"
                      }}>
                        {suggestion.ai_feedback}
                      </div>
                    </details>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* === MODAL EDIT & APPROVE === */}
      {showEditModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100,
          padding: "16px"
        }}>
          <div className="glass-panel" style={{
            width: "100%",
            maxWidth: "600px",
            background: "#1e1e24",
            borderRadius: "16px",
            padding: "24px",
            maxHeight: "90vh",
            overflowY: "auto",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <h3 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "16px" }}>Modifier la suggestion avant approbation</h3>
            
            <form onSubmit={handleEditAndApproveSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "bold" }}>Nom de l'outil *</label>
                <input 
                  type="text" 
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "bold" }}>Description *</label>
                <textarea 
                  rows="4"
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "bold" }}>Site officiel *</label>
                  <input 
                    type="url" 
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                    value={editForm.website_url}
                    onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "bold" }}>Logo (URL)</label>
                  <input 
                    type="url" 
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                    value={editForm.logo_url}
                    onChange={(e) => setEditForm({ ...editForm, logo_url: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "bold" }}>Catégorie *</label>
                  <CustomSelect
                    id="admin-suggest-edit-category-select"
                    value={editForm.main_category_id}
                    onChange={(val) => setEditForm({ ...editForm, main_category_id: val })}
                    options={categoryOptions}
                    placeholder="Sélectionner..."
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "bold" }}>Modèle Tarifaire *</label>
                  <CustomSelect
                    id="admin-suggest-edit-pricing-select"
                    value={editForm.pricing_model}
                    onChange={(val) => setEditForm({ ...editForm, pricing_model: val })}
                    options={pricingOptions}
                    placeholder="Sélectionner..."
                  />
                </div>
              </div>


              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "bold" }}>Créateur / Entreprise</label>
                <input 
                  type="text" 
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  value={editForm.provider_name}
                  onChange={(e) => setEditForm({ ...editForm, provider_name: e.target.value })}
                  placeholder="Ex. OpenAI, Google..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: "10px 18px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "none", color: "white", cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  style={{ padding: "10px 18px", borderRadius: "8px", background: "var(--primary)", border: "none", color: "white", cursor: "pointer", fontWeight: "bold" }}
                >
                  {actionLoading ? "En cours..." : "Enregistrer et Approuver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL REJECT === */}
      {showRejectModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100,
          padding: "16px"
        }}>
          <div className="glass-panel" style={{
            width: "100%",
            maxWidth: "500px",
            background: "#1e1e24",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "12px" }}>Rejeter la suggestion</h3>
            <p style={{ color: "var(--outline)", fontSize: "14px", marginBottom: "16px" }}>
              Veuillez saisir le motif du rejet de l'outil <strong>"{selectedSuggestion?.name}"</strong>. Ce motif sera envoyé au soumissionnaire.
            </p>

            <form onSubmit={handleRejectSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "bold" }}>Motif du rejet *</label>
                <textarea 
                  rows="3"
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  placeholder="Ex. L'outil n'est pas lié à l'intelligence artificielle..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button 
                  type="button" 
                  onClick={() => setShowRejectModal(false)}
                  style={{ padding: "10px 18px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "none", color: "white", cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  style={{ padding: "10px 18px", borderRadius: "8px", background: "#ff4a76", border: "none", color: "white", cursor: "pointer", fontWeight: "bold" }}
                >
                  {actionLoading ? "En cours..." : "Confirmer le rejet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === GLOBAL SUGGEST MODAL FOR ADMIN === */}
      <SuggestToolModal 
        isOpen={showSuggestModal} 
        onClose={() => setShowSuggestModal(false)} 
        onSuccess={loadData}
      />

    </div>
  );
};

export default AdminSuggestionsPage;

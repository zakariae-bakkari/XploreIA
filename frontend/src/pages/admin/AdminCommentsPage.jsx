import { useEffect, useMemo, useState } from "react";
import { aiToolApi, adminApi } from "../../api";

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
      style={{ minWidth: "260px" }}
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

const AdminCommentsPage = () => {
  const [tools, setTools] = useState([]);
  const [selectedToolId, setSelectedToolId] = useState("");
  const [toolDetails, setToolDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetReview, setDeleteTargetReview] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadTools = async () => {
    try {
      const response = await aiToolApi.getAll();
      if (response.status === "success") {
        const nextTools = response.data || [];
        setTools(nextTools);
        if (nextTools.length > 0) {
          setSelectedToolId(String(nextTools[0].id));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!selectedToolId) return;
    try {
      const res = await adminApi.reviewApi.getAll(selectedToolId);
      if (res.status === "success") {
        setComments(res.data || []);
      }
    } catch (e) {
      console.error("Failed to load reviews:", e);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedToolId) return;
      try {
        const response = await aiToolApi.getById(selectedToolId);
        if (response?.status === "success" || response?.success) {
          setToolDetails(response.data || null);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadDetails();
    loadComments();
  }, [selectedToolId]);

  // Moderation Handlers
  const handleApprove = async (reviewId) => {
    if (!confirm("Voulez-vous approuver cet avis et le publier officiellement sur le site ?")) return;
    try {
      const res = await adminApi.reviewApi.approve(reviewId);
      if (res.status === "success") {
        await loadComments();
      } else {
        alert(res.message || "Erreur lors de l'approbation.");
      }
    } catch (e) {
      alert("Une erreur inattendue est survenue.");
    }
  };

  const triggerDeleteModal = (review) => {
    setDeleteTargetReview(review);
    setShowDeleteModal(true);
  };

  const confirmDeleteReview = async () => {
    if (!deleteTargetReview) return;
    setDeleting(true);
    try {
      const res = await adminApi.reviewApi.delete(deleteTargetReview.id);
      if (res.status === "success" || res.success) {
        setShowDeleteModal(false);
        setDeleteTargetReview(null);
        await loadComments();
      } else {
        alert(res.message || "Erreur lors de la suppression.");
      }
    } catch (e) {
      alert("Une erreur inattendue est survenue.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSuspendUser = async (userId, userName) => {
    if (
      !confirm(
        `Êtes-vous absolument sûr de vouloir suspendre l'utilisateur ${userName} ?\nCette personne sera définitivement bannie et ne pourra plus publier d'avis.`
      )
    )
      return;
    try {
      const res = await adminApi.reviewApi.suspendUser(userId);
      if (res.status === "success") {
        await loadComments();
        alert(`L'utilisateur ${userName} a été suspendu avec succès.`);
      } else {
        alert(res.message || "Erreur lors de la suspension.");
      }
    } catch (e) {
      alert("Une erreur inattendue est survenue.");
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader" />
        <p style={{ marginTop: 12 }}>Chargement de l'espace de modération des commentaires...</p>
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
        }

        .custom-select-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
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

        /* Review Moderation Panel Custom styles */
        .moderation-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .premium-review-card {
          padding: 24px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color 0.2s ease;
        }

        .premium-review-card:hover {
          border-color: rgba(255, 255, 255, 0.09);
        }

        .reviewer-info-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 14px;
        }

        .reviewer-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .reviewer-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--primary);
        }

        .reviewer-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .comment-status-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 99px;
          text-transform: uppercase;
        }

        .comment-status-tag.approved {
          background: rgba(69, 207, 123, 0.12);
          color: #45cf7b;
          border: 1px solid rgba(69, 207, 123, 0.2);
        }

        .comment-status-tag.pending {
          background: rgba(255, 173, 51, 0.12);
          color: #ffad33;
          border: 1px solid rgba(255, 173, 51, 0.2);
        }

        .review-rating-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: var(--outline);
        }

        .rating-stars {
          color: #ffad33;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .user-ban-badge {
          background: rgba(255, 74, 118, 0.12);
          color: #ff4a76;
          border: 1px solid rgba(255, 74, 118, 0.2);
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 99px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .btn-moderation-suspend {
          background: rgba(255, 74, 118, 0.08);
          color: #ff4a76;
          border: 1px solid rgba(255, 74, 118, 0.15);
          border-radius: 10px;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .btn-moderation-suspend:hover {
          background: #ff4a76;
          color: #0b0b0f;
          box-shadow: 0 4px 10px rgba(255, 74, 118, 0.2);
        }

        .review-actions-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 14px;
        }

        .btn-action-approve {
          background: rgba(69, 207, 123, 0.1);
          color: #45cf7b;
          border: 1px solid rgba(69, 207, 123, 0.15);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-action-approve:hover {
          background: #45cf7b;
          color: #0b0b0f;
          box-shadow: 0 4px 12px rgba(69, 207, 123, 0.25);
        }

        .btn-action-delete {
          background: rgba(255, 74, 118, 0.1);
          color: #ff4a76;
          border: 1px solid rgba(255, 74, 118, 0.15);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-action-delete:hover {
          background: #ff4a76;
          color: #0b0b0f;
          box-shadow: 0 4px 12px rgba(255, 74, 118, 0.25);
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
          z-index: 1200;
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
          color: var(--outline);
          margin-bottom: 24px;
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

        .btn-cancel:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .btn-submit {
          background: var(--primary);
          color: #0b0b0f;
        }

        .btn-submit:hover:not(:disabled) {
          background: #00bcd4;
          box-shadow: 0 4px 12px rgba(0, 219, 233, 0.3);
        }

        .btn-danger {
          background: #ff4a76;
          color: var(--on-background);
        }

        .btn-danger:hover:not(:disabled) {
          background: #ff2d60;
          box-shadow: 0 4px 12px rgba(255, 74, 118, 0.3);
        }

        .btn-cancel:disabled, .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

      <section className="admin-page-head">
        <div>
          <p className="label-sm" style={{ color: "var(--outline)" }}>
            Gestion commentaire
          </p>
          <h1 className="h2-lg" style={{ marginTop: "8px" }}>
            Modération des avis et retours
          </h1>
          <p style={{ color: "var(--on-surface-variant)", fontSize: "14px", marginTop: "6px" }}>
            Validez les commentaires en attente, supprimez les retours hors-sujet, et suspendez les profils perturbateurs.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="material-symbols-outlined" style={{ color: "var(--outline)" }}>smart_toy</span>
          <CustomSelect
            value={selectedToolId}
            onChange={(val) => setSelectedToolId(val)}
            placeholder="Sélectionner un outil..."
            options={tools.map((tool) => ({
              value: String(tool.id),
              label: tool.name,
              description: tool.global_rating ? `Note globale : ${tool.global_rating} / 5` : "Aucune note"
            }))}
          />
        </div>
      </section>

      <div className="admin-grid-two">
        {/* Left Column: Tool information panel */}
        <section className="glass-panel admin-panel">
          <div className="admin-section-head">
            <div>
              <p className="label-sm" style={{ color: "var(--outline)" }}>
                Outil sélectionné
              </p>
              <h2 className="h3-md" style={{ marginTop: "8px" }}>
                {toolDetails?.name || "Aucun outil sélectionné"}
              </h2>
            </div>
            <span className="admin-pill">{comments.length} avis au total</span>
          </div>

          <div className="admin-comment-summary" style={{ marginTop: 20 }}>
            <div style={{ 
              width: 64, 
              height: 64, 
              borderRadius: 16, 
              overflow: "hidden", 
              marginBottom: 16, 
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0, 219, 233, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {toolDetails?.logo_url ? (
                <img 
                  src={toolDetails.logo_url} 
                  alt={toolDetails.name} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className="flex items-center justify-center"
                style={{
                  width: "100%",
                  height: "100%",
                  display: toolDetails?.logo_url ? "none" : "flex",
                  color: "var(--primary)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "32px" }}
                >
                  smart_toy
                </span>
              </div>
            </div>
            <p style={{ color: "var(--on-surface-variant)", fontSize: "14px", lineHeight: "1.6" }}>
              {toolDetails?.description ||
                "Sélectionnez un outil pour afficher ses commentaires publics et en attente."}
            </p>
            
            {toolDetails?.global_rating && (
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8, fontSize: "15px" }}>
                <span>Note globale publique :</span>
                <span style={{ color: "#ffad33", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  ★ {toolDetails.global_rating} / 5
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Moderation review card list */}
        <section className="glass-panel admin-panel">
          <div className="admin-section-head">
            <div>
              <p className="label-sm" style={{ color: "var(--outline)" }}>
                Commentaires à modérer
              </p>
              <h2 className="h3-md" style={{ marginTop: "8px" }}>
                Avis publics et en attente
              </h2>
            </div>
          </div>

          <div className="admin-review-list" style={{ marginTop: 22 }}>
            {comments.length > 0 ? (
              <div className="moderation-grid">
                {comments.map((review) => {
                  const reviewerInitials = review.user_name
                    ? review.user_name.substring(0, 2).toUpperCase()
                    : "U";
                  const isUserBanned = review.user_status === "banned";

                  return (
                    <article key={review.id} className="premium-review-card">
                      {/* Reviewer Header info */}
                      <div className="reviewer-info-flex">
                        <div className="reviewer-meta">
                          <div className="reviewer-avatar">
                            {reviewerInitials}
                          </div>
                          <div className="reviewer-details">
                            <span style={{ fontWeight: 600, fontSize: "14px" }}>{review.user_name || "Utilisateur"}</span>
                            <span style={{ fontSize: "12px", color: "var(--outline)" }}>{review.user_email}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className={`comment-status-tag ${review.status}`}>
                            {review.status === "approved" ? "Approuvé" : "En attente"}
                          </span>
                        </div>
                      </div>

                      {/* Review Rating & User Ban Status */}
                      <div className="review-rating-line">
                        <div className="rating-stars">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                          <span style={{ marginLeft: 6, color: "var(--on-background)" }}>{review.rating} / 5</span>
                        </div>

                        <div>
                          {isUserBanned ? (
                            <span className="user-ban-badge">
                              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>block</span>
                              Suspendu
                            </span>
                          ) : (
                            <button
                              className="btn-moderation-suspend"
                              title="Suspendre définitivement cet utilisateur"
                              onClick={() => handleSuspendUser(review.user_id, review.user_name)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>block</span>
                              Suspendre l'auteur
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Review comment body */}
                      <p style={{ color: "var(--on-background)", fontSize: "14px", lineHeight: "1.6", margin: "4px 0" }}>
                        {review.comment}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <small style={{ color: "var(--outline)", fontSize: "12px" }}>{review.created_at}</small>
                        
                        {/* Review Action Buttons */}
                        <div className="review-actions-footer">
                          {review.status === "pending" && (
                            <button
                              className="btn-action-approve"
                              onClick={() => handleApprove(review.id)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                              Approuver
                            </button>
                          )}
                          <button
                            className="btn-action-delete"
                            onClick={() => triggerDeleteModal(review)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="admin-empty-state" style={{ minHeight: 280 }}>
                <span className="material-symbols-outlined">forum</span>
                <p style={{ marginTop: 12 }}>Aucun commentaire enregistré pour cet outil d'IA.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal: Delete Review Confirmation */}
      {showDeleteModal && deleteTargetReview && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 10px 0" }}>
              <span className="material-symbols-outlined" style={{ color: "#ff4a76", fontSize: "24px" }}>warning</span>
              Supprimer le commentaire ?
            </h3>
            <p className="modal-desc" style={{ fontSize: "14px", color: "var(--outline)", lineHeight: "1.6", marginBottom: "20px" }}>
              Êtes-vous sûr de vouloir supprimer définitivement le commentaire de <strong>{deleteTargetReview.user_name}</strong> ? Cette action est irréversible et recalculera la note moyenne globale de l'outil d'IA.
            </p>
            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "16px", marginBottom: "24px" }}>
              <div style={{ fontSize: "12px", color: "var(--outline)", marginBottom: "6px" }}>Extrait du commentaire :</div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--on-background)", fontStyle: "italic" }}>
                "{deleteTargetReview.comment.length > 140 ? deleteTargetReview.comment.substring(0, 140) + '...' : deleteTargetReview.comment}"
              </p>
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn-submit btn-danger" 
                onClick={confirmDeleteReview}
                disabled={deleting}
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommentsPage;

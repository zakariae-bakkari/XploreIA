import { useEffect, useState } from "react";
import { userApi } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

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
      style={{ minWidth: "200px" }}
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

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Modals & Action State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (roleFilter) params.role = roleFilter;

      const res = await userApi.adminGetAll(params);
      if (res.status === "success") {
        setUsers(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadUsers();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, roleFilter]);

  // Action Handlers
  const handleToggleSuspension = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      triggerNotification("error", "Vous ne pouvez pas modifier votre propre statut d'accès.");
      return;
    }

    setProcessingId(targetUser.id);
    try {
      const isCurrentlyBanned = targetUser.status === "banned";
      const apiCall = isCurrentlyBanned ? userApi.adminUnsuspend : userApi.adminSuspend;
      const res = await apiCall(targetUser.id);

      if (res.status === "success" || res.success) {
        triggerNotification(
          "success",
          `Compte de ${targetUser.name} ${isCurrentlyBanned ? "réactivé" : "suspendu"} avec succès.`
        );
        await loadUsers();
      } else {
        triggerNotification("error", res.message || "Erreur lors de la modification du statut.");
      }
    } catch (err) {
      triggerNotification("error", "Une erreur inattendue est survenue.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleChangeRole = async (targetUser, newRole) => {
    if (targetUser.id === currentUser?.id) {
      triggerNotification("error", "Vous ne pouvez pas modifier votre propre rôle administratif.");
      return;
    }

    setProcessingId(targetUser.id);
    try {
      const res = await userApi.adminChangeRole(targetUser.id, newRole);
      if (res.status === "success" || res.success) {
        triggerNotification("success", `Rôle de ${targetUser.name} modifié en '${newRole}' avec succès.`);
        await loadUsers();
      } else {
        triggerNotification("error", res.message || "Erreur lors du changement de rôle.");
      }
    } catch (err) {
      triggerNotification("error", "Une erreur inattendue est survenue.");
    } finally {
      setProcessingId(null);
    }
  };

  const triggerDeleteModal = (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      triggerNotification("error", "Vous ne pouvez pas supprimer votre propre compte administrateur depuis ce panel.");
      return;
    }
    setDeleteTargetUser(targetUser);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setProcessingId(deleteTargetUser.id);
    try {
      const res = await userApi.adminDelete(deleteTargetUser.id);
      if (res.status === "success" || res.success) {
        setShowDeleteModal(false);
        triggerNotification("success", `Compte de ${deleteTargetUser.name} supprimé définitivement.`);
        setDeleteTargetUser(null);
        await loadUsers();
      } else {
        triggerNotification("error", res.message || "Erreur lors de la suppression du compte.");
      }
    } catch (err) {
      triggerNotification("error", "Une erreur inattendue est survenue.");
    } finally {
      setProcessingId(null);
    }
  };

  const triggerNotification = (type, message) => {
    if (type === "success") {
      setSuccessMessage(message);
      setErrorMessage("");
      setTimeout(() => setSuccessMessage(""), 4000);
    } else {
      setErrorMessage(message);
      setSuccessMessage("");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

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

        /* User Management custom dashboard layout */
        .user-filters-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 20px;
          width: 100%;
        }

        .user-search-container {
          position: relative;
          flex: 1;
          min-width: 260px;
        }

        .user-search-container input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--on-background);
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .user-search-container input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 12px rgba(0, 219, 233, 0.15);
        }

        .user-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--outline);
          font-size: 20px;
        }

        .user-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 24px;
          width: 100%;
        }

        .premium-user-card {
          padding: 24px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .premium-user-card:hover {
          border-color: rgba(255, 255, 255, 0.09);
        }

        .user-info-flex {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .user-avatar-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          color: var(--primary);
        }

        .user-metadata-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }

        .user-name-title {
          font-weight: 600;
          font-size: 15px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-email-subtitle {
          font-size: 13px;
          color: var(--outline);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-badge-indicator {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 99px;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .status-badge-indicator.active {
          background: rgba(69, 207, 123, 0.1);
          color: #45cf7b;
          border: 1px solid rgba(69, 207, 123, 0.15);
        }

        .status-badge-indicator.suspended {
          background: rgba(255, 74, 118, 0.1);
          color: #ff4a76;
          border: 1px solid rgba(255, 74, 118, 0.15);
        }

        .user-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding: 12px 0;
          font-size: 13px;
        }

        .user-controls-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 4px;
        }

        .btn-user-suspend, .btn-user-unsuspend {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .btn-user-suspend {
          background: rgba(255, 74, 118, 0.08);
          color: #ff4a76;
          border: 1px solid rgba(255, 74, 118, 0.12);
        }

        .btn-user-suspend:hover {
          background: #ff4a76;
          color: #0b0b0f;
          box-shadow: 0 4px 12px rgba(255, 74, 118, 0.2);
        }

        .btn-user-unsuspend {
          background: rgba(69, 207, 123, 0.08);
          color: #45cf7b;
          border: 1px solid rgba(69, 207, 123, 0.12);
        }

        .btn-user-unsuspend:hover {
          background: #45cf7b;
          color: #0b0b0f;
          box-shadow: 0 4px 12px rgba(69, 207, 123, 0.2);
        }

        .btn-user-delete-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--outline);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-user-delete-icon:hover {
          background: rgba(255, 74, 118, 0.1);
          color: #ff4a76;
          border-color: rgba(255, 74, 118, 0.2);
          transform: scale(1.05);
        }

        /* Notifications style */
        .admin-toast-banner {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 16px 20px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 2000;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
        }

        .admin-toast-banner.success {
          background: #142c20;
          color: #45cf7b;
          border: 1px solid rgba(69, 207, 123, 0.25);
        }

        .admin-toast-banner.error {
          background: #2d181c;
          color: #ff4a76;
          border: 1px solid rgba(255, 74, 118, 0.25);
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

      {/* Header section */}
      <section className="admin-page-head">
        <div>
          <p className="label-sm" style={{ color: "var(--outline)" }}>
            Contrôle d'accès
          </p>
          <h1 className="h2-lg" style={{ marginTop: "8px" }}>
            Gestion des Utilisateurs
          </h1>
          <p style={{ color: "var(--on-surface-variant)", fontSize: "14px", marginTop: "6px" }}>
            Supervisez les rôles d'accès, suspendez les profils suspects et purgez définitivement les comptes du catalogue.
          </p>
        </div>
      </section>

      {/* Filters system */}
      <section className="glass-panel admin-panel" style={{ padding: "20px 24px" }}>
        <div className="user-filters-bar">
          {/* Live search input */}
          <div className="user-search-container">
            <span className="material-symbols-outlined user-search-icon">search</span>
            <input
              type="text"
              placeholder="Rechercher par nom ou adresse email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "13px", color: "var(--outline)", fontWeight: "600" }}>Statut</span>
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              placeholder="Tous les statuts"
              options={[
                { value: "", label: "Tous les statuts" },
                { value: "active", label: "Actifs uniquement" },
                { value: "banned", label: "Suspendus uniquement" }
              ]}
            />
          </div>

          {/* Role filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "13px", color: "var(--outline)", fontWeight: "600" }}>Rôle</span>
            <CustomSelect
              value={roleFilter}
              onChange={(val) => setRoleFilter(val)}
              placeholder="Tous les rôles"
              options={[
                { value: "", label: "Tous les rôles" },
                { value: "user", label: "Utilisateurs uniquement" },
                { value: "admin", label: "Administrateurs uniquement" }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Main Grid display */}
      {loading ? (
        <div className="admin-loading" style={{ minHeight: 300 }}>
          <div className="loader" />
          <p style={{ marginTop: 12 }}>Actualisation des comptes utilisateurs...</p>
        </div>
      ) : users.length > 0 ? (
        <div className="user-grid">
          {users.map((u) => {
            const isSuspended = u.status === "banned";
            const initials = u.name ? u.name.substring(0, 2).toUpperCase() : "U";
            const isMe = u.id === currentUser?.id;

            return (
              <article key={u.id} className="premium-user-card">
                {/* Info block */}
                <div className="user-info-flex">
                  <div className="user-avatar-circle">
                    {initials}
                  </div>
                  <div className="user-metadata-details">
                    <h3 className="user-name-title" title={u.name}>
                      {u.name} {isMe && <span style={{ color: "var(--primary)", fontSize: "11px", fontWeight: "600" }}>(Vous)</span>}
                    </h3>
                    <p className="user-email-subtitle" title={u.email}>{u.email}</p>
                  </div>
                </div>

                {/* Status indicator row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className={`status-badge-indicator ${isSuspended ? "suspended" : "active"}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
                      {isSuspended ? "block" : "verified"}
                    </span>
                    {isSuspended ? "Suspendu" : "Actif"}
                  </span>
                  
                  {/* Custom Role Selector for non-self accounts */}
                  {!isMe ? (
                    <CustomSelect
                      value={u.role}
                      onChange={(role) => handleChangeRole(u, role)}
                      placeholder="Sélectionner rôle"
                      options={[
                        { value: "user", label: "Utilisateur", description: "Accès public standard" },
                        { value: "admin", label: "Administrateur", description: "Accès total au backoffice" }
                      ]}
                    />
                  ) : (
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--primary)" }}>
                      Administrateur Principal
                    </span>
                  )}
                </div>

                {/* Meta details */}
                <div className="user-meta-row">
                  <span style={{ color: "var(--outline)" }}>Date d'inscription</span>
                  <span style={{ fontWeight: 500 }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "--"}
                  </span>
                </div>

                {/* Footer buttons controls */}
                <div className="user-controls-footer">
                  {!isMe ? (
                    <>
                      <button
                        type="button"
                        className={isSuspended ? "btn-user-unsuspend" : "btn-user-suspend"}
                        onClick={() => handleToggleSuspension(u)}
                        disabled={processingId === u.id}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                          {isSuspended ? "lock_open" : "lock"}
                        </span>
                        {isSuspended ? "Réactiver" : "Suspendre"}
                      </button>
                      <button
                        type="button"
                        className="btn-user-delete-icon"
                        title="Supprimer définitivement ce compte"
                        onClick={() => triggerDeleteModal(u)}
                        disabled={processingId === u.id}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                      </button>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--outline)", fontStyle: "italic" }}>
                      Sécurisé — Actions impossibles sur votre profil.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="admin-empty-state" style={{ minHeight: 300, marginTop: 24 }}>
          <span className="material-symbols-outlined">group</span>
          <p style={{ marginTop: 12 }}>Aucun compte utilisateur ne correspond à votre filtre de recherche.</p>
        </div>
      )}

      {/* Modal: Delete User Confirmation */}
      {showDeleteModal && deleteTargetUser && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 10px 0" }}>
              <span className="material-symbols-outlined" style={{ color: "#ff4a76", fontSize: "24px" }}>warning</span>
              Supprimer le compte utilisateur ?
            </h3>
            <p className="modal-desc" style={{ fontSize: "14px", color: "var(--outline)", lineHeight: "1.6", marginBottom: "20px" }}>
              Êtes-vous absolument sûr de vouloir supprimer définitivement le compte de <strong>{deleteTargetUser.name}</strong> ({deleteTargetUser.email}) ?
            </p>
            
            <div style={{ 
              background: "rgba(255, 74, 118, 0.05)", 
              border: "1px solid rgba(255, 74, 118, 0.15)", 
              borderRadius: "16px", 
              padding: "16px", 
              marginBottom: "24px",
              display: "flex",
              alignItems: "flex-start",
              gap: 12
            }}>
              <span className="material-symbols-outlined" style={{ color: "#ff4a76", fontSize: "20px", marginTop: "2px" }}>error</span>
              <p style={{ margin: 0, fontSize: "13px", color: "#ff4a76", lineHeight: "1.5" }}>
                <strong>Attention cascade :</strong> Cette action supprimera également tous les avis, collections de playlists, et éléments de playlists enregistrés par cet utilisateur de manière irréversible.
              </p>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => setShowDeleteModal(false)}
                disabled={processingId === deleteTargetUser.id}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn-submit btn-danger" 
                onClick={confirmDeleteUser}
                disabled={processingId === deleteTargetUser.id}
              >
                {processingId === deleteTargetUser.id ? "Suppression..." : "Confirmer et supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications toast bar */}
      {successMessage && (
        <div className="admin-toast-banner success">
          <span className="material-symbols-outlined">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="admin-toast-banner error">
          <span className="material-symbols-outlined">error</span>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

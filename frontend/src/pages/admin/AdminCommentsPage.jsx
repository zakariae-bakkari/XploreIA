import { useEffect, useMemo, useState } from "react";
import { aiToolApi } from "../../api";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, []);

  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedToolId) return;
      const response = await aiToolApi.getById(selectedToolId);
      if (response?.status === "success" || response?.success) {
        setToolDetails(response.data || null);
      }
    };

    loadDetails();
  }, [selectedToolId]);

  const reviews = useMemo(() => toolDetails?.reviews || [], [toolDetails]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader" />
        <p>Chargement des commentaires...</p>
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
      `}</style>

      <section className="admin-page-head">
        <div>
          <p className="label-sm" style={{ color: "var(--outline)" }}>
            Gestion commentaire
          </p>
          <h1 className="h2-lg" style={{ marginTop: "8px" }}>
            Avis et retours utilisateurs
          </h1>
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
        <section className="glass-panel admin-panel">
          <div className="admin-section-head">
            <div>
              <p className="label-sm" style={{ color: "var(--outline)" }}>
                Sélection
              </p>
              <h2 className="h3-md" style={{ marginTop: "8px" }}>
                {toolDetails?.name || "Aucun outil sélectionné"}
              </h2>
            </div>
            <span className="admin-pill">{reviews.length} avis</span>
          </div>

          <div className="admin-comment-summary">
            <p style={{ color: "var(--on-surface-variant)" }}>
              {toolDetails?.description ||
                "Sélectionnez un outil pour afficher ses commentaires publics."}
            </p>
          </div>
        </section>

        <section className="glass-panel admin-panel">
          <div className="admin-section-head">
            <div>
              <p className="label-sm" style={{ color: "var(--outline)" }}>
                Commentaires
              </p>
              <h2 className="h3-md" style={{ marginTop: "8px" }}>
                Derniers avis
              </h2>
            </div>
          </div>

          <div className="admin-review-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <article key={review.id} className="admin-review-card">
                  <div className="admin-review-top">
                    <strong>{review.user_name || "Utilisateur"}</strong>
                    <span className="admin-pill">{review.rating} / 5</span>
                  </div>
                  <p>{review.comment}</p>
                  <small>{review.created_at}</small>
                </article>
              ))
            ) : (
              <div className="admin-empty-state">
                <span className="material-symbols-outlined">forum</span>
                <p>Aucun commentaire disponible pour cet outil.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminCommentsPage;

import { useEffect, useMemo, useState } from "react";
import { aiToolApi } from "../../api";

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
      <section className="admin-page-head">
        <div>
          <p className="label-sm" style={{ color: "var(--outline)" }}>
            Gestion commentaire
          </p>
          <h1 className="h2-lg" style={{ marginTop: "8px" }}>
            Avis et retours utilisateurs
          </h1>
        </div>
        <label className="admin-search glass-panel">
          <span className="material-symbols-outlined">smart_toy</span>
          <select
            value={selectedToolId}
            onChange={(e) => setSelectedToolId(e.target.value)}
          >
            {tools.map((tool) => (
              <option key={tool.id} value={tool.id}>
                {tool.name}
              </option>
            ))}
          </select>
        </label>
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

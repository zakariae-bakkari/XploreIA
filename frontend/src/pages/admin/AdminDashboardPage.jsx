import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { aiToolApi, userApi } from "../../api";

const StatCard = ({ label, value, hint, icon, accent = "var(--primary)" }) => (
  <div className="glass-panel admin-stat-card">
    <div
      className="admin-stat-icon"
      style={{ color: accent, background: `${accent}18` }}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div>
      <p className="label-sm" style={{ color: "var(--outline)" }}>
        {label}
      </p>
      <h3 className="h2-lg" style={{ marginTop: "8px" }}>
        {value}
      </h3>
      <p
        style={{
          color: "var(--on-surface-variant)",
          fontSize: "13px",
          marginTop: "6px",
        }}
      >
        {hint}
      </p>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [tools, setTools] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    categories: [],
    characteristics: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [toolsRes, usersRes, filtersRes] = await Promise.all([
          aiToolApi.getAll(),
          userApi.getAll(),
          aiToolApi.getFilters(),
        ]);

        if (toolsRes.status === "success") setTools(toolsRes.data || []);
        if (usersRes.status === "success") setUsers(usersRes.data || []);
        if (filtersRes.status === "success") {
          setFilters({
            categories: filtersRes.data?.categories || [],
            characteristics: filtersRes.data?.characteristics || [],
          });
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const recentTools = useMemo(() => tools.slice(0, 5), [tools]);
  const activeCategories = useMemo(
    () => filters.categories.slice(0, 6),
    [filters.categories],
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader" />
        <p>Chargement du centre de contrôle...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <section className="admin-hero glass-panel">
        <div>
          <p className="label-sm" style={{ color: "var(--outline)" }}>
            Dashboard admin
          </p>
          <h1 className="h1-xl" style={{ marginTop: "12px" }}>
            Centre de gestion XploreIA
          </h1>
          <p
            style={{
              color: "var(--on-surface-variant)",
              maxWidth: "760px",
              marginTop: "14px",
            }}
          >
            Surveillez le catalogue, structurez la taxonomie et suivez les
            retours utilisateurs depuis un seul espace de contrôle.
          </p>
        </div>
        <div className="admin-hero-actions">
          <Link to="/admin/tools" className="btn-primary">
            Gérer les outils
          </Link>
          <Link
            to="/admin/comments"
            className="btn-primary"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "var(--primary)",
            }}
          >
            Voir les avis
          </Link>
        </div>
      </section>

      <section className="admin-stats-grid">
        <StatCard
          label="Utilisateurs"
          value={users.length}
          hint="Comptes visibles dans l'administration"
          icon="group"
          accent="var(--secondary)"
        />
        <StatCard
          label="Outils publiés"
          value={tools.length}
          hint="Catalogue actuellement exposé"
          icon="robot_2"
          accent="var(--primary-fixed-dim)"
        />
        <StatCard
          label="Catégories"
          value={filters.categories.length}
          hint="Taxonomie disponible"
          icon="category"
          accent="var(--secondary-fixed-dim)"
        />
        <StatCard
          label="Caractéristiques"
          value={filters.characteristics.length}
          hint="Attributs filtrables"
          icon="tune"
          accent="var(--primary-container)"
        />
      </section>

      <div className="admin-grid-two">
        <section className="glass-panel admin-panel">
          <div className="admin-section-head">
            <div>
              <p className="label-sm" style={{ color: "var(--outline)" }}>
                Activité récente
              </p>
              <h2 className="h3-md" style={{ marginTop: "8px" }}>
                Derniers outils exposés
              </h2>
            </div>
            <Link to="/admin/tools" className="admin-inline-link">
              Ouvrir la gestion
            </Link>
          </div>

          <div className="admin-list">
            {recentTools.map((tool) => (
              <article key={tool.id} className="admin-list-item">
                <div className="admin-list-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0, 219, 233, 0.05)" }}>
                  {tool.logo_url ? (
                    <img 
                      src={tool.logo_url} 
                      alt={tool.name} 
                      onError={(e) => {
                        e.target.style.display = "none";
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}
                  <span 
                    className="material-symbols-outlined" 
                    style={{ 
                      display: tool.logo_url ? "none" : "flex",
                      color: "var(--primary)"
                    }}
                  >
                    smart_toy
                  </span>
                </div>
                <div className="admin-list-copy">
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                </div>
                <div className="admin-list-meta">
                  <span className="admin-pill">
                    {tool.category_name || "Sans catégorie"}
                  </span>
                  <span style={{ color: "var(--outline)", fontSize: "13px" }}>
                    {tool.global_rating || "0.0"} / 5
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel admin-panel">
          <div className="admin-section-head">
            <div>
              <p className="label-sm" style={{ color: "var(--outline)" }}>
                Taxonomie
              </p>
              <h2 className="h3-md" style={{ marginTop: "8px" }}>
                Catégories en vue
              </h2>
            </div>
            <Link to="/admin/categories" className="admin-inline-link">
              Explorer
            </Link>
          </div>

          <div className="admin-chip-grid">
            {activeCategories.map((category) => (
              <div key={category.id} className="admin-chip">
                <strong>{category.name}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

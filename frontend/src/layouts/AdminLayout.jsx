import { NavLink, Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../contexts/AuthContext";
import AiChatbot from "../components/ui/AiChatbot";
import "../style/admin.css";

const adminNavItems = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: "space_dashboard",
    description: "Vue globale",
  },
  {
    to: "/admin/categories",
    label: "Catégories",
    icon: "category",
    description: "Taxonomie et attributs",
  },
  {
    to: "/admin/tools",
    label: "AI Tools",
    icon: "robot_2",
    description: "Catalogue et statut",
  },
  {
    to: "/admin/comments",
    label: "Commentaires",
    icon: "forum",
    description: "Avis et retours",
  },
  {
    to: "/admin/users",
    label: "Utilisateurs",
    icon: "group",
    description: "Rôles et accès",
  },
];

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <div className="admin-page-shell">
      <Navbar />
      <div className="admin-shell">
        <aside className="admin-sidebar glass-panel">
          <div className="admin-brand">
            <div className="admin-brand-mark">
              <span className="material-symbols-outlined">shield_person</span>
            </div>
            <div>
              <p className="label-sm" style={{ color: "var(--outline)" }}>
                Panneau admin
              </p>
              <h2 className="h3-md" style={{ marginTop: "4px" }}>
                XploreIA Control
              </h2>
            </div>
          </div>

          <div className="admin-user-card">
            <span className="admin-user-initials">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
            </span>
            <div>
              <p style={{ fontWeight: 700 }}>
                {user?.name || "Administrateur"}
              </p>
              <p
                style={{ color: "var(--on-surface-variant)", fontSize: "13px" }}
              >
                {user?.email || "Session active"}
              </p>
            </div>
          </div>

          <nav className="admin-nav">
             {adminNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="admin-nav-copy">
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="admin-side-note glass-panel">
            <p className="label-sm" style={{ color: "var(--outline)" }}>
              Accès rapide
            </p>
            <p
              style={{
                marginTop: "8px",
                color: "var(--on-surface-variant)",
                fontSize: "14px",
              }}
            >
              Utilisez les vues dédiées pour superviser le catalogue, la
              taxonomie et les retours utilisateurs.
            </p>
          </div>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
      <AiChatbot />
    </div>
  );
};

export default AdminLayout;

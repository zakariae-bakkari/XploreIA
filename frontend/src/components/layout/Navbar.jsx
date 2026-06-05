import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import SuggestToolModal from "../ui/SuggestToolModal";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [navSearch, setNavSearch] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);

  const handleSuggestClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      setShowSuggest(true);
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/discover?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
    }
  };

  const getInitials = (name) => {
    if (!name) return "X";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
    <nav
      className="navbar"
      style={{
        background: "rgba(19, 19, 23, 0.3)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="container nav-content"
        style={{
          display: "flex",
          justifyContent: "between",
          alignItems: "center",
          width: "100%",
          maxWidth: "100%",
          padding: "0 64px",
        }}
      >
        <div className="flex items-center gap-xl">
          <Link
            to="/"
            className="flex items-center gap-base"
            style={{ textDecoration: "none" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--primary-fixed-dim)", fontSize: "30px" }}
            >
              explore
            </span>
            <span
              className="h3-md"
              style={{ color: "var(--primary)", fontWeight: "bold" }}
            >
              XploreIA
            </span>
          </Link>

          <div className="nav-links flex gap-md">
            <Link
              to="/discover"
              className={`nav-link ${isActive("/discover") ? "active" : ""}`}
              style={{ fontSize: "14px", fontWeight: "500" }}
            >
              Découvrir
            </Link>
            <button
              onClick={handleSuggestClick}
              className="nav-link"
              style={{ 
                fontSize: "14px", 
                fontWeight: "500",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0",
                fontFamily: "inherit"
              }}
            >
              Suggérer un outil
            </button>
            {user && (
              <Link
                to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                className={`nav-link ${isActive("/dashboard") || location.pathname.startsWith("/admin") ? "active" : ""}`}
                style={{ fontSize: "14px", fontWeight: "500" }}
              >
                Tableau de Bord
              </Link>
            )}
            <Link
              to="/debug"
              className={`nav-link ${isActive("/debug") ? "active" : ""}`}
              style={{ fontSize: "14px", fontWeight: "500" }}
            >
              debug
            </Link>
          </div>
        </div>

        <div
          className="flex items-center gap-lg"
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          {/* Search Bar in Navbar */}
          <form
            onSubmit={handleNavSearch}
            className="hidden lg:flex items-center nav-search-form"
          >
            <input
              type="text"
              placeholder="Rechercher sur le marché..."
              className="nav-search-input"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
            />
          </form>

          <div className="flex items-center gap-md">
            <button
              onClick={toggleTheme}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isDarkMode ? "var(--secondary)" : "var(--primary)",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              title={isDarkMode ? "Passer au thème clair" : "Passer au thème sombre"}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>
                {isDarkMode ? "light_mode" : "dark_mode"}
              </span>
            </button>

            {user ? (
              <div className="flex items-center gap-md">
                <Link
                  to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                  className="btn-primary"
                  style={{
                    padding: "10px 24px",
                    fontSize: "13px",
                    borderRadius: "99px",
                    textDecoration: "none",
                  }}
                >
                  {user.role === "admin" ? "Admin" : "Commencer"}
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center justify-center"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "var(--on-primary)",
                    fontWeight: "bold",
                    fontSize: "14px",
                    textDecoration: "none",
                    border: "1px solid rgba(0, 219, 233, 0.2)",
                  }}
                >
                  {getInitials(user.name)}
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-link"
                  style={{ fontSize: "14px" }}
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                  style={{
                    padding: "10px 24px",
                    fontSize: "13px",
                    borderRadius: "99px",
                    textDecoration: "none",
                  }}
                >
                  Commencer
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
    <SuggestToolModal isOpen={showSuggest} onClose={() => setShowSuggest(false)} />
    </>
  );
};

export default Navbar;

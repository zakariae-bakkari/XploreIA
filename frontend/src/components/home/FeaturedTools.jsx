import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { aiToolApi } from "../../api";
import ToolCard from "../ui/ToolCard";

export default function FeaturedTools() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const response = await aiToolApi.getFeatured();
        if (response.status === "success" && response.data) {
          setFeatured(response.data);
        } else {
          setError(response.message || "Failed to load featured tools");
          setFeatured([]);
        }
      } catch (err) {
        setError(err.message || "An error occurred");
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  if (loading) return <div className="h3-md">Loading featured tools...</div>;
  if (error)
    return (
      <div className="h3-md" style={{ color: "var(--error)" }}>
        {error}
      </div>
    );

  return (
    <>
      <div>
        <h1
          className="h2-lg"
          style={{ textAlign: "center", padding: "32px 0" }}
        >
          Featured tools
        </h1>
        <div className="tool-grid">
          {featured.length > 0 ? (
            featured.map((tool) => <ToolCard tool={tool} key={tool.id} />)
          ) : (
            <p>No featured tools available.</p>
          )}
        </div>
        {/* bouton to discover more */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "48px",
          }}
        >
          <button
            className="btn-primary"
            onClick={() => navigate("/discover")}
            style={{ padding: "12px 32px", fontSize: "14px" }}
          >
            Discover More
          </button>
        </div>
      </div>
    </>
  );
}

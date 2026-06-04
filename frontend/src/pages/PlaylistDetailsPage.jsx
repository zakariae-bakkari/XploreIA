import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { playlistApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/ui/ConfirmModal';

const slugify = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
};

const PlaylistDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [playlist, setPlaylist] = useState(null);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Remove tool modal state
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [toolToRemove, setToolToRemove] = useState(null);

  const fetchPlaylistData = async () => {
    if (!user?.email || !id) return;
    try {
      setLoading(true);
      
      // 1. Fetch user's playlists to get name/desc
      const playlistsRes = await playlistApi.getAllByUser(user.email);
      if (playlistsRes.status === 'success') {
        const found = playlistsRes.data.find(p => String(p.id) === String(id));
        if (found) {
          setPlaylist(found);
        } else {
          setError("Collection introuvable ou vous n'êtes pas autorisé à la voir.");
          setLoading(false);
          return;
        }
      }

      // 2. Fetch the tools inside this playlist
      const contentRes = await playlistApi.getContent(id);
      if (contentRes.status === 'success') {
        setTools(contentRes.data);
        
        // Populate slugMap in localStorage so that details page works directly
        const slugMap = JSON.parse(localStorage.getItem('xplore_slug_map') || '{}');
        contentRes.data.forEach(item => {
          slugMap[slugify(item.tool_name)] = item.tool_id;
        });
        localStorage.setItem('xplore_slug_map', JSON.stringify(slugMap));
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la récupération des détails de la collection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylistData();
  }, [user, id]);

  const handleOpenRemove = (tool) => {
    setToolToRemove(tool);
    setIsRemoveModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!toolToRemove || !id) return;
    try {
      const res = await playlistApi.removeTool({
        playlist_id: id,
        tool_id: toolToRemove.tool_id
      });
      if (res.status === 'success') {
        // Refresh data
        fetchPlaylistData();
      } else {
        alert(res.message || "Erreur lors du retrait de l'outil.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors du retrait.");
    } finally {
      setIsRemoveModalOpen(false);
      setToolToRemove(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center" style={{ padding: '100px' }}>
          <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(0, 219, 233, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
          <p style={{ marginTop: '16px', color: 'var(--on-surface-variant)' }}>Chargement de la collection...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !playlist) {
    return (
      <DashboardLayout>
        <div className="glass-panel flex flex-col items-center justify-center" style={{ padding: '80px', textAlign: 'center', borderRadius: '32px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(255, 77, 77, 0.05)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>error</span>
          </div>
          <h3 className="h3-md">Erreur</h3>
          <p className="body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '400px', margin: '16px 0 32px' }}>
            {error || "La collection n'a pas pu être trouvée."}
          </p>
          <Link to="/favorites" className="btn-primary" style={{ textDecoration: 'none' }}>Retour à Mes Favoris</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="fade-in">
        {/* Back Link */}
        <Link to="/favorites" className="flex items-center gap-xs" style={{ color: 'var(--on-surface-variant)', marginBottom: '32px', textDecoration: 'none', width: 'fit-content' }}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="label-sm">Retour à Mes Favoris</span>
        </Link>

        {/* Collection Header */}
        <header style={{ marginBottom: '40px' }}>
          <div className="flex items-center gap-md" style={{ marginBottom: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(0, 219, 233, 0.15) 0%, rgba(235, 178, 255, 0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>folder_special</span>
            </div>
            <div>
              <h1 className="h2-lg" style={{ margin: 0 }}>{playlist.name}</h1>
              <div className="flex items-center gap-sm" style={{ marginTop: '8px' }}>
                <span className="label-sm" style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '99px', color: 'var(--outline)' }}>
                  {tools.length} {tools.length > 1 ? 'Outils' : 'Outil'}
                </span>
                <span className="label-sm" style={{ color: playlist.is_public ? 'var(--primary)' : 'var(--outline)' }}>
                  {playlist.is_public ? 'Public' : 'Privé'}
                </span>
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--on-surface-variant)', maxWidth: '800px', fontSize: '15px', lineHeight: '1.6' }}>
            {playlist.description || "Aucune description fournie pour cette collection."}
          </p>
        </header>

        {/* Tools Content */}
        {tools.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center" style={{ padding: '80px', textAlign: 'center', borderRadius: '32px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(0, 219, 233, 0.05)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>auto_awesome</span>
            </div>
            <h3 className="h3-md">Aucun outil</h3>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '400px', margin: '16px 0 32px' }}>
              Cette collection ne contient aucun outil IA pour le moment. Explorez le marché et ajoutez-en !
            </p>
            <Link to="/discover" className="btn-primary" style={{ textDecoration: 'none' }}>Découvrir des outils</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(item => {
              const toolDetailsLink = `/discover/${slugify(item.tool_name)}`;
              return (
                <div key={item.id} className="glass-panel pl-card-premium" style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Tool Image */}
                  <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden', borderRadius: '20px', marginBottom: '20px' }}>
                    <img 
                      src={item.logo_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"} 
                      alt={item.tool_name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800";
                      }}
                    />
                  </div>

                  {/* Tool Meta */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 className="h3-sm" style={{ marginBottom: '8px' }}>{item.tool_name}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                      {item.tool_desc || "Aucune description fournie pour cet outil."}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-sm">
                      <Link to={toolDetailsLink} className="btn-primary flex-1 text-center" style={{ textDecoration: 'none', padding: '10px', fontSize: '13px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Détails
                      </Link>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={() => handleOpenRemove(item)}
                        style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255, 77, 77, 0.2)', color: '#ff4d4d' }}
                        title="Retirer de la collection"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', display: 'block' }}>delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      <ConfirmModal 
        isOpen={isRemoveModalOpen}
        title="Retirer l'outil"
        message={`Êtes-vous sûr de vouloir retirer "${toolToRemove?.tool_name}" de votre collection?`}
        confirmText="Retirer"
        cancelText="Annuler"
        onConfirm={handleConfirmRemove}
        onCancel={() => {
          setIsRemoveModalOpen(false);
          setToolToRemove(null);
        }}
        type="danger"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .pl-card-premium {
          padding: 32px;
          border-radius: 32px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(12px);
        }
        .pl-card-premium:hover {
          transform: translateY(-8px);
          border-color: rgba(0, 219, 233, 0.3);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          background: rgba(255, 255, 255, 0.04);
        }
        body.light-mode .pl-card-premium {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        body.light-mode .pl-card-premium:hover {
          background: rgba(255, 255, 255, 0.9);
          border-color: var(--primary);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }
      `}} />
    </DashboardLayout>
  );
};

export default PlaylistDetailsPage;

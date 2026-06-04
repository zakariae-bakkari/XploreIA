import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { playlistApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import PlaylistCard from '../components/playlists/PlaylistCard';
import PlaylistModal from '../components/playlists/PlaylistModal';
import ConfirmModal from '../components/ui/ConfirmModal';

const FavoritesPage = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', is_public: false });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  const fetchPlaylists = async () => {
    if (!user?.email) return;
    try {
      const res = await playlistApi.getAllByUser(user.email);
      if (res.status === 'success') {
        setPlaylists(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch playlists", err);
      setError("Could not load your collections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [user]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentPlaylist(null);
    setFormData({ name: '', description: '', is_public: false });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pl) => {
    setIsEditing(true);
    setCurrentPlaylist(pl);
    setFormData({ 
      name: pl.name, 
      description: pl.description || '', 
      is_public: pl.is_public === 1 || pl.is_public === true 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await playlistApi.update({ ...formData, id: currentPlaylist.id, email: user.email });
      } else {
        await playlistApi.create({ ...formData, email: user.email });
      }
      setIsModalOpen(false);
      fetchPlaylists();
    } catch (err) {
      alert("Error saving playlist: " + err.message);
    }
  };

  const handleDelete = (id) => {
    setPlaylistToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!playlistToDelete) return;
    try {
      await playlistApi.delete(playlistToDelete);
      setIsDeleteConfirmOpen(false);
      setPlaylistToDelete(null);
      fetchPlaylists();
    } catch (err) {
      alert("Error deleting playlist");
    }
  };

  return (
    <DashboardLayout>
      <div className="fade-in">
        <header className="flex justify-between items-center" style={{ marginBottom: '40px' }}>
          <div>
            <h1 className="h2-lg">Mes Favoris</h1>
            <p style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>
              Gérez vos collections et vos boîtes à outils IA personnalisées.
            </p>
          </div>
          <button className="btn-primary flex items-center gap-sm" onClick={handleOpenCreate}>
            <span className="material-symbols-outlined">add_circle</span>
            <span>Nouvelle Collection</span>
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: '100px' }}>
             <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(0, 219, 233, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
             <p style={{ marginTop: '16px', color: 'var(--on-surface-variant)' }}>Synchronisation de vos collections...</p>
          </div>
        ) : playlists.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center" style={{ padding: '80px', textAlign: 'center', borderRadius: '32px' }}>
             <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(0, 219, 233, 0.05)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>playlist_add</span>
             </div>
             <h3 className="h3-md">Aucune collection</h3>
             <p className="body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '400px', margin: '16px 0 32px' }}>
               Commencez à regrouper vos outils IA préférés dans des playlists spécialisées pour un accès plus rapide.
             </p>
             <button className="btn-primary" onClick={handleOpenCreate}>Créer votre première liste</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map(pl => (
              <PlaylistCard 
                key={pl.id} 
                pl={pl} 
                handleOpenEdit={handleOpenEdit} 
                handleDelete={handleDelete} 
              />
            ))}
          </div>
        )}

        {/* Modal Overlay */}
        {isModalOpen && (
          <PlaylistModal 
            isEditing={isEditing}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            setIsModalOpen={setIsModalOpen}
          />
        )}

        {/* Custom Delete Confirmation Modal */}
        <ConfirmModal 
          isOpen={isDeleteConfirmOpen}
          title="Supprimer la collection"
          message="Êtes-vous sûr de vouloir supprimer cette collection ? Tous les outils sauvegardés à l'intérieur seront définitivement retirés."
          confirmText="Supprimer"
          cancelText="Annuler"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsDeleteConfirmOpen(false);
            setPlaylistToDelete(null);
          }}
          type="danger"
        />
      </div>

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
        .icon-btn-subtle {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: none;
          color: var(--outline);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .icon-btn-subtle:hover {
          background: rgba(255,255,255,0.1);
          color: white;
          transform: scale(1.1);
        }
        .glass-input {
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 16px !important;
          padding: 16px !important;
          color: white !important;
          width: 100%;
          outline: none;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        .glass-input:focus {
          border-color: var(--primary) !important;
          background: rgba(255, 255, 255, 0.06) !important;
          box-shadow: 0 0 0 4px rgba(0, 219, 233, 0.1);
        }
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        .modal-overlay {
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .input-group label {
          margin-bottom: 12px;
          display: block;
          font-weight: 600;
          letter-spacing: 1px;
          color: var(--primary);
          font-size: 11px;
          text-transform: uppercase;
        }
        .btn-primary.flex-1 {
          background: var(--primary);
          color: var(--on-primary);
          border: none;
          padding: 14px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-primary.flex-1:hover {
          filter: brightness(1.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 219, 233, 0.3);
        }
        .btn-secondary.flex-1 {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 14px;
          border-radius: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-secondary.flex-1:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
      `}} />
    </DashboardLayout>
  );
};

export default FavoritesPage;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { playlistApi } from '../../api';

const SaveButton = ({ tool }) => {
  const { user } = useAuth();
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      playlistApi.checkSaved(user.email, tool.id).then(res => {
        if (res.status === 'success') {
          setSavedPlaylists(res.data);
        }
      });
      playlistApi.getAllByUser(user.email).then(res => {
        if (res.status === 'success') {
          setAllPlaylists(res.data);
        }
      });
    }
  }, [user, tool.id]);

  if (!user) return null;

  const isSaved = savedPlaylists.length > 0;

  const handleToggle = async () => {
    if (isSaved) {
      // Remove from all saved playlists
      setLoading(true);
      for (let p of savedPlaylists) {
        await playlistApi.removeTool({ playlist_id: p.id, tool_id: tool.id });
      }
      setSavedPlaylists([]);
      setLoading(false);
    } else {
      // Open modal to choose playlist
      setShowModal(true);
    }
  };

  const saveToPlaylist = async (playlistId) => {
    setLoading(true);
    await playlistApi.addTool({ playlist_id: playlistId, tool_id: tool.id });
    const addedPlaylist = allPlaylists.find(p => p.id === playlistId);
    setSavedPlaylists([...savedPlaylists, addedPlaylist]);
    setShowModal(false);
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={handleToggle}
        disabled={loading}
        title={isSaved ? "Retirer de la collection" : "Ajouter à une collection"}
        style={{ 
          background: isSaved ? 'rgba(182, 0, 248, 0.15)' : 'rgba(255,255,255,0.05)', 
          border: isSaved ? '1px solid var(--secondary-container)' : '1px solid var(--outline)', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '50px',
          height: '50px',
          borderRadius: '12px',
          transition: 'all 0.2s',
        }}
      >
        <span 
          className="material-symbols-outlined" 
          style={{ 
            fontSize: '28px', 
            color: isSaved ? 'var(--secondary-container)' : 'var(--on-surface)',
            fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0"
          }}
        >
          bookmark
        </span>
      </button>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '400px', padding: '32px', borderRadius: '24px' }}>
            <h3 className="h3-md" style={{ marginBottom: '24px' }}>Enregistrer dans...</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {allPlaylists.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => saveToPlaylist(p.id)}
                  style={{ 
                    padding: '16px', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px', 
                    textAlign: 'left', 
                    color: 'var(--on-surface)', 
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  {p.name}
                </button>
              ))}
              {allPlaylists.length === 0 && <p style={{ color: 'var(--on-surface-variant)' }}>Aucune collection trouvée.</p>}
            </div>
            <button 
              onClick={() => setShowModal(false)}
              style={{ 
                marginTop: '24px', 
                width: '100%', 
                padding: '12px', 
                background: 'transparent', 
                border: '1px solid var(--outline)', 
                color: 'var(--on-surface)', 
                borderRadius: '12px', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SaveButton;

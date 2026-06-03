import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSaved) {
      // Remove from all saved playlists
      setLoading(true);
      for (let p of savedPlaylists) {
        await playlistApi.removeTool({ playlist_id: p.id, tool_id: tool.id });
      }
      setSavedPlaylists([]);
      setLoading(false);
    } else {
      if (allPlaylists.length === 0) {
        setLoading(true);
        try {
          await playlistApi.create({ email: user.email, name: 'Favoris', description: 'Mes outils IA sauvegardés', is_public: 0 });
          const res = await playlistApi.getAllByUser(user.email);
          if (res.status === 'success') {
            setAllPlaylists(res.data);
            const fav = res.data.find(p => p.name === 'Favoris') || res.data[0];
            if (fav) {
              await playlistApi.addTool({ playlist_id: fav.id, tool_id: tool.id });
              setSavedPlaylists([fav]);
            }
          }
        } catch (e) {
          console.error(e);
        }
        setLoading(false);
      } else {
        // Open modal to choose playlist
        setShowModal(true);
      }
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

      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); setShowModal(false); }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--outline)', width: '400px', padding: '32px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '24px', color: 'var(--on-surface)', fontSize: '20px', fontWeight: 'bold' }}>Enregistrer dans...</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
              {allPlaylists.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => saveToPlaylist(p.id)}
                  style={{ padding: '12px', textAlign: 'left', background: 'var(--surface-container-low)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderRadius: '12px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-container)'; e.currentTarget.style.color = 'var(--on-primary-container)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-container-low)'; e.currentTarget.style.color = 'var(--on-surface)'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
                >
                  {p.name}
                </button>
              ))}
              {allPlaylists.length === 0 && <p style={{ color: 'var(--on-surface-variant)' }}>Aucune collection trouvée.</p>}
            </div>

            <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '20px', marginTop: '10px', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Nouvelle collection..." 
                id="newPlaylistName"
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--outline)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)' }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    const name = e.target.value.trim();
                    if (name) {
                      setLoading(true);
                      await playlistApi.create({ email: user.email, name, description: '', is_public: 0 });
                      const res = await playlistApi.getAllByUser(user.email);
                      if (res.status === 'success') {
                        setAllPlaylists(res.data);
                        const p = res.data.find(p => p.name === name);
                        if (p) await saveToPlaylist(p.id);
                      }
                      setLoading(false);
                    }
                  }
                }}
              />
              <button 
                onClick={async () => {
                  const input = document.getElementById('newPlaylistName');
                  const name = input?.value.trim();
                  if (name) {
                    setLoading(true);
                    await playlistApi.create({ email: user.email, name, description: '', is_public: 0 });
                    const res = await playlistApi.getAllByUser(user.email);
                    if (res.status === 'success') {
                      setAllPlaylists(res.data);
                      const p = res.data.find(p => p.name === name);
                      if (p) await saveToPlaylist(p.id);
                    }
                    setLoading(false);
                  }
                }}
                style={{ padding: '10px 16px', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Créer
              </button>
            </div>

            <button 
              onClick={() => setShowModal(false)}
              style={{ marginTop: '24px', width: '100%', padding: '12px', background: 'transparent', border: '1px solid var(--outline)', color: 'var(--on-surface)', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Fermer
            </button>
          </div>
        </div>
      , document.body)}
    </>
  );
};

export default SaveButton;

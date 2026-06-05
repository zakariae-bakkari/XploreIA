import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { playlistApi } from '../../api';
import CustomSelect from './CustomSelect';

const SaveButton = ({ tool }) => {
  const { user } = useAuth();
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
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
          if (res.data && res.data.length > 0) {
            setSelectedPlaylistId(res.data[0].id);
          }
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
              setSelectedPlaylistId(fav.id);
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
        if (allPlaylists.length > 0) {
          setSelectedPlaylistId(allPlaylists[0].id);
        }
        setShowModal(true);
      }
    }
  };

  const saveToPlaylist = async (playlistId, updatedPlaylists = null) => {
    if (!playlistId) return;
    setLoading(true);
    await playlistApi.addTool({ playlist_id: playlistId, tool_id: tool.id });
    const list = updatedPlaylists || allPlaylists;
    const addedPlaylist = list.find(p => p.id === playlistId);
    if (addedPlaylist && !savedPlaylists.some(p => p.id === playlistId)) {
      setSavedPlaylists([...savedPlaylists, addedPlaylist]);
    }
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
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: '700', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Choisir une Collection</label>
              <CustomSelect
                value={selectedPlaylistId}
                onChange={(val) => setSelectedPlaylistId(val)}
                options={allPlaylists.map(p => ({ value: p.id, label: p.name }))}
                placeholder="Sélectionner une collection..."
              />
            </div>

            <button 
              onClick={() => saveToPlaylist(selectedPlaylistId)}
              disabled={!selectedPlaylistId || loading}
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: 'var(--primary)', 
                color: '#0b0b0f', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                transition: 'all 0.2s',
                marginBottom: '16px'
              }}
            >
              <span className="material-symbols-outlined">bookmark_add</span>
              Enregistrer
            </button>

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
                        if (p) {
                          setSelectedPlaylistId(p.id);
                          e.target.value = '';
                          await saveToPlaylist(p.id, res.data);
                        }
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
                      if (p) {
                        setSelectedPlaylistId(p.id);
                        if (input) input.value = '';
                        await saveToPlaylist(p.id, res.data);
                      }
                    }
                    setLoading(false);
                  }
                }}
                style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Créer
              </button>
            </div>

            <button 
              onClick={() => setShowModal(false)}
              style={{ marginTop: '20px', width: '100%', padding: '12px', background: 'transparent', border: '1px solid var(--outline)', color: 'var(--on-surface)', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
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

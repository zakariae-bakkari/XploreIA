import { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import './PlaylistsPage.css';

const PlaylistsPage = () => {
    const userEmail = 'noureddine@gmail.com';
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // View Management
    const [view, setView] = useState('list'); // 'list', 'details', 'edit', 'create'
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [playlistItems, setPlaylistItems] = useState([]);
    
    // Form States
    const [formData, setFormData] = useState({ name: '', description: '' });

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            const res = await apiRequest(`playlists?email=${userEmail}`);
            if (res.status === 'success') setPlaylists(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await apiRequest('playlists/create', {
                method: 'POST',
                body: JSON.stringify({ ...formData, email: userEmail })
            });
            setFormData({ name: '', description: '' });
            setView('list');
            fetchPlaylists();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await apiRequest('playlists/update', {
                method: 'POST',
                body: JSON.stringify({ ...formData, id: selectedPlaylist.id, email: userEmail })
            });
            alert(res.message);
            setView('details'); // Redirection vers la page de la playlist modifiée
            fetchPlaylists();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer la playlist entière ?')) return;
        try {
            const res = await apiRequest(`playlists/delete?id=${id}`, { method: 'POST' });
            alert(res.message);
            setView('list');
            fetchPlaylists();
        } catch (err) {
            alert(err.message);
        }
    };

    const openDetails = async (playlist) => {
        setSelectedPlaylist(playlist);
        setLoading(true);
        try {
            const res = await apiRequest(`playlists/content?id=${playlist.id}`);
            setPlaylistItems(res.data);
            setView('details');
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (playlist) => {
        setSelectedPlaylist(playlist);
        setFormData({ name: playlist.name, description: playlist.description || '' });
        setView('edit');
    };

    if (loading && view === 'list') return <div className="loading">Chargement...</div>;

    return (
        <div className="playlists-page">
            {view === 'list' && (
                <div className="view-list">
                    <header className="section-header">
                        <h1>Mes Playlists</h1>
                        <button className="create-btn" onClick={() => { setFormData({name:'', description:''}); setView('create'); }}>+ Créer une playlist</button>
                    </header>
                    
                    <div className="spacer"></div>

                    <div className="playlists-grid">
                        {playlists.map(pl => (
                            <div key={pl.id} className="pl-card" onClick={() => openDetails(pl)}>
                                <div className="pl-icon">📁</div>
                                <h3>{pl.name}</h3>
                                <p>{pl.description || 'Pas de description'}</p>
                                <span className="count">{pl.item_count} outils</span>
                                <div className="pl-actions-inline">
                                    <button onClick={(e) => { e.stopPropagation(); openEdit(pl); }}>Modifier</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(view === 'create' || view === 'edit') && (
                <div className="view-form card">
                    <h2>{view === 'create' ? 'Créer une playlist' : 'Modifier playlist'}</h2>
                    <form onSubmit={view === 'create' ? handleCreate : handleUpdate}>
                        <div className="form-group">
                            <label>Nom de la playlist</label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea 
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})} 
                            />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="outline-btn" onClick={() => setView('list')}>Annuler</button>
                            <button type="submit" className="primary-btn">Valider</button>
                        </div>
                    </form>
                </div>
            )}

            {view === 'details' && selectedPlaylist && (
                <div className="view-details">
                    <header className="details-header">
                        <button className="back-link" onClick={() => setView('list')}>← Retour</button>
                        <h1>{selectedPlaylist.name}</h1>
                        <p>{selectedPlaylist.description}</p>
                        <div className="header-actions">
                            <button className="outline-btn" onClick={() => openEdit(selectedPlaylist)}>Modifier playlist</button>
                            <button className="danger-btn" onClick={() => handleDelete(selectedPlaylist.id)}>Supprimer la playlist</button>
                        </div>
                    </header>

                    <div className="items-list">
                        {playlistItems.length > 0 ? (
                            playlistItems.map(item => (
                                <div key={item.id} className="item-row">
                                    <img src={item.logo_url} alt="" />
                                    <div className="item-info">
                                        <h4>{item.tool_name}</h4>
                                        <p>{item.tool_desc}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-msg">Cette playlist est vide.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaylistsPage;

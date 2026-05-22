import React from 'react';

const PlaylistModal = ({ isEditing, formData, setFormData, handleSubmit, setIsModalOpen }) => {
  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '500px', padding: '40px', borderRadius: '32px', position: 'relative' }}>
        <button 
          onClick={() => setIsModalOpen(false)} 
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--outline)', cursor: 'pointer' }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 className="h2-md" style={{ marginBottom: '32px' }}>
          {isEditing ? 'Modifier la Collection' : 'Nouvelle Collection'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div className="input-group">
            <label className="label-sm">Nom de la collection</label>
            <input 
              type="text" 
              placeholder="ex: Outils de création de contenu" 
              className="glass-input" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>

          <div className="input-group">
            <label className="label-sm">Description (Optionnel)</label>
            <textarea 
              placeholder="À quoi sert cette collection ?" 
              className="glass-input" 
              style={{ minHeight: '120px', resize: 'none' }}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>



          <div className="flex gap-md" style={{ marginTop: '20px' }}>
            <button type="button" className="btn-secondary flex-1" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" className="btn-primary flex-1">
              {isEditing ? 'Mettre à jour' : 'Créer la collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaylistModal;

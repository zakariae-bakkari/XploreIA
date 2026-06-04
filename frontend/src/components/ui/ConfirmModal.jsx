import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Supprimer", 
  cancelText = "Annuler", 
  type = "danger" 
}) => {
  if (!isOpen) return null;

  const btnPrimaryStyle = type === 'danger' 
    ? { background: '#ff4d4d', color: '#ffffff', border: 'none' } 
    : { background: 'var(--primary)', color: 'var(--on-primary)', border: 'none' };

  return (
    <div 
      className="modal-overlay" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.8)', 
        backdropFilter: 'blur(8px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000, 
        padding: '20px' 
      }}
    >
      <div 
        className="glass-panel fade-in" 
        style={{ 
          width: '100%', 
          maxWidth: '400px', 
          padding: '32px', 
          borderRadius: '24px', 
          textAlign: 'center', 
          border: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(30, 30, 35, 0.65)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 1px 1px 0px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div 
          style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: type === 'danger' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(0, 219, 233, 0.1)', 
            color: type === 'danger' ? '#ff4d4d' : 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
            {type === 'danger' ? 'warning' : 'info'}
          </span>
        </div>
        
        <h3 className="h3-md" style={{ marginBottom: '12px', fontWeight: '600' }}>{title}</h3>
        
        <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '28px', fontSize: '14px', lineHeight: '1.6' }}>
          {message}
        </p>
        
        <div className="flex gap-md">
          <button 
            type="button"
            className="btn-secondary flex-1" 
            onClick={onCancel} 
            style={{ 
              padding: '12px 20px', 
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {cancelText}
          </button>
          <button 
            type="button"
            className="btn-primary flex-1" 
            onClick={onConfirm} 
            style={{ 
              padding: '12px 20px', 
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              ...btnPrimaryStyle
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

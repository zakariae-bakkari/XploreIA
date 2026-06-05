import React from 'react';

const Modal = ({ title, children, onClose, className }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-card ${className || ''}`} onClick={(e) => e.stopPropagation()}>
        {title && <h3>{title}</h3>}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

import React, { useState, useEffect } from "react";

const CustomSelect = ({ id, value, onChange, options, placeholder = "Sélectionner..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  return (
    <div 
      id={id}
      className="custom-select-container" 
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
      style={{ width: "100%" }}
    >
      <div className={`custom-select-trigger ${isOpen ? "open" : ""}`}>
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="material-symbols-outlined select-arrow">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </div>

      {isOpen && (
        <ul className="custom-select-options">
          {options.length > 0 ? (
            options.map((opt) => (
              <li
                key={opt.value}
                id={id ? `${id}-opt-${opt.value}` : undefined}
                className={`custom-select-option ${opt.value === value ? "selected" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <div className="option-content-flex">
                  <span className="option-label">{opt.label}</span>
                  {opt.description && (
                    <span className="option-desc">{opt.description}</span>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="custom-select-option" style={{ color: "var(--outline)", fontStyle: "italic", cursor: "default" }}>
              Aucune option disponible
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;

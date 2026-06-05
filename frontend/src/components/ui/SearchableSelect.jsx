import React, { useState, useRef, useEffect } from 'react';

const SearchableSelect = ({ options = [], value, onChange, placeholder = '-- Sélectionner --' }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef();

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const filtered = options.filter(o => o.name.toLowerCase().includes(q.toLowerCase()));

  const selected = options.find(o => o.id === value);

  return (
    <div className="searchable-select" ref={ref}>
      <div className="searchable-input cyber-input" onClick={() => setOpen(!open)}>
        <div style={{ flex: 1 }}>{selected ? selected.name : placeholder}</div>
        <div style={{ marginLeft: 8 }}>{open ? '▴' : '▾'}</div>
      </div>
      {open && (
        <div className="searchable-panel glass-card">
          <input className="cyber-input" placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} />
          <ul className="searchable-list">
            <li key="__none__" onClick={() => { onChange(''); setOpen(false); }}>{placeholder}</li>
            {filtered.map(o => (
              <li key={o.id} onClick={() => { onChange(o.id); setOpen(false); }}>{o.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;

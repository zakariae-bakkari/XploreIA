import React, { useState, useRef, useEffect } from 'react';

const TagMultiSelect = ({ options = [], values = [], onChange }) => {
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

  const toggle = (id) => {
    if (values.includes(id)) onChange(values.filter(v => v !== id));
    else onChange([...values, id]);
  };

  return (
    <div className="tag-multiselect" ref={ref}>
      <div className="tag-input cyber-input" onClick={() => setOpen(!open)}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {values.length === 0 && <span style={{ opacity: 0.6 }}>Sélectionner...</span>}
          {values.map(v => {
            const opt = options.find(o => o.id === v);
            return opt ? (
              <span key={v} className="tag-chip">
                {opt.name}
                <button type="button" className="tag-remove" onClick={(e) => { e.stopPropagation(); toggle(v); }}>&times;</button>
              </span>
            ) : null;
          })}
        </div>
        <div style={{ marginLeft: 8 }}>{open ? '▴' : '▾'}</div>
      </div>
      {open && (
        <div className="tag-panel glass-card">
          <input className="cyber-input" placeholder="Filtrer..." value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="tag-list">
            {filtered.map(o => (
              <div key={o.id} className="tag-row" onClick={() => toggle(o.id)}>
                <input type="checkbox" checked={values.includes(o.id)} readOnly />
                <span style={{ marginLeft: 8 }}>{o.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagMultiSelect;

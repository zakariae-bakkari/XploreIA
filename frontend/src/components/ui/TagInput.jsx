import React, { useState, useRef, useEffect } from 'react';

const TagInput = ({ values = [], onChange, suggestions = [] }) => {
  const [input, setInput] = useState('');
  const [filtered, setFiltered] = useState(suggestions);
  const ref = useRef();

  useEffect(() => setFiltered(suggestions), [suggestions]);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setFiltered(suggestions); };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [suggestions]);

  const addTag = (tag) => {
    const t = tag.trim();
    if (!t) return;
    if (!values.includes(t)) onChange([...values, t]);
    setInput('');
  };

  const removeTag = (tag) => onChange(values.filter(v => v !== tag));

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input.replace(/,$/, ''));
    } else if (e.key === 'Backspace' && input === '') {
      // remove last
      removeTag(values[values.length - 1]);
    }
  };

  const onSuggest = (s) => addTag(s);

  useEffect(() => {
    const q = input.toLowerCase();
    setFiltered(suggestions.filter(s => s.toLowerCase().includes(q) && !values.includes(s)));
  }, [input, suggestions, values]);

  return (
    <div className="tag-input-component" ref={ref}>
      <div className="tag-input-area cyber-input" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {values.map(v => (
          <span key={v} className="tag-chip">
            {v}
            <button className="tag-remove" onClick={() => removeTag(v)} type="button">×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ajouter un tag (Entrée ou virgule)"
          style={{ flex: 1, minWidth: 120, background: 'transparent', border: 'none', color: 'inherit' }}
        />
      </div>
      {filtered.length > 0 && input.length > 0 && (
        <div className="tag-suggestions glass-card">
          {filtered.slice(0, 20).map(s => (
            <div key={s} className="tag-suggest" onClick={() => onSuggest(s)}>{s}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;

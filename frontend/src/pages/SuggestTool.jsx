import React, { useState } from 'react';
import { suggestionApi } from '../api';

function SuggestTool() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website_url: '',
    logo_url: '',
    category: '',
    pricing_model: 'unknown',
    provider_name: '',
    user_id: null
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const categories = [
    'Text Generation',
    'Image Generation',
    'Code Assistant',
    'Audio & Voice',
    'Video Generation',
    'Chatbot & Assistant',
    'Data & Analytics'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      const response = await suggestionApi.submit(formData);
      setResult({
        success: true,
        message: 'Suggestion soumise avec succès !',
        ai_score: response.data.ai_score,
        ai_feedback: response.data.ai_feedback,
        ai_details: response.data.ai_details
      });
      setFormData({
        name: '',
        description: '',
        website_url: '',
        logo_url: '',
        category: '',
        pricing_model: 'unknown',
        provider_name: '',
        user_id: null
      });
    } catch (err) {
      setResult({
        success: false,
        message: err.message || 'Erreur lors de la soumission'
      });
      if (err.errors) setErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>💡 Suggérer un outil IA</h1>
      <p>Vous connaissez un outil IA qui n'est pas encore dans notre catalogue ? Proposez-le nous !</p>
      
      {/* AFFICHAGE DU RÉSULTAT */}
      {result && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          background: result.success ? '#e8f5e9' : '#ffebee',
          color: result.success ? '#2e7d32' : '#c62828',
          border: `1px solid ${result.success ? '#a5d6a7' : '#ef9a9a'}`
        }}>
          <strong>{result.message}</strong>
          
          {/* 👇👇👇 CODE POUR LE SCORE IA - METS LE ICI 👇👇👇 */}
          {result.ai_score !== undefined && (
            <div style={{ marginTop: '10px' }}>
              <div>📊 Score IA: 
                <strong style={{
                  fontSize: '24px',
                  color: result.ai_score >= 70 ? '#2e7d32' : 
                         result.ai_score >= 50 ? '#ed6c02' : '#c62828'
                }}> {result.ai_score}/100</strong>
              </div>
              <div>💬 Feedback: {result.ai_feedback}</div>
              {result.ai_details && (
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', color: '#667eea' }}>
                    Voir le détail des critères
                  </summary>
                  <div style={{ marginTop: '10px', fontSize: '14px' }}>
                    {Object.entries(result.ai_details).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '5px' }}>
                        • {key.replace('_', ' ')}: {value}/{
                          key === 'description_quality' ? 20 :
                          key === 'category_relevance' ? 15 :
                          key === 'credibility' ? 15 :
                          key === 'innovation' ? 20 : 30
                        }
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
          {/* 👆👆👆 FIN DU CODE SCORE IA 👆👆👆 */}
          
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Nom de l'outil *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            required
          />
          {errors.name && <small style={{ color: 'red' }}>{errors.name}</small>}
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            required
          />
          {errors.description && <small style={{ color: 'red' }}>{errors.description}</small>}
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Site web *
          </label>
          <input
            type="url"
            name="website_url"
            value={formData.website_url}
            onChange={handleChange}
            placeholder="https://..."
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            required
          />
          {errors.website_url && <small style={{ color: 'red' }}>{errors.website_url}</small>}
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Logo (URL)
          </label>
          <input
            type="url"
            name="logo_url"
            value={formData.logo_url}
            onChange={handleChange}
            placeholder="https://..."
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Catégorie *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <small style={{ color: 'red' }}>{errors.category}</small>}
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Modèle de tarification
          </label>
          <select
            name="pricing_model"
            value={formData.pricing_model}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          >
            <option value="unknown">Inconnu</option>
            <option value="free">Gratuit</option>
            <option value="freemium">Freemium</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Créateur / Entreprise
          </label>
          <input
            type="text"
            name="provider_name"
            value={formData.provider_name}
            onChange={handleChange}
            placeholder="Ex: OpenAI, Google, Anthropic..."
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Soumission en cours...' : '📤 Soumettre la suggestion'}
        </button>
      </form>
    </div>
  );
}

export default SuggestTool;
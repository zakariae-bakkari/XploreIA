import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { aiToolApi, apiRequest } from '../api'  // ← AJOUTE apiRequest ici

function ToolDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [tool, setTool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchToolDetail = async () => {
      try {
        setLoading(true)
        // Utilise aiToolApi.getById (recommandé)
        const response = await apiRequest(`ai-tools-detail?id=${id}`);
        // OU si tu préfères apiRequest
        // const response = await apiRequest(`ai-tools/${id}`)
        console.log('Réponse:', response)
        setTool(response.data)
        setError(null)
      } catch (err) {
        console.error('Erreur:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchToolDetail()
    }
  }, [id])

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating || 0)

    for (let i = 0; i < fullStars; i++) {
      stars.push('★')
    }
    for (let i = fullStars; i < 5; i++) {
      stars.push('☆')
    }

    return stars.join('')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e0e0e0',
          borderTopColor: '#667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <p style={{ marginTop: '20px' }}>Chargement du détail...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h2 style={{ color: '#d32f2f' }}>Erreur</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Retour à l'accueil
        </button>
      </div>
    )
  }

  if (!tool) return null

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: 'none',
          color: '#667eea',
          fontSize: '16px',
          cursor: 'pointer',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        ← Retour à la liste
      </button>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {tool.logo_url && (
            <img
              src={tool.logo_url}
              alt={tool.name}
              style={{ width: '100px', height: '100px', borderRadius: '16px', objectFit: 'contain' }}
            />
          )}

          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 8px 0' }}>{tool.name}</h1>
            <p style={{ color: '#667eea', marginBottom: '8px' }}>
              {tool.provider_name} • {tool.category_name}
            </p>
            <div style={{ fontSize: '24px', color: '#ffc107' }}>
              {renderStars(tool.global_rating)}
              <span style={{ fontSize: '14px', color: '#666', marginLeft: '8px' }}>
                ({tool.global_rating || 'Non noté'})
              </span>
            </div>
            {tool.website_url && (
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: '#667eea',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px'
                }}
              >
                Visiter le site →
              </a>
            )}
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #e0e0e0',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'overview' ? 'bold' : 'normal',
            borderBottom: activeTab === 'overview' ? '2px solid #667eea' : 'none',
            color: activeTab === 'overview' ? '#667eea' : '#666'
          }}
        >
           Aperçu
        </button>
        <button
          onClick={() => setActiveTab('details')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'details' ? 'bold' : 'normal',
            borderBottom: activeTab === 'details' ? '2px solid #667eea' : 'none',
            color: activeTab === 'details' ? '#667eea' : '#666'
          }}
        >
          Caractéristiques
        </button>
      </div>

      {activeTab === 'overview' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
          <h3>Description</h3>
          <p style={{ lineHeight: 1.6, color: '#444' }}>{tool.description}</p>

          {tool.advantages && tool.advantages.length > 0 && (
            <>
              <h3> Avantages</h3>
              <ul>
                {tool.advantages.map((adv, i) => (
                  <li key={i}>{adv.name || adv.advantage_name}</li>
                ))}
              </ul>
            </>
          )}

          {tool.disadvantages && tool.disadvantages.length > 0 && (
            <>
              <h3> Inconvénients</h3>
              <ul>
                {tool.disadvantages.map((dis, i) => (
                  <li key={i}>{dis.name || dis.disadvantage_name}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
          <h3>Caractéristiques techniques</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            {tool.characteristics && tool.characteristics.map((char, index) => (
              <span
                key={index}
                style={{
                  background: '#f0f0ff',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}
              >
                {char.name}
              </span>
            ))}
          </div>

          {tool.models && tool.models.length > 0 && (
            <>
              <h3 style={{ marginTop: '32px' }}>Modèles</h3>
              {tool.models.map((model, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <strong>{model.name}</strong>
                  <p style={{ marginTop: '8px', color: '#666' }}>{model.description}</p>
                </div>
              ))}
            </>
          )}

          {tool.pricing_plans && tool.pricing_plans.length > 0 && (
            <>
              <h3 style={{ marginTop: '32px' }}> Tarifs</h3>
              {tool.pricing_plans.map((plan, index) => (
                <div
                  key={index}
                  style={{
                    background: '#e8f5e9',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <strong>{plan.plan_name}</strong>
                  {plan.price_month && <p>{plan.price_month}€/mois</p>}
                  {plan.price_year && <p>{plan.price_year}€/an</p>}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ToolDetail
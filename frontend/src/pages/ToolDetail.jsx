import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiRequest } from '../api'

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
        const response = await apiRequest(`ai-tools-detail?id=${id}`)
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
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Chargement du détail...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Erreur</h2>
        <p style={styles.errorMessage}>{error}</p>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          Retour à l'accueil
        </button>
      </div>
    )
  }

  if (!tool) return null

  return (
    <div style={styles.container}>
      {/* En-tête avec bouton retour */}
      <button onClick={() => navigate('/')} style={styles.backNavButton}>
        ← Retour à la liste
      </button>

      {/* Carte principale : Informations générales */}
      <div style={styles.mainCard}>
        <div style={styles.headerRow}>
          {tool.logo_url && (
            <img src={tool.logo_url} alt={tool.name} style={styles.logo} />
          )}
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>{tool.name}</h1>
            <p style={styles.meta}>
              {tool.provider_name} • {tool.category_name}
            </p>
            <div style={styles.ratingRow}>
              <span style={styles.stars}>{renderStars(tool.global_rating)}</span>
              <span style={styles.ratingValue}>
                {tool.global_rating || 'Non noté'} / 5
              </span>
            </div>
            {tool.website_url && (
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.websiteButton}
              >
                Visiter le site →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'overview' ? styles.tabButtonActive : {})
          }}
        >
          Aperçu
        </button>
        <button
          onClick={() => setActiveTab('details')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'details' ? styles.tabButtonActive : {})
          }}
        >
          Caractéristiques
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'pricing' ? styles.tabButtonActive : {})
          }}
        >
          Tarifs
        </button>
        <button
          onClick={() => setActiveTab('models')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'models' ? styles.tabButtonActive : {})
          }}
        >
          Modèles
        </button>
      </div>

      {/* Contenu des onglets */}
      <div style={styles.contentCard}>
        {/* Onglet Aperçu */}
        {activeTab === 'overview' && (
          <div>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}> Description</h3>
              <p style={styles.description}>{tool.description}</p>
            </div>

            {tool.advantages && tool.advantages.length > 0 && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}> Avantages</h3>
                <div style={styles.tagsContainer}>
                  {tool.advantages.map((adv, i) => (
                    <span key={i} style={{ ...styles.tag, ...styles.tagSuccess }}>
                      {adv.name || adv.advantage_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tool.disadvantages && tool.disadvantages.length > 0 && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}> Inconvénients</h3>
                <div style={styles.tagsContainer}>
                  {tool.disadvantages.map((dis, i) => (
                    <span key={i} style={{ ...styles.tag, ...styles.tagDanger }}>
                      {dis.name || dis.disadvantage_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Caractéristiques techniques */}
        {activeTab === 'details' && (
          <div>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}> Caractéristiques techniques</h3>
              <div style={styles.tagsContainer}>
                {tool.characteristics && tool.characteristics.map((char, index) => (
                  <span key={index} style={styles.techTag}>
                    {char.name}
                  </span>
                ))}
              </div>
            </div>

            {tool.metadata && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}> Métadonnées</h3>
                <div style={styles.metadataGrid}>
                  {Object.entries(tool.metadata).map(([key, value]) => (
                    <div key={key} style={styles.metadataItem}>
                      <span style={styles.metadataKey}>{key}:</span>
                      <span style={styles.metadataValue}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Tarifs */}
        {activeTab === 'pricing' && (
          <div>
            {tool.pricing_plans && tool.pricing_plans.length > 0 ? (
              <div style={styles.pricingGrid}>
                {tool.pricing_plans.map((plan, index) => (
                  <div key={index} style={styles.pricingCard}>
                    <h4 style={styles.planName}>{plan.plan_name}</h4>
                    {plan.price_month && (
                      <p style={styles.planPrice}>{plan.price_month}€<span style={styles.planPeriod}>/mois</span></p>
                    )}
                    {plan.price_year && (
                      <p style={styles.planPrice}>{plan.price_year}€<span style={styles.planPeriod}>/an</span></p>
                    )}
                    {plan.features && plan.features.length > 0 && (
                      <ul style={styles.planFeatures}>
                        {plan.features.map((feature, i) => (
                          <li key={i}>✓ {feature}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.emptyMessage}>Aucune information tarifaire disponible</p>
            )}
          </div>
        )}

        {/* Onglet Modèles */}
        {activeTab === 'models' && (
          <div>
            {tool.models && tool.models.length > 0 ? (
              <div style={styles.modelsList}>
                {tool.models.map((model, index) => (
                  <div key={index} style={styles.modelCard}>
                    <h4 style={styles.modelName}>{model.name}</h4>
                    <p style={styles.modelDescription}>{model.description}</p>
                    {model.version && (
                      <span style={styles.modelVersion}>Version: {model.version}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.emptyMessage}>Aucun modèle disponible</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  // Conteneur principal
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },

  // Bouton retour navigation
  backNavButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '24px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 0',
    fontWeight: '500'
  },

  // Carte principale
  mainCard: {
    background: 'white',
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0'
  },

  headerRow: {
    display: 'flex',
    gap: '28px',
    flexWrap: 'wrap'
  },

  logo: {
    width: '100px',
    height: '100px',
    borderRadius: '20px',
    objectFit: 'contain',
    background: '#f8f9fa',
    padding: '12px'
  },

  headerInfo: {
    flex: 1
  },

  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e'
  },

  meta: {
    color: '#667eea',
    marginBottom: '12px',
    fontSize: '14px',
    fontWeight: '500'
  },

  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },

  stars: {
    fontSize: '22px',
    color: '#ffc107',
    letterSpacing: '2px'
  },

  ratingValue: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },

  websiteButton: {
    display: 'inline-block',
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },

  // Onglets
  tabsContainer: {
    display: 'flex',
    gap: '4px',
    background: 'white',
    borderRadius: '16px',
    padding: '6px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  },

  tabButton: {
    flex: 1,
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.2s'
  },

  tabButtonActive: {
    background: '#667eea',
    color: 'white',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
  },

  // Carte de contenu
  contentCard: {
    background: 'white',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0'
  },

  section: {
    marginBottom: '32px'
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#1a1a2e'
  },

  description: {
    lineHeight: '1.7',
    color: '#444',
    fontSize: '15px'
  },

  // Tags
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },

  tag: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500'
  },

  tagSuccess: {
    background: '#e8f5e9',
    color: '#2e7d32'
  },

  tagDanger: {
    background: '#ffebee',
    color: '#c62828'
  },

  techTag: {
    background: '#f0f0ff',
    color: '#667eea',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500'
  },

  // Métadonnées
  metadataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '12px'
  },

  metadataItem: {
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '12px'
  },

  metadataKey: {
    fontWeight: '600',
    color: '#333',
    marginRight: '8px'
  },

  metadataValue: {
    color: '#666'
  },

  // Tarifs (grille)
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },

  pricingCard: {
    background: '#f8f9fa',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid #e8e8e8',
    transition: 'transform 0.2s'
  },

  planName: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#1a1a2e'
  },

  planPrice: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#667eea',
    marginBottom: '8px'
  },

  planPeriod: {
    fontSize: '14px',
    fontWeight: '400',
    color: '#999'
  },

  planFeatures: {
    marginTop: '16px',
    paddingLeft: '20px',
    color: '#555',
    fontSize: '13px',
    lineHeight: '1.8'
  },

  // Modèles
  modelsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  modelCard: {
    background: '#f8f9fa',
    borderRadius: '16px',
    padding: '20px',
    borderLeft: '4px solid #667eea'
  },

  modelName: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1a1a2e'
  },

  modelDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '8px'
  },

  modelVersion: {
    display: 'inline-block',
    fontSize: '12px',
    background: '#e0e0e0',
    padding: '4px 10px',
    borderRadius: '12px',
    color: '#555'
  },

  // États de chargement et erreur
  loadingContainer: {
    textAlign: 'center',
    padding: '80px 20px'
  },

  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e0e0e0',
    borderTopColor: '#667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  },

  loadingText: {
    marginTop: '20px',
    color: '#666'
  },

  errorContainer: {
    textAlign: 'center',
    padding: '80px 20px'
  },

  errorTitle: {
    color: '#d32f2f',
    marginBottom: '16px'
  },

  errorMessage: {
    color: '#666',
    marginBottom: '24px'
  },

  backButton: {
    padding: '10px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },

  emptyMessage: {
    textAlign: 'center',
    color: '#999',
    padding: '40px'
  }
}

// Ajout de l'animation CSS globale
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(styleSheet)

export default ToolDetail
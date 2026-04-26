import React, { useState, useEffect } from 'react'
import { aiToolApi } from '../api'
import ToolCard from '../components/ToolCard'

function Home() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTools = async () => {
      console.log('1. Début du chargement...')
      try {
        setLoading(true)
        console.log('2. Appel API...')
        const response = await aiToolApi.getAll()
        console.log('3. Réponse reçue:', response)
        console.log('4. Données:', response.data)
        setTools(response.data || [])
        setError(null)
      } catch (err) {
        console.error('5. Erreur:', err)
        setError(err.message)
      } finally {
        console.log('6. Fin du chargement')
        setLoading(false)
      }
    }

    fetchTools()
  }, [])

  console.log('7. Rendu du composant - loading:', loading, 'tools:', tools.length)

  if (loading) {
    console.log('8. Affichage du loader')
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
        <p style={{ marginTop: '20px' }}>Chargement des outils...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    console.log('9. Affichage de l\'erreur:', error)
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h2 style={{ color: '#d32f2f' }}>Erreur de chargement</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Réessayer
        </button>
      </div>
    )
  }

  console.log('10. Affichage de la liste des outils')
  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>
         {tools.length} outils IA disponibles
      </h2>

      {tools.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Aucun outil trouvé</p>
      ) : (
        tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))
      )}
    </div>
  )
}

export default Home
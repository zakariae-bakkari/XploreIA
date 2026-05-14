import React from 'react'
import { useNavigate } from 'react-router-dom'

function ToolCard({ tool }) {
  const navigate = useNavigate()

  console.log('ToolCard rendu pour:', tool.name)

  return (
    <div 
      onClick={() => navigate(`/tool/${tool.id}`)}
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        cursor: 'pointer',
        background: 'white'
      }}
    >
      <h3>{tool.name}</h3>
      <p>{tool.description ? tool.description.substring(0, 100) : ''}</p>
    </div>
  )
}

export default ToolCard
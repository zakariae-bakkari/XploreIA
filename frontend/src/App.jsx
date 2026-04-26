import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import ToolDetail from './pages/ToolDetail'

function App() {
  return (
    <BrowserRouter>
      <div>
        <header style={{
          background: '#667eea',
          color: 'white',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
               XploreIA
            </Link>
          </h1>
          <p>Découvrez les meilleurs outils d'intelligence artificielle</p>
        </header>

        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tool/:id" element={<ToolDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
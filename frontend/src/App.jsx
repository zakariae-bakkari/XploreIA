import { useState } from 'react'
import './App.css'
import AiToolsPage from './components/AiToolsPage'
import ProfilePage from './components/ProfilePage'
import PlaylistsPage from './components/PlaylistsPage'

function App() {
  const [currentView, setCurrentView] = useState('explore')
  const userEmail = 'noureddine@gmail.com';

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="logo" onClick={() => setCurrentView('explore')}>
          XploreIA
        </div>
        <nav className="header-nav">
          <button 
            className={currentView === 'explore' ? 'active' : ''} 
            onClick={() => setCurrentView('explore')}
          >Explorer</button>
        </nav>
        <div className="header-actions">
          <button 
            className={`icon-btn ${currentView === 'playlists' ? 'active' : ''}`}
            onClick={() => setCurrentView('playlists')}
            title="Mes Playlists"
          >
            📂
          </button>
          <div 
            className={`profile-bar ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentView('profile')}
          >
            <div className="user-avatar">N</div>
            <span className="user-name">Noureddine</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {currentView === 'explore' && <AiToolsPage />}
        {currentView === 'playlists' && <PlaylistsPage />}
        {currentView === 'profile' && <ProfilePage />}
      </main>
    </div>
  )
}

export default App

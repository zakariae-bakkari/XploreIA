import { useState, useEffect } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import AiToolsPage from '../components/AiToolsPage'
import { useAuth } from '../contexts/AuthContext';

function HomePage() {

  const {user, loading} = useAuth();

  return (
    <>
      <section id="center">
        <AiToolsPage />
        <div>
          <h1>XploreIA</h1>
          <p>
            The ultimate directory for AI tools.
          </p>
        </div>
        
        {!loading && !user && (
          <div className="hero-auth-buttons">
            <button className="main-login-btn" onClick={() => window.location.href='/login'}>
              Get Started
            </button>
            <button className="main-signup-btn" onClick={() => window.location.href='/signup'}>
              Create Account
            </button>
          </div>
        )}
      </section>
    </>
  )
}

export default HomePage

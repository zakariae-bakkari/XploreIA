import { Routes, Route } from 'react-router-dom'
import './styling/App.css'

// Pages & Components
import HomePage from './pages/HomePage'
import SignupPage from './pages/signup-page'
import LoginPage from './pages/login-page'
import ForgotPasswordPage from './pages/forgot-password-page'
import ProfilePage from './components/ProfilePage'
import PlaylistsPage from './components/PlaylistsPage'
import Header from './components/layout/Header'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/playlists" 
            element={
              <ProtectedRoute>
                <PlaylistsPage />
              </ProtectedRoute>
            } 
          />

          {/* Example of an Admin-only route */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <div style={{padding: '50px', textAlign: 'center'}}>
                  <h1>Admin Dashboard</h1>
                  <p>Welcome, Admin!</p>
                </div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  )
}

export default App

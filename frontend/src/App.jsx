import { Routes, Route } from 'react-router-dom'
import './styling/index.css'

// Pages
import HomePage from './pages/HomePage'
import DiscoverPage from './pages/DiscoverPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ProfilePage from './pages/ProfilePage'
import ToolDetailsPage from './pages/ToolDetailsPage'
import PlaylistsPage from './components/PlaylistsPage'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/tool/:id" element={<ToolDetailsPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
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

      {/* Admin Dashboard */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import "./style/index.css";

// Pages
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import ToolDetailsPage from "./pages/ToolDetailsPage";
import DebugPage from "./pages/DebugPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminToolsPage from "./pages/admin/AdminToolsPage";
import AdminCommentsPage from "./pages/admin/AdminCommentsPage";
import AdminModelsPage from "./pages/admin/AdminModelsPage";
import AdminProvidersPage from "./pages/admin/AdminProvidersPage";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/discover/:slug" element={<ToolDetailsPage />} />
      <Route path="/debug" element={<DebugPage />} />
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
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/playlists"
        element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="tools" element={<AdminToolsPage />} />
        <Route path="models" element={<AdminModelsPage />} />
        <Route path="providers" element={<AdminProvidersPage />} />
        <Route path="comments" element={<AdminCommentsPage />} />
      </Route>
    </Routes>
  );
}

export default App;

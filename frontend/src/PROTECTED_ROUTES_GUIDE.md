# Guide: Implementing Protected Routes (Middleware)

To prevent guests from accessing pages like the Profile or Playlists, you can create a "Protected Route" component. This acts like middleware for your frontend navigation.

---

## Step 1: Create the ProtectedRoute Component
Create a new file at `frontend/src/components/auth/ProtectedRoute.jsx`.

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // While checking if the user is logged in, show nothing or a spinner
    if (loading) {
        return <div className="loading">Checking authentication...</div>;
    }

    // If no user is found after loading, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user exists, render the child component (e.g., ProfilePage)
    return children;
};

export default ProtectedRoute;
```

---

## Step 2: Use it in App.jsx
Update `frontend/src/App.jsx` to wrap the routes you want to protect.

```jsx
import ProtectedRoute from './components/auth/ProtectedRoute';

// ... inside your Routes
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />

  {/* Protected Routes (Middleware applied here) */}
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
</Routes>
```

---

## How it works
1. **The Guard**: Every time a user navigates to `/profile`, the `ProtectedRoute` component runs first.
2. **Accessing Context**: it asks `useAuth()` for the current `user`.
3. **The Decision**:
   - If `loading` is true, it shows a loading screen (this prevents the app from redirecting to login before the server responds).
   - If `user` is null, it uses `<Navigate />` to kick the user back to the login page.
   - If `user` exists, it says "okay" and shows the page.

---

## Step 3: Role-Based Protection (Admin Only)
You can now restrict pages to specific roles (like `admin`) by using the `requiredRole` prop.

```jsx
<Route 
  path="/admin-dashboard" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminPage />
    </ProtectedRoute>
  } 
/>
```

### How it handles roles:
1. **Authenticated?**: First, it checks if the user is logged in.
2. **Right Role?**: If logged in, it compares the user's role (from the database) with the `requiredRole`.
3. **Redirection**: 
   - If they aren't logged in, they go to `/login`.
   - If they are logged in but **not an admin**, they are sent back to the Home page (`/`).

---

## Pro Tip: Public-Only Routes
You can also do the opposite! Create a `PublicRoute` that redirects logged-in users away from the `/login` and `/signup` pages since they don't need them anymore.

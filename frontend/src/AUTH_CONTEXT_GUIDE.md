# Guide: Implementing AuthContext in XploreIA

This guide explains how to centralize your authentication logic using React Context. This will allow any component to access the current user, login, and logout functions without prop drilling.

---

## Step 1: Create the Context File
Create a new file at `frontend/src/contexts/AuthContext.jsx`.

```jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to check if the user is logged in (session check)
    const checkAuth = async () => {
        try {
            const data = await authApi.checkStatus();
            if (data.connected) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error("Auth check failed", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials) => {
        const data = await authApi.login(credentials);
        if (data.status === 'success') {
            setUser(data.user);
            return data;
        }
        throw new Error(data.message || 'Login failed');
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
            window.location.href = '/'; // Force redirect on logout
        }
    };

    const signup = async (userData) => {
        const data = await authApi.signup(userData);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, signup, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy access
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
```

---

## Step 2: Wrap your App
Update `frontend/src/main.jsx` to wrap the entire application in the `AuthProvider`.

```jsx
import { AuthProvider } from './contexts/AuthContext'

// ... inside render
<BrowserRouter>
  <AuthProvider>
    <App />
  </AuthProvider>
</BrowserRouter>
```

---

## Step 3: Refactor App.jsx
Now you can remove the local `user` and `loading` states from `App.jsx` and use the context instead.

```jsx
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user, loading, logout } = useAuth();
  
  // You no longer need local useEffect or handleLogout here!
  // Use the values directly in your JSX.
}
```

---

## Step 4: Use in Pages (Profile, Playlists)
In your pages, you no longer need to accept `user` as a prop.

**Example in `PlaylistsPage.jsx`:**
```jsx
import { useAuth } from '../contexts/AuthContext';

const PlaylistsPage = () => {
    const { user } = useAuth();
    const userEmail = user?.email;
    
    // ... rest of your logic
}
```

---

## Why do this?
1. **Consistency**: The user state is the same everywhere in the app.
2. **Maintenance**: If you want to add `userRole` or `permissions` later, you only change it in one file.
3. **Simplicity**: Your component signatures become cleaner (`() =>` instead of `({ user, loading, ... }) =>`).

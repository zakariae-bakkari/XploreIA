import { Children, createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
    }

    useEffect(() => {
        checkAuth();
    }, [])

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
            const data = await authApi.logout();
        } catch (error) {
            console.log("error when calling logout" + error);
        } finally {
            setUser(null);
            window.location.href = '/';
        }
    }

    const signup = async (userData) => {
        const data = await authApi.signup(userData);
        return data;
    }
    return (
        <AuthContext.Provider value={{ user, loading, login, logout, signup, checkAuth }}>
            {children}
        </AuthContext.Provider>
    )

}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
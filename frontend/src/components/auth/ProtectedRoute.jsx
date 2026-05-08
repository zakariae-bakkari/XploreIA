import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute component
 * Redirects to /login if user is not authenticated
 * Redirects to / if user doesn't have the required role
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Verifying access...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // User is logged in but doesn't have the right role
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;

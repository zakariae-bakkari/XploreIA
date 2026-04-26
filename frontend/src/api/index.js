const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Base fetch wrapper for API calls
 * @param {string} endpoint - The API endpoint (e.g., 'users')
 * @param {object} options - Fetch options (method, headers, body)
 * @returns {Promise<any>}
 */
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${BACKEND_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || result.error || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

// Service: AI Tools
export const aiToolApi = {
    getAll: () => apiRequest('ai-tools'),
    getById: (id) => apiRequest(`ai-tools/${id}`),
};

// Service: User
export const userApi = {
    getAll: () => apiRequest('users'),
    getById: (id) => apiRequest(`users/${id}`),
    create: (data) => apiRequest('users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`users/${id}`, { method: 'DELETE' }),
};
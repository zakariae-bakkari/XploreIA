const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
            throw new Error(result.message || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

// Example Service: User Service
export const userApi = {
    getAll: () => apiRequest('users'),
    getById: (id) => apiRequest(`users/${id}`),
};

// Example Service: AI Tool Service
export const aiToolApi = {
    getAll: () => apiRequest('aitools'),
};

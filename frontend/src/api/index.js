const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Base fetch wrapper for API calls
 * @param {string} endpoint - The API endpoint (e.g., 'users')
 * @param {object} options - Fetch options (method, headers, body)
 * @returns {Promise<any>}
 */
export const apiRequest = async (endpoint = '', options = {}) => {
    if (!BACKEND_URL) {
        console.error("VITE_BACKEND_URL is not defined in .env file");
        throw new Error("Configuration error: API URL is missing");
    }

    const cleanBase = BACKEND_URL.replace(/\/$/, '');
    const cleanEndpoint = endpoint ? endpoint.replace(/^\//, '') : '';
    const url = `${cleanBase}/${cleanEndpoint}`;
    
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

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
            credentials: 'include', // Ensure cookies are sent/received
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        const result = await response.json();

        if (!response.ok) {
            // Return result even if not ok so we can handle custom error messages from backend
            return result;
        }

        return result;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        
        // Check if it's a JSON parse error (which means backend returned non-JSON/HTML error)
        if (error instanceof SyntaxError) {
            return { status: 'error', message: 'Invalid response from server' };
        }
        
        return { status: 'error', message: 'Connection failed: ' + error.message };
    }
};

export const authApi = {
    signup: (data) => apiRequest('signup', { method: 'POST', body: JSON.stringify(data) }),
    verifyCode: (code) => apiRequest('verify-code', { method: 'POST', body: JSON.stringify({ code }) }),
    //!! important : meriem you add you login her
};

// Example Service: User Service
export const userApi = {
    getAll: () => apiRequest('users'),
    getById: (id) => apiRequest(`users/${id}`),
};

// Example Service: AI Tool Service
export const aiToolApi = {
    getAll: () => apiRequest('ai-tools'),
};


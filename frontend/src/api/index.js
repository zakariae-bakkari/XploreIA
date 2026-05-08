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
    login: (data) => apiRequest('login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => apiRequest('logout', { method: 'POST' }),
    checkStatus: () => apiRequest('status', { method: 'GET' }), // zakariae : 8-May-26 : check if user is logged in or not 
    forgotPassword: (email) => apiRequest('forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    forgotPasswordVerify: (code) => apiRequest('forgot-password/verify', { method: 'POST', body: JSON.stringify({ code }) }),
    resetPassword: (data) => apiRequest('reset-password', { method: 'POST', body: JSON.stringify(data) }),
};

// Example Service: User Service
export const userApi = {
    getAll: () => apiRequest('users'),
    getById: (id) => apiRequest(`users/${id}`),
};

// AI Tool Service
export const aiToolApi = {
    getAll: () => apiRequest('ai-tools'),
};

// Playlist Service
export const playlistApi = {
    getAllByUser: (email) => apiRequest(`playlists?email=${email}`),
    getContent: (id) => apiRequest(`playlists/content?id=${id}`),
    create: (data) => apiRequest('playlists/create', { method: 'POST', body: JSON.stringify(data) }),
    update: (data) => apiRequest('playlists/update', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`playlists/delete?id=${id}`, { method: 'POST' }),
};

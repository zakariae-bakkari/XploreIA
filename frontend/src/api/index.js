const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

/**
 * Base fetch wrapper for API calls
 * @param {string} endpoint - The API endpoint (e.g., 'users')
 * @param {object} options - Fetch options (method, headers, body)
 * @returns {Promise<any>}
 */
export const apiRequest = async (endpoint = "", options = {}) => {
  if (!BACKEND_URL) {
    console.error("VITE_BACKEND_URL is not defined in .env file");
    throw new Error("Configuration error: API URL is missing");
  }

  const cleanBase = BACKEND_URL.replace(/\/$/, "");
  const cleanEndpoint = endpoint ? endpoint.replace(/^\//, "") : "";
  const url = `${cleanBase}/${cleanEndpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include", // Ensure cookies are sent/received
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Read body as text first to avoid consuming stream twice (json() may throw)
    const text = await response.text();
    let result = null;
    if (text) {
      try {
        result = JSON.parse(text);
      } catch (err) {
        // not JSON - return text as error-like response
        return { status: 'error', message: text || 'Invalid response from server', httpStatus: response.status };
      }
    }

    if (!response.ok) {
      // Return parsed JSON error object if any
      return result || { status: 'error', message: 'Request failed', httpStatus: response.status };
    }

    return result;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);

    // Check if it's a JSON parse error (which means backend returned non-JSON/HTML error)
    if (error instanceof SyntaxError) {
      return { status: "error", message: "Invalid response from server" };
    }

    return { status: "error", message: "Connection failed: " + error.message };
  }
};

// zakariae et meriem
export const authApi = {
  signup: (data) =>
    apiRequest("signup", { method: "POST", body: JSON.stringify(data) }),
  verifyCode: (code) =>
    apiRequest("verify-code", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  login: (data) =>
    apiRequest("login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => apiRequest("logout", { method: "POST" }),
  checkStatus: () => apiRequest("status", { method: "GET" }), // zakariae : 8-May-26 : check if user is logged in or not
  forgotPassword: (email) =>
    apiRequest("forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  forgotPasswordVerify: (code) =>
    apiRequest("forgot-password/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  resetPassword: (data) =>
    apiRequest("reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// noureddine : Playlist Service
export const playlistApi = {
  getAllByUser: (email) => apiRequest(`playlists?email=${email}`),
  getContent: (id) => apiRequest(`playlists/content?id=${id}`),
  create: (data) =>
    apiRequest("playlists/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  // !!! use patch isntead of POST
  update: (data) =>
    apiRequest("playlists/update", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  // !!! use patch isntead of delete
  delete: (id) => apiRequest(`playlists/delete?id=${id}`, { method: "POST" }),
};

// youssef et saad
//  Service: AI Tools
export const aiToolApi = {
  getAll: () => apiRequest("ai-tools"),
  getFilters: () => apiRequest("filters"),
  getById: (id) => apiRequest(`ai-tools/show?id=${id}`),
  // zakariae 16-May-2026
  getFeatured: () => apiRequest("ai-tools/featured"),
  getProviders: () => apiRequest('providers'),
};

// Service: User
export const userApi = {
  getAll: () => apiRequest("users"),
  getById: (id) => apiRequest(`users/show?id=${id}`),
  getProfile: (email) => apiRequest(`profile?email=${email}`),
  create: (data) =>
    apiRequest("users", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    apiRequest(`users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateName: (data) =>
    apiRequest("users/update-name", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  changePassword: (data) =>
    apiRequest("users/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id) => apiRequest(`users/${id}`, { method: "DELETE" }),
};

// Admin Modele (Models) Service
export const adminModelApi = {
  getAll: () => apiRequest('adminmodele'),
  getById: (id) => apiRequest(`adminmodele/show?id=${id}`),
  create: (data) => apiRequest('adminmodele/create', { method: 'POST', body: JSON.stringify(data) }),
  update: (data) => apiRequest('adminmodele/update', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => apiRequest('adminmodele/delete', { method: 'POST', body: JSON.stringify({ id }) }),
};

export const adminProviderApi = {
  getAll: () => apiRequest('adminprovider'),
  getById: (id) => apiRequest(`adminprovider/show?id=${id}`),
  create: (data) => apiRequest('adminprovider/create', { method: 'POST', body: JSON.stringify(data) }),
  update: (data) => apiRequest('adminprovider/update', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => apiRequest('adminprovider/delete', { method: 'POST', body: JSON.stringify({ id }) }),
};

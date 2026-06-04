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
  getAllByUser: (email) => apiRequest(`playlists?email=${encodeURIComponent(email)}`),
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
  addTool: (data) => apiRequest("playlists/add-tool", { method: "POST", body: JSON.stringify(data) }),
  removeTool: (data) => apiRequest("playlists/remove-tool", { method: "POST", body: JSON.stringify(data) }),
  checkSaved: (email, toolId) => apiRequest(`playlists/check-saved?email=${encodeURIComponent(email)}&tool_id=${encodeURIComponent(toolId)}`),
};

// youssef et saad
//  Service: AI Tools
export const aiToolApi = {
  getAll: () => apiRequest("ai-tools"),
  getFilters: () => apiRequest("filters"),
  getById: (id) => apiRequest(`ai-tools/show?id=${id}`),
  // zakariae 16-May-2026
  getFeatured: () => apiRequest("ai-tools/featured"),
  addReview: (toolId, reviewData) => apiRequest(`ai-tools/reviews`, {
    method: "POST",
    body: JSON.stringify({ ...reviewData, tool_id: toolId })
  }),
  updateReview: (data) => apiRequest("ai-tools/reviews/update", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  deleteReview: (data) => apiRequest("ai-tools/reviews/delete", {
    method: "POST",
    body: JSON.stringify(data)
  }),
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
  adminGetAll: (params) => apiRequest("users" + (params ? "?" + new URLSearchParams(params).toString() : "")),
  adminSuspend: (userId) => apiRequest("admin/users/suspend", { method: "POST", body: JSON.stringify({ user_id: userId }) }),
  adminUnsuspend: (userId) => apiRequest("admin/users/unsuspend", { method: "POST", body: JSON.stringify({ user_id: userId }) }),
  adminChangeRole: (userId, role) => apiRequest("admin/users/change-role", { method: "POST", body: JSON.stringify({ user_id: userId, role }) }),
  adminDelete: (userId) => apiRequest("admin/users/delete", { method: "POST", body: JSON.stringify({ user_id: userId }) }),
};

//zakariae 01-Jun-26
const categorieApi = {
  getAll: () => apiRequest(`admincategorie`),
  create: (data) =>
    apiRequest(`admincategorie/create`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (data) =>
    apiRequest(`admincategorie/update`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (data) =>
    apiRequest(`admincategorie/delete`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

//zakariae 01-Jun-26
const characteristicApi = {
  getAll: () => apiRequest(`admincharacteristic`),
  create: (data) => apiRequest(`admincharacteristic/create`, { method: "POST", body: JSON.stringify(data) }),
  update: (data) => apiRequest(`admincharacteristic/update`, { method: "POST", body: JSON.stringify(data) }),
  delete: (data) => apiRequest(`admincharacteristic/delete`, { method: "POST", body: JSON.stringify(data) }),
};

//zakariae 01-Jun-26
const reviewApi = {
  getAll: (toolId) => apiRequest(`admin/reviews` + (toolId ? `?tool_id=${toolId}` : "")),
  approve: (id) => apiRequest(`admin/reviews/approve`, { method: "POST", body: JSON.stringify({ id }) }),
  delete: (id) => apiRequest(`admin/reviews/delete`, { method: "POST", body: JSON.stringify({ id }) }),
  suspendUser: (userId) => apiRequest(`admin/users/suspend`, { method: "POST", body: JSON.stringify({ user_id: userId }) }),
};

//zakariae 01-Jun-26
export const adminApi = {
  categorieApi: categorieApi,
  characteristicApi: characteristicApi,
  reviewApi: reviewApi,
  aiToolApi: {
    getAll: () => apiRequest(`adminaitool`),
    getById: (id) => apiRequest(`adminaitool/show?id=${id}`),
    create: (data) => apiRequest(`adminaitool/create`, { method: "POST", body: JSON.stringify(data) }),
    update: (data) => apiRequest(`adminaitool/update`, { method: "POST", body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`adminaitool/delete`, { method: "POST", body: JSON.stringify({ id }) }),
  },
  modelApi: {
    getAll: () => apiRequest(`adminmodel`),
    getById: (id) => apiRequest(`adminmodel/show?id=${id}`),
    create: (data) => apiRequest(`adminmodel/create`, { method: "POST", body: JSON.stringify(data) }),
    update: (data) => apiRequest(`adminmodel/update`, { method: "POST", body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`adminmodel/delete`, { method: "POST", body: JSON.stringify({ id }) }),
  }
};

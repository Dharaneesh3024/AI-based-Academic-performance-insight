import axios from "axios";

// In production (Vercel), we use relative paths.
// In local development, you might want to point to http://localhost:5000
// But with Vercel monorepo setup, /api prefix will be routed to the backend.
const API_BASE_URL = "/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add interceptor for tokens if needed
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

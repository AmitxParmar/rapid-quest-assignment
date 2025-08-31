import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Create the Axios instance with a base URL from environment variables
/* const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api", // Default for local dev
  headers: {
    "Content-Type": "application/json",
  },
}); */

// Use an interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    // Retrieve the token from local storage or your state management solution
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

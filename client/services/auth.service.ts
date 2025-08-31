import { api } from "@/lib/api";

// Register a new user
export async function register(waId: string, name: string, password: string) {
  const response = await api.post("/api/auth/register", {
    waId,
    name,
    password,
  });
  return response.data;
}

// Login user
export async function login(waId: string, password: string) {
  const response = await api.post("/api/auth/login", { waId, password });
  return response.data;
}

// Logout user
export async function logout() {
  const response = await api.post("/api/auth/logout");
  return response.data;
}

// Refresh access token
export async function refreshToken() {
  const response = await api.post("/api/auth/refresh-token");
  return response.data;
}

// Get current authenticated user profile
export async function getProfile() {
  const response = await api.get("/api/auth/profile");
  return response.data;
}

// Update current authenticated user profile
export async function updateProfile(profileData: {
  name?: string;
  profilePicture?: string;
  status?: string;
}) {
  const response = await api.put("/api/auth/profile", profileData);
  return response.data;
}

// Change user password
export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const response = await api.put("/api/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
}

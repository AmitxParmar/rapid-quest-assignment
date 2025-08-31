import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  register as registerUser,
  login as loginUser,
  logout as logoutUser,
  refreshToken as refreshTokenApi,
  getProfile,
  updateProfile,
  changePassword,
} from "@/services/auth.service";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

// Fetch current user profile
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const data = await getProfile();
      return data.user;
    },

    retry: false,
    staleTime: 5 * 60 * 1000,
    select: (user) => user,
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      waId,
      password,
    }: {
      waId: string;
      password: string;
    }) => {
      const data = await loginUser(waId, password);
      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
        queryClient.invalidateQueries({ queryKey: ["tickets"] });
        queryClient.invalidateQueries({ queryKey: ["kb"] });
      }
    },
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      waId,
      name,
      password,
    }: {
      waId: string;
      name: string;
      password: string;
    }) => {
      const data = await registerUser(waId, name, password);
      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
        queryClient.invalidateQueries({ queryKey: ["tickets"] });
        queryClient.invalidateQueries({ queryKey: ["kb"] });
      }
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// Refresh token mutation
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshTokenApi,
    onSuccess: (data) => {
      if (data.success && data.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
      }
    },
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      if (data.success && data.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
      }
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => changePassword(currentPassword, newPassword),
  });
};

/**
 * Custom hook to access authentication state and user information.
 */

const useAuth = () => {
  // Get guest user from zustand store

  const userQuery = useCurrentUser();

  const isLoading = userQuery.isLoading || userQuery.isFetching;
  const isAuthenticated = !!(userQuery.data && !userQuery.error);
  const isUnauthenticated =
    userQuery.error?.message === "Not authenticated" ||
    (userQuery.error as any)?.response?.status === 401;

  // Fallback: treat as guest
  return {
    user: userQuery.data,

    isAuthenticated,
    isUnauthenticated,
    isLoading,
    error: userQuery.error ?? null,
  };
};

export default useAuth;

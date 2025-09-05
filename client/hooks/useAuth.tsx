import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  register as registerUser,
  login as loginUser,
  logout as logoutUser,
  refreshToken as refreshTokenApi,
  getProfile,
  updateProfile,
  changePassword,
} from "@/services/auth.service";
import { User } from "@/types";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

// Fetch current user profile
export const useCurrentUser = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const data = await getProfile();
      return data.user;
    },
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: options?.enabled !== undefined ? options.enabled : true,

    select: (user) => user,
    // Since we're using cookies, we can always try to fetch the profile
    // The interceptor will handle token refresh automatically
  });
};

/**
 * Custom hook to access authentication state and user information.
 */
const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const userQuery = useCurrentUser({ enabled: !isLoginPage });
  const isLoading = userQuery.isLoading;
  const isAuthenticated = !!(userQuery.data && !userQuery.error);
  const isUnauthenticated =
    userQuery.error?.message === "Not authenticated" ||
    (userQuery.error as any)?.response?.status === 401;

  // Redirect to login if unauthenticated (401) and not loading
  useEffect(() => {
    if (isUnauthenticated && !isLoading && pathname !== "/login") {
      // Clear any cached data to avoid showing stale state
      try {
        if (typeof window !== "undefined") {
          router.push("/login");
        }
      } catch (_) {
        // no-op
      }
    }
  }, [isUnauthenticated, isLoading, pathname, router]);

  return {
    user: userQuery.data as User,
    isAuthenticated,
    isUnauthenticated,
    isLoading,
    error: userQuery.error ?? null,
  };
};

export default useAuth;

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
        // Server sets cookies automatically, just update the user data
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
        // Server sets cookies automatically, just update the user data
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
      // Server clears cookies automatically, just clear the cache
      queryClient.clear();
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      queryClient.clear();
    },
  });
};

// Refresh token mutation (can be used manually if needed)
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshTokenApi,
    onSuccess: (data) => {
      if (data.success && data.user) {
        // Server sets new cookies automatically, just update the user data
        queryClient.setQueryData(authKeys.user(), data.user);
      }
    },
    onError: (error) => {
      // If refresh fails, clear everything and redirect to login
      queryClient.clear();

      // Redirect to login page if in browser
      if (typeof window !== "undefined") {
        window.location.href = "/login";
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

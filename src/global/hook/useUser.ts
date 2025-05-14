// hooks/useUser.ts
"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { callApi } from "../func";

export const useUser = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch user on load
  const {
    data: user,
    isLoading,
    error,
    refetch: verifyUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await callApi("/user/verify", "GET");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // cache for 5 mins
    retry: false,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await callApi("/user/logout", "GET");
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      router.push("/");
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      await callApi("/user/login", "POST", credentials);
    },
    onSuccess: () => {
      verifyUser(); // refetch user after login
    },
  });

  return {
    user,
    loading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    error:
      error?.message ||
      loginMutation.error?.message ||
      logoutMutation.error?.message ||
      null,
    isAuthenticated: !!user,
    verifyUser,
    logout: logoutMutation.mutateAsync,
    login: loginMutation.mutateAsync,
  };
};

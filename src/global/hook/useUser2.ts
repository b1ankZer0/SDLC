// useUser.js
import { useState, useEffect, useCallback } from "react";
import { callApi } from "../func";
import { mySignal } from "@/store/class";
import { useRouter } from "next/navigation";

// export const userSignal = mySignal((await callApi("/user/verify", "GET")).data);
// export const userSignal = mySignal(null);

/**
 * Custom hook for managing user authentication state and related functions
 * @returns {Object} User state and authentication functions
 */
const useUser = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify user on initial load
  const verifyUser = useCallback(async () => {
    try {
      if (user) {
        return null;
      }
      setLoading(true);
      setError(null);

      const data = await callApi("/user/verify", "GET");

      setUser(data.data);
      return data.data;
    } catch (err) {
      setError(err.message || "Failed to verify user");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await callApi("/user/logout", "GET");

      setUser(null);
      router.push("/");
      return true;
    } catch (err) {
      setError(err.message || "Failed to logout");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function - you'll need to implement this based on your backend
  const login = useCallback(
    async (credentials) => {
      try {
        setLoading(true);
        setError(null);

        // Implement your login API call here
        await callApi("/user/login", "POST", credentials);

        await verifyUser(); // Re-verify to get the user data
        return true;
      } catch (err) {
        setError(err.message || "Failed to login");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [verifyUser]
  );

  // Verify user on initial load
  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    verifyUser,
  };
};

export default useUser;

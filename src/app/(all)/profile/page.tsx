"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/global/hook/useUser";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { callApi } from "@/global/func";
import { useState, useEffect } from "react";
import RoleRequestForm from "./components/RoleRequestForm";
import ShowProfile from "./components/showProfile";

export default function ProfilePage() {
  const { isAuthenticated, loading: userLoading } = useUser();
  const [activeTab, setActiveTab] = useState<"profile" | "roleRequest">(
    "profile"
  );

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await callApi(`/user/profile`, "GET", null);
      if (res.error) throw new Error(res.message || "Failed to fetch profile");
      return res.data;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    // Switch to profile tab if role isn't user but active tab is roleRequest
    if (user?.role !== "user" && activeTab === "roleRequest") {
      setActiveTab("profile");
    }
  }, [user, activeTab]);

  if (userLoading || isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!isAuthenticated) return <div>Please log in to view your profile.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Profile
              </button>
              {/* Conditionally show Role Request tab */}
              {user?.role === "user" && (
                <button
                  onClick={() => setActiveTab("roleRequest")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "roleRequest"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Role Request
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="px-4 py-5 sm:p-6">
            {activeTab === "profile" ? (
              <ShowProfile user={user} />
            ) : (
              <div className="mt-4">
                <RoleRequestForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

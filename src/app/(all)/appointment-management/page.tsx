"use client";

import React, { useState } from "react";
import AppointmentList from "./components/AppointmentList";
import AppointmentForm from "./components/AppointmentForm";
import { Calendar, Plus, UserCheck, Loader2, AlertCircle } from "lucide-react";
import { useUser } from "@/global/hook/useUser";

export default function AppointmentPage() {
  const { user, loading, error, isAuthenticated } = useUser();
  const [activeTab, setActiveTab] = useState<"user" | "doctor" | "form">(
    "user"
  );

  const isDoctor = user?.role === "doctor";

  const tabs = [
    {
      id: "user" as const,
      label: "My Appointments",
      icon: Calendar,
      description: "View your scheduled appointments",
      show: true,
    },
    {
      id: "doctor" as const,
      label: "Doctor Requests",
      icon: UserCheck,
      description: "Manage appointment requests",
      show: isDoctor,
    },
  ].filter((tab) => tab.show);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Authentication Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">
            Authentication Required
          </p>
          <p className="text-gray-600">Please log in to access appointments</p>
        </div>
      </div>
    );
  }

  // Reset tab if doctor tab is selected but user is not a doctor
  if (activeTab === "doctor" && !isDoctor) {
    setActiveTab("user");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Appointment Management
                </h1>
                <p className="text-gray-600">
                  Welcome, {user?.name || user?.username || "User"}
                  {isDoctor && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Doctor
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          <div className="px-6 mb-4">
            <p className="text-gray-600">
              {tabs.find((tab) => tab.id === activeTab)?.description}
            </p>
          </div>

          {activeTab === "user" && <AppointmentList userType="user" />}
          {activeTab === "doctor" && isDoctor && (
            <AppointmentList userType="doctor" />
          )}
        </div>
      </div>
    </div>
  );
}

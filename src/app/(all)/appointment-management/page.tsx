"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AppointmentList from "./components/AppointmentList";
import { Calendar, Plus, Users, UserCheck } from "lucide-react";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function AppointmentPage() {
  const [activeTab, setActiveTab] = useState<"user" | "doctor" | "form">(
    "user"
  );

  const tabs = [
    {
      id: "user" as const,
      label: "My Appointments",
      icon: Calendar,
      description: "View your scheduled appointments",
    },
    {
      id: "doctor" as const,
      label: "Doctor Requests",
      icon: UserCheck,
      description: "Manage appointment requests",
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
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
                    Manage your healthcare appointments
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
            {activeTab === "doctor" && <AppointmentList userType="doctor" />}
          </div>
        </div>
      </div>

      {/* React Query Devtools */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CalendarCheck,
  Clock,
  XCircle,
  RefreshCw,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import { callApi } from "@/global/func";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import Link from "next/link";

interface DashboardData {
  total: number;
  breakdown: {
    request: number;
    accept: number;
    reSchedule: number;
    reject: number;
    cancel: number;
  };
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData[]>({
    queryKey: ["dashboardInfo"],
    queryFn: async () => {
      const res = await callApi("/dashboard/dashboardInfo", "GET");
      if (res.error) throw new Error(res.message);
      return res.data;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  const stats = data?.[0];
  if (!stats) return <ErrorMessage message="No dashboard data available" />;

  const statConfig = [
    {
      label: "Confirmed",
      value: stats.breakdown.accept,
      icon: <CalendarCheck className="h-5 w-5 text-emerald-600" />,
      color: "bg-emerald-50 border-emerald-100",
    },
    {
      label: "Pending",
      value: stats.breakdown.request,
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      color: "bg-amber-50 border-amber-100",
    },
    {
      label: "Rescheduled",
      value: stats.breakdown.reSchedule,
      icon: <RefreshCw className="h-5 w-5 text-blue-600" />,
      color: "bg-blue-50 border-blue-100",
    },
    {
      label: "Cancelled",
      value: stats.breakdown.cancel,
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      color: "bg-red-50 border-red-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Health Overview
            </h1>
            <p className="text-gray-500 mt-1">
              Comprehensive summary of your medical engagements
            </p>
          </div>
          <Link
            href="/appointment-management"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-blue-700 transition-all active:scale-95"
          >
            Manage Appointments <ChevronRight className="h-4 w-4" />
          </Link>
        </header>

        {/* Total Appointments Primary Card */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                <ClipboardList className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Total Consultations
                </p>
                <h2 className="text-4xl font-black text-gray-900">
                  {stats.total}
                </h2>
              </div>
            </div>
            <div className="hidden md:block">
              <Activity className="h-12 w-12 text-gray-100" />
            </div>
          </div>
        </div>

        {/* Status Grid Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statConfig.map((item, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all hover:shadow-md ${item.color}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {item.icon}
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {item.value}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions and Placeholders */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm max-w-xs">
                Detailed activity logs will manifest as you engage with
                healthcare providers
              </p>
            </div>
          </section>

          <section className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-2xl text-white shadow-xl">
            <h3 className="text-lg font-bold mb-2">HealthSync Intelligence</h3>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
              Our system tracks your rescheduling frequency to optimize future
              booking recommendations and provider matching.
            </p>
            <Link
              href="/profile"
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-all inline-block"
            >
              Update Health Profile
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

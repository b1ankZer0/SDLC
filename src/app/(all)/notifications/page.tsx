"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { callApi } from "@/global/func";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { Bell, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { useEffect } from "react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  status: "unSeen" | "seen";
  createdAt: string;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    error,
  } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await callApi("/notification/all-notification", "GET");
      if (res.error) throw new Error(res.message);
      return res.data;
    },
  });

  const markAllAsSeen = useMutation({
    mutationFn: () => callApi("/notification/markAsSeen-notification", "GET"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unSeen-notifications"] });
    },
  });

  // Automatically mark all as seen when entering the page
  useEffect(() => {
    if (notifications?.some((n) => n.status === "unSeen")) {
      markAllAsSeen.mutate();
    }
  }, [notifications]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-blue-600" /> Notifications
          </h1>
          <span className="text-sm text-gray-500">
            {notifications?.length || 0} Total
          </span>
        </div>

        <div className="space-y-4">
          {notifications && notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-4 rounded-xl border transition-all ${
                  notif.status === "unSeen"
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      className={`font-semibold ${notif.status === "unSeen" ? "text-blue-900" : "text-gray-800"}`}
                    >
                      {notif.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {notif.status === "unSeen" && (
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <Bell className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No notifications yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { getAllAppointments, getAllDoctorRequests } from "../tanstackQuery";

interface Appointment {
  _id: string;
  userRef: string;
  doctorRef: string;
  problemRef: string;
  problemAccessToDoctor: boolean;
  status: "request" | "accept" | "reSchedule" | "reject" | "cancel";
  scheduleReqBy: Array<{
    reqBy: "user" | "doctor";
    schedule: string;
    reason: string;
    reqDate: string;
    acceptedDate?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentListProps {
  userType?: "user" | "doctor";
}

const statusColors = {
  request: "bg-yellow-100 text-yellow-800 border-yellow-200",
  accept: "bg-green-100 text-green-800 border-green-200",
  reSchedule: "bg-blue-100 text-blue-800 border-blue-200",
  reject: "bg-red-100 text-red-800 border-red-200",
  cancel: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusIcons = {
  request: AlertCircle,
  accept: CheckCircle,
  reSchedule: Clock,
  reject: XCircle,
  cancel: XCircle,
};

export default function AppointmentList({
  userType = "user",
}: AppointmentListProps) {
  const queryKey =
    userType === "doctor" ? "doctorRequests" : "userAppointments";
  const queryFn =
    userType === "doctor" ? getAllDoctorRequests : getAllAppointments;

  const {
    data: appointments,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: queryFn,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !appointments) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 font-medium">
            Failed to load appointments
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {userType === "doctor" ? "Appointment Requests" : "My Appointments"}
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{appointments.length} appointments</span>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No appointments found
          </h3>
          <p className="text-gray-500">
            {userType === "doctor"
              ? "You don't have any appointment requests yet."
              : "You haven't booked any appointments yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment: Appointment) => {
            const StatusIcon = statusIcons[appointment.status];
            const latestSchedule =
              appointment.scheduleReqBy[appointment.scheduleReqBy.length - 1];

            return (
              <div
                key={appointment._id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Appointment #{appointment._id.slice(-6).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created{" "}
                        {new Date(appointment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                      statusColors[appointment.status]
                    }`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Schedule:</span>
                      <span className="font-medium">
                        {latestSchedule?.schedule || "Not scheduled"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Requested by:</span>
                      <span className="font-medium capitalize">
                        {latestSchedule?.reqBy || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Problem Access:</span>
                      <span
                        className={`font-medium ${
                          appointment.problemAccessToDoctor
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {appointment.problemAccessToDoctor
                          ? "Granted"
                          : "Restricted"}
                      </span>
                    </div>

                    {latestSchedule?.acceptedDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600">Accepted:</span>
                        <span className="font-medium">
                          {new Date(
                            latestSchedule.acceptedDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {latestSchedule?.reason &&
                  latestSchedule.reason !== "Not provided" && (
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reason:</span>{" "}
                        {latestSchedule.reason}
                      </p>
                    </div>
                  )}

                <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                  <button className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

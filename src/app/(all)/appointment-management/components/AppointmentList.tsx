"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  MapPin,
  Stethoscope,
  UserCheck,
  X,
  Check,
  RotateCcw,
} from "lucide-react";
import {
  getAllAppointments,
  getAllDoctorRequests,
  doctorResponse,
  cancelAppointment,
} from "../tanstackQuery";
import app from "@/app/api/user/user";
import { useRouter } from "next/navigation";

interface DoctorRef {
  _id: string;
  name: string;
  email: string;
  logo: string;
  gender: string;
  phone?: string;
  address?: string;
}

interface ScheduleRef {
  _id: string;
  knownAs: string;
  description: string;
  specialist: string[];
  chargeFee: number;
  startAt: string;
  duration: number;
  willSeeFor: number;
}

interface Appointment {
  _id: string;
  userRef: string;
  doctorRef: DoctorRef;
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
  scheduleRef?: ScheduleRef;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentListProps {
  userType?: "user" | "doctor";
}

const statusColors = {
  request: "bg-amber-50 text-amber-700 border-amber-200",
  accept: "bg-emerald-50 text-emerald-700 border-emerald-200",
  reSchedule: "bg-blue-50 text-blue-700 border-blue-200",
  reject: "bg-red-50 text-red-700 border-red-200",
  cancel: "bg-gray-50 text-gray-700 border-gray-200",
};

const statusIcons = {
  request: AlertCircle,
  accept: CheckCircle,
  reSchedule: Clock,
  reject: XCircle,
  cancel: XCircle,
};

// API functions

export default function AppointmentList({
  userType = "user",
}: AppointmentListProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const queryKey =
    userType === "doctor" ? "doctorRequests" : "userAppointments";
  const queryFn =
    userType === "doctor" ? getAllDoctorRequests : getAllAppointments;
  const router = useRouter();

  const {
    data: appointments,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: queryFn,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Cancel appointment mutation (for users)
  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,
    onMutate: (appointmentId) => {
      setLoadingAction(`cancel-${appointmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setLoadingAction(null);
    },
    onError: () => {
      setLoadingAction(null);
    },
  });

  // Doctor response mutation
  const doctorResponseMutation = useMutation({
    mutationFn: ({
      appointmentId,
      status,
    }: {
      appointmentId: string;
      status: string;
    }) => doctorResponse(appointmentId, status),
    onMutate: ({ appointmentId, status }) => {
      setLoadingAction(`${status}-${appointmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setLoadingAction(null);
    },
    onError: () => {
      setLoadingAction(null);
    },
  });

  const handleCancelAppointment = (appointmentId: string) => {
    cancelMutation.mutate(appointmentId);
  };

  const handleDoctorResponse = (appointmentId: string, status: string) => {
    doctorResponseMutation.mutate({ appointmentId, status });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !appointments) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Failed to load appointments
          </h3>
          <p className="text-red-600 mb-4">
            Something went wrong while fetching your appointments.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handelViewDetails = (problemRef) => {
    router.push(`problems/${problemRef}/prescriptions`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {userType === "doctor"
                ? "Appointment Requests"
                : "My Appointments"}
            </h1>
            <p className="text-blue-100">
              {userType === "doctor"
                ? "Manage incoming appointment requests"
                : "Track your scheduled appointments"}
            </p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-white">
              <Calendar className="h-6 w-6" />
              <div className="text-right">
                <div className="text-2xl font-bold">{appointments.length}</div>
                <div className="text-sm text-blue-100">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No appointments found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {userType === "doctor"
              ? "You don't have any appointment requests at the moment. Patients will be able to book appointments with you once they submit requests."
              : "You haven't booked any appointments yet. Find a doctor and schedule your first appointment to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map((appointment: Appointment) => {
            const StatusIcon = statusIcons[appointment.status];
            const latestSchedule =
              appointment.scheduleReqBy[appointment.scheduleReqBy.length - 1];
            const { date, time } = formatDateTime(
              latestSchedule?.schedule || ""
            );

            return (
              <div
                key={appointment._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header with Doctor Info */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative">
                      <img
                        src={
                          appointment.doctorRef.logo || appointment.userRef.logo
                        }
                        alt={
                          appointment.doctorRef.name || appointment.userRef.name
                        }
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src = `data:image/svg+xml;base64,${btoa(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
                              <rect width="64" height="64" fill="#f3f4f6"/>
                              <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="24" fill="#9ca3af">
                                ${appointment.doctorRef.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </text>
                            </svg>
                          `)}`;
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          {appointment.doctorRef ? (
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                Dr. {appointment.scheduleRef.knownAs}
                              </h3>
                              <p className="text-gray-600 mb-2">
                                {appointment.scheduleRef?.description ||
                                  "General Practitioner"}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                {appointment.userRef.name}
                              </h3>
                              <p className="text-gray-600 mb-2">
                                {appointment.scheduleRef?.gender ||
                                  "General Practitioner"}
                              </p>
                            </div>
                          )}
                          {appointment.scheduleRef?.specialist && (
                            <div className="flex flex-wrap gap-1">
                              {appointment.scheduleRef.specialist
                                .slice(0, 2)
                                .map((spec, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
                                  >
                                    {spec}
                                  </span>
                                ))}
                              {appointment.scheduleRef.specialist.length >
                                2 && (
                                <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                                  +
                                  {appointment.scheduleRef.specialist.length -
                                    2}{" "}
                                  more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${
                            statusColors[appointment.status]
                          }`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Schedule */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          Schedule
                        </span>
                      </div>
                      <div className="text-gray-700">
                        <div className="font-semibold">{date}</div>
                        <div className="text-lg font-bold text-blue-600">
                          {time}
                        </div>
                      </div>
                    </div>

                    {/* Fee */}
                    {appointment.scheduleRef?.chargeFee && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">
                            Consultation Fee
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          ৳{appointment.scheduleRef.chargeFee}
                        </div>
                      </div>
                    )}

                    {/* Access Status */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-purple-900">
                          Problem Access
                        </span>
                      </div>
                      <div
                        className={`font-semibold ${
                          appointment.problemAccessToDoctor
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {appointment.problemAccessToDoctor
                          ? "✓ Granted"
                          : "✗ Restricted"}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Requested by: </span>
                      <span className="font-medium capitalize text-gray-900">
                        {latestSchedule?.reqBy || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Appointment ID: </span>
                      <span className="font-mono font-medium text-gray-900">
                        #{appointment._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Reason */}
                  {latestSchedule?.reason &&
                    latestSchedule.reason.trim() !== "" && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-700">
                              Reason:{" "}
                            </span>
                            <span className="text-gray-600">
                              {latestSchedule.reason}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Created{" "}
                      {new Date(appointment.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-3">
                      {userType === "user" &&
                        appointment.status !== "cancel" && (
                          <button
                            onClick={() =>
                              handleCancelAppointment(appointment._id)
                            }
                            disabled={
                              loadingAction === `cancel-${appointment._id}`
                            }
                            className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-red-200 disabled:opacity-50"
                          >
                            {loadingAction === `cancel-${appointment._id}` ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                Canceling...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <X className="h-4 w-4" />
                                Cancel
                              </div>
                            )}
                          </button>
                        )}

                      {userType === "doctor" &&
                        appointment.status === "request" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleDoctorResponse(appointment._id, "reject")
                              }
                              disabled={
                                loadingAction === `reject-${appointment._id}`
                              }
                              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-red-200 disabled:opacity-50"
                            >
                              {loadingAction === `reject-${appointment._id}` ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                  Rejecting...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <X className="h-4 w-4" />
                                  Reject
                                </div>
                              )}
                            </button>

                            <button
                              onClick={() =>
                                handleDoctorResponse(
                                  appointment._id,
                                  "reSchedule"
                                )
                              }
                              disabled={
                                loadingAction ===
                                `reSchedule-${appointment._id}`
                              }
                              className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium border border-blue-200 disabled:opacity-50"
                            >
                              {loadingAction ===
                              `reSchedule-${appointment._id}` ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                  Rescheduling...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <RotateCcw className="h-4 w-4" />
                                  Reschedule
                                </div>
                              )}
                            </button>

                            <button
                              onClick={() =>
                                handleDoctorResponse(appointment._id, "accept")
                              }
                              disabled={
                                loadingAction === `accept-${appointment._id}`
                              }
                              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              {loadingAction === `accept-${appointment._id}` ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Accepting...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Check className="h-4 w-4" />
                                  Accept
                                </div>
                              )}
                            </button>
                          </div>
                        )}

                      <button
                        onClick={() =>
                          handelViewDetails(appointment.problemRef)
                        }
                        className="px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

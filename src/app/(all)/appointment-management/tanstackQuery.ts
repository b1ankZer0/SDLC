import { callApi } from "@/global/func";

// Types
export interface Appointment {
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

export interface CreateAppointmentData {
  userRef: string;
  doctorRef: string;
  problemRef: string;
  problemAccessToDoctor: boolean;
  scheduleReqBy: Array<{
    reqBy: "user" | "doctor";
    schedule: string;
    reason: string;
  }>;
}

// API Functions
export const getAllAppointments = async (): Promise<Appointment[]> => {
  try {
    const response = await callApi("/appointment/all-appointment", "GET");
    if (response.error) {
      throw new Error(response.message || "Failed to fetch appointments");
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllDoctorRequests = async (): Promise<Appointment[]> => {
  try {
    const response = await callApi("/appointment/all-reqToDoctor", "GET");
    if (response.error) {
      throw new Error(response.message || "Failed to fetch doctor requests");
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAppointmentById = async (id: string): Promise<Appointment> => {
  try {
    const response = await callApi(`/appointment/${id}`, "GET");
    if (response.error) {
      throw new Error(response.message || "Failed to fetch appointment");
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Query Keys
export const appointmentKeys = {
  all: ["appointments"] as const,
  userAppointments: ["appointments", "user"] as const,
  doctorRequests: ["appointments", "doctor"] as const,
  detail: (id: string) => ["appointments", "detail", id] as const,
};

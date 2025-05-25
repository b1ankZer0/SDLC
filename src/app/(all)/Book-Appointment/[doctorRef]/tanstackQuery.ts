// tanstackQuery.ts (Updated version)
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

interface DoctorSchedule {
  _id: string;
  ref: string;
  knownAs: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  specialist: string[];
  from: number;
  to: number;
  startAt: string;
  duration: number;
  willSeeFor: number;
  chargeFee: number;
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

export interface Problem {
  _id: string;
  title: string;
}

export const getDoctorSchedule = async (
  doctorRef: string
): Promise<DoctorSchedule> => {
  try {
    const response = await callApi(`/schedule/getSchedule/${doctorRef}`, "GET");
    if (response.error) {
      throw new Error(response.message || "Failed to fetch doctor schedule");
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createAppointment = async (
  appointmentData: CreateAppointmentData
): Promise<Appointment> => {
  try {
    const response = await callApi(
      "/appointment/add-appointment",
      "POST",
      appointmentData
    );
    if (response.error) {
      throw new Error(response.message || "Failed to create appointment");
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// New API function for problems
export const getAllProblemsOptions = async (): Promise<Problem[]> => {
  try {
    const response = await callApi("/problems/allProblemsOption", "GET");
    if (response.error) {
      throw new Error(response.message || "Failed to fetch problems");
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

export const problemKeys = {
  all: ["problems"] as const,
  options: ["problems", "options"] as const,
};

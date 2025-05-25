// app/Book-Appointment/[doctorRef]/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Plus,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Star,
  DollarSign,
  Timer,
} from "lucide-react";
import {
  createAppointment,
  getDoctorSchedule,
  getAllProblemsOptions,
} from "./tanstackQuery";
import { useUser } from "@/global/hook/useUser";

// Day names mapping
const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const generateTimeSlots = (schedule, selectedDate: string) => {
  const slots = [];
  const selectedDay = new Date(selectedDate).getDay();

  // Check if selected date falls within doctor's working days
  if (selectedDay < schedule.from || selectedDay > schedule.to) {
    return [];
  }

  const startTime = schedule.startAt;
  const duration = schedule.duration;
  const slotDuration = schedule.willSeeFor;

  // Parse start time (assuming format like "09:00")
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = startTimeInMinutes + duration * 60;

  // Generate time slots
  for (
    let time = startTimeInMinutes;
    time < endTimeInMinutes;
    time += slotDuration
  ) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    slots.push(timeString);
  }

  return slots;
};

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  const doctorRef = params.doctorRef as string;

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState<Partial>({
    doctorRef: doctorRef,
    problemAccessToDoctor: true,
    scheduleReqBy: {
      reqBy: "user",
      schedule: "",
      reason: "",
    },
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);

  // Fetch doctor schedule
  const {
    data: doctorSchedule,
    isLoading: scheduleLoading,
    error: scheduleError,
  } = useQuery({
    queryKey: ["doctorSchedule", doctorRef],
    queryFn: () => getDoctorSchedule(doctorRef),
    enabled: !!doctorRef,
  });

  // Fetch problems
  const { data: problems, isLoading: problemsLoading } = useQuery({
    queryKey: ["problemsOptions"],
    queryFn: getAllProblemsOptions,
    enabled: showBookingForm,
  });

  // Create appointment mutation
  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctorRequests"] });

      // Navigate back to appointments page after success
      setTimeout(() => {
        router.push("/appointment-management");
      }, 2000);
    },
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update schedule when date and time are selected
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const dateTimeString = `${selectedDate}T${selectedTime}`;
      setFormData((prev) => ({
        ...prev,
        scheduleReqBy: {
          ...prev.scheduleReqBy!,
          schedule: dateTimeString,
        },
      }));
    }
  }, [selectedDate, selectedTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.doctorRef ||
      !formData.problemRef ||
      !formData.scheduleReqBy?.schedule
    ) {
      return;
    }

    // Send formData with doctorRef as schedule._id
    mutation.mutate({
      ...formData,
      doctorRef: doctorSchedule?.ref, // Use schedule._id
      scheduleRef: doctorSchedule?._id, // Use schedule._id
      scheduleReqBy: [formData.scheduleReqBy],
    } as any);
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("scheduleReqBy.")) {
      const subField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        scheduleReqBy: {
          ...prev.scheduleReqBy!,
          [subField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleProblemSelect = (problem: Problem) => {
    setSelectedProblem(problem);
    setFormData((prev) => ({
      ...prev,
      problemRef: problem._id,
    }));
    setIsDropdownOpen(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setIsTimeDropdownOpen(false);
  };

  const handleAddProblem = () => {
    router.push("/problems");
  };

  // Get available time slots for selected date
  const availableTimeSlots =
    selectedDate && doctorSchedule
      ? generateTimeSlots(doctorSchedule, selectedDate)
      : [];

  // Get minimum date (today)
  const minDate = new Date().toISOString().split("T")[0];

  if (scheduleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  if (scheduleError || !doctorSchedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Doctor Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The doctor's schedule information could not be loaded.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        {!showBookingForm ? (
          // Doctor Information Display
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-6">
                {doctorSchedule.ref.logo == "Not provided" ? (
                  <div className="p-3 bg-blue-100 rounded-full">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                ) : (
                  <img
                    src={doctorSchedule.ref.logo}
                    alt="Doctor Profile"
                    className="h-16 w-16 rounded-full object-cover border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Dr. {doctorSchedule.knownAs}
                  </h1>
                  <p className="text-gray-600 mb-4">
                    {doctorSchedule.description}
                  </p>

                  {/* Specialties */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Specialties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {doctorSchedule.specialist.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {doctorSchedule.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {doctorSchedule.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {doctorSchedule.address}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      Fee: ${doctorSchedule.chargeFee}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Timer className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      Session: {doctorSchedule.willSeeFor} minutes
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      Duration: {doctorSchedule.duration} hours
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Schedule Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Working Days</p>
                    <p className="text-gray-900 font-medium">
                      {dayNames[doctorSchedule.from]} -{" "}
                      {dayNames[doctorSchedule.to]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Working Hours</p>
                    <p className="text-gray-900 font-medium">
                      {doctorSchedule.startAt} (Duration:{" "}
                      {doctorSchedule.duration}h)
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Book Appointment
              </button>
            </div>
          </div>
        ) : (
          // Booking Form
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Book Appointment
                </h1>
                <p className="text-gray-600">
                  with Dr. {doctorSchedule.knownAs}
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Select Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime(""); // Reset time when date changes
                    }}
                    min={minDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {selectedDate && availableTimeSlots.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      Doctor is not available on this day. Please select a day
                      between {dayNames[doctorSchedule.from]} and{" "}
                      {dayNames[doctorSchedule.to]}.
                    </p>
                  )}
                </div>

                {/* Time Selection Dropdown */}
                {selectedDate && availableTimeSlots.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Select Time *
                    </label>
                    <div className="relative" ref={timeDropdownRef}>
                      <button
                        type="button"
                        onClick={() =>
                          setIsTimeDropdownOpen(!isTimeDropdownOpen)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
                      >
                        <span
                          className={
                            selectedTime ? "text-gray-900" : "text-gray-500"
                          }
                        >
                          {selectedTime || "Select a time..."}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-400 transition-transform ${
                            isTimeDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isTimeDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {availableTimeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleTimeSelect(time)}
                              className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="text-sm font-medium text-gray-900">
                                {time}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Problem Selection */}
                {selectedTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="h-4 w-4 inline mr-1" />
                      Select Problem *
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
                      >
                        <span
                          className={
                            selectedProblem ? "text-gray-900" : "text-gray-500"
                          }
                        >
                          {selectedProblem
                            ? selectedProblem.title
                            : "Select a problem..."}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-400 transition-transform ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {problemsLoading ? (
                            <div className="px-3 py-2 text-gray-500">
                              Loading problems...
                            </div>
                          ) : problems && problems.length > 0 ? (
                            problems.map((problem) => (
                              <button
                                key={problem._id}
                                type="button"
                                onClick={() => handleProblemSelect(problem)}
                                className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                              >
                                <div className="text-sm font-medium text-gray-900">
                                  {problem.title}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2">
                              <div className="text-gray-500 text-sm mb-2">
                                No problems found
                              </div>
                              <button
                                type="button"
                                onClick={handleAddProblem}
                                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Add Problem
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reason */}
                {selectedProblem && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Reason (Optional)
                    </label>
                    <textarea
                      value={formData.scheduleReqBy?.reason || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "scheduleReqBy.reason",
                          e.target.value
                        )
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter reason for appointment..."
                    />
                  </div>
                )}

                {/* Problem Access Checkbox */}
                {selectedProblem && (
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="problemAccess"
                      checked={formData.problemAccessToDoctor || false}
                      onChange={(e) =>
                        handleInputChange(
                          "problemAccessToDoctor",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="problemAccess"
                      className="text-sm text-gray-700"
                    >
                      Grant doctor access to problem details
                    </label>
                  </div>
                )}

                {mutation.error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-700">
                        {mutation.error instanceof Error
                          ? mutation.error.message
                          : "Failed to create appointment"}
                      </p>
                    </div>
                  </div>
                )}

                {mutation.isSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <p className="text-sm text-green-700">
                        Appointment request created successfully! Redirecting...
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Back to Info
                  </button>
                  <button
                    type="submit"
                    disabled={
                      mutation.isPending || !selectedProblem || !selectedTime
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {mutation.isPending ? "Creating..." : "Book Appointment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

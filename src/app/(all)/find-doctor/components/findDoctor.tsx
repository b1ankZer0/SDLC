"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Filter,
  User,
  X,
  ChevronDown,
  Star,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { callApi } from "@/global/func";
import PopUp from "@/app/utils/popup";

// Fetch doctors based on search term
const fetchDoctors = async (searchTerm) => {
  const response = await callApi(
    `/schedule/search/${searchTerm || "all"}`,
    "GET"
  );

  if (response.error) {
    throw new Error(response.message || "Failed to fetch doctors");
  }

  return response.data;
};

// Convert day number to day name
const getDayName = (dayNum) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNum];
};

// Format time from 24h to 12h format
const formatTime = (time) => {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${minutes || "00"} ${ampm}`;
};

// Generate available time slots based on doctor schedule
const generateTimeSlots = (startAt, duration, willSeeFor) => {
  const slots = [];
  const [startHour, startMinute] = startAt.split(":").map(Number);

  let currentHour = startHour;
  let currentMinute = startMinute;

  // Calculate number of appointments possible in the duration
  const totalMinutes = duration * 60;
  const appointmentDuration = willSeeFor;
  const numberOfSlots = Math.floor(totalMinutes / appointmentDuration);

  for (let i = 0; i < numberOfSlots; i++) {
    // Format current time
    const hour = currentHour.toString().padStart(2, "0");
    const minute = currentMinute.toString().padStart(2, "0");
    slots.push(`${hour}:${minute}`);

    // Move to next slot
    currentMinute += appointmentDuration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
};

// Doctor Card Component
const DoctorCard = ({ doctor }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  // Calculate available dates (next 14 days that match doctor's schedule)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();

      // Check if this day is within doctor's working days
      if (dayOfWeek >= doctor.from && dayOfWeek <= doctor.to) {
        dates.push(date);
      }
    }

    return dates;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const availableDates = getAvailableDates();
  const timeSlots = generateTimeSlots(
    doctor.startAt,
    doctor.duration,
    doctor.willSeeFor
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-start space-x-4">
          {/* Doctor's Profile Photo */}
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {doctor.ref?.logo ? (
              <img
                src={doctor.ref.logo}
                alt={`Dr. ${doctor.knownAs}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                <User size={32} />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg text-gray-900">
                Dr. {doctor.knownAs}
              </h3>
              <div className="flex items-center">
                <span className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 fill-yellow-500" />
                  <span className="ml-1 text-sm font-medium">4.8</span>
                </span>
              </div>
            </div>

            <div className="mt-1 flex flex-wrap gap-1">
              {doctor.specialist.map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>

            <div className="mt-2 text-sm text-gray-600 line-clamp-2">
              {doctor.description}
            </div>

            <div className="mt-2 flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              <span className="truncate">{doctor.address}</span>
            </div>

            <div className="mt-1 flex flex-wrap gap-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                <span>
                  {getDayName(doctor.from)} - {getDayName(doctor.to)}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                <span>
                  {formatTime(doctor.startAt)} ({doctor.duration} hr)
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                <span>${doctor.chargeFee}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {isExpanded ? "Show Less" : "Show More"}
          </button>

          <button
            onClick={() => setShowAppointmentModal(true)}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Book Appointment
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Contact Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{doctor.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{doctor.email}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Appointment Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>Session duration: {doctor.willSeeFor} minutes</p>
                <p>
                  Working hours: {formatTime(doctor.startAt)} -{" "}
                  {formatTime(
                    `${
                      parseInt(doctor.startAt.split(":")[0]) + doctor.duration
                    }:${doctor.startAt.split(":")[1]}`
                  )}
                </p>
                <p>Fee: ${doctor.chargeFee}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      <PopUp
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
      >
        <div className="bg-white rounded-lg max-w-md w-full overflow-hidden min-h-[420px] min-w-[400px]">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium text-lg">
              Book Appointment with Dr. {doctor.knownAs}
            </h3>
            <button
              onClick={() => setShowAppointmentModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            {/* Date Dropdown */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="w-full p-2 text-left text-sm rounded-md border border-gray-300 hover:border-blue-300"
              >
                {selectedDate || "Choose a date"}
              </button>

              {showDateDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {availableDates.slice(0, 6).map((date, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedDate(date.toISOString().split("T")[0]);
                        setShowDateDropdown(false);
                      }}
                      className="w-full p-2 text-sm text-left hover:bg-blue-50"
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time Dropdown */}
            {selectedDate && (
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Time
                </label>
                <button
                  onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                  className="w-full p-2 text-left text-sm rounded-md border border-gray-300 hover:border-blue-300"
                >
                  {selectedTime || "Choose a time"}
                </button>

                {showTimeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {timeSlots.map((time, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedTime(time);
                          setShowTimeDropdown(false);
                        }}
                        className="w-full p-2 text-sm text-left hover:bg-blue-50"
                      >
                        {formatTime(time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 mt-4">
              <button
                className={`w-full py-2 rounded-md font-medium ${
                  selectedDate && selectedTime
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!selectedDate || !selectedTime}
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      </PopUp>

      {/* {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-lg">
                Book Appointment with Dr. {doctor.knownAs}
              </h3>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Available Dates
                </h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {availableDates.slice(0, 7).map((date, index) => (
                    <div
                      key={index}
                      className={`relative p-3 rounded-md cursor-pointer ${
                        selectedDate === date.toISOString().split("T")[0]
                          ? "bg-blue-100"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        setSelectedDate(date.toISOString().split("T")[0])
                      }
                    >
                      <div
                        className={`text-center w-10 ${
                          selectedDate === date.toISOString().split("T")[0]
                            ? "text-blue-700"
                            : "text-gray-800"
                        }`}
                      >
                        <div className="text-xs font-medium mb-1">
                          {new Intl.DateTimeFormat("en-US", {
                            weekday: "short",
                          }).format(date)}
                        </div>
                        <div className="text-lg font-medium leading-none mb-1">
                          {date.getDate()}
                        </div>
                        <div className="text-xs leading-none">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                          }).format(date)}
                        </div>
                      </div>
                      {selectedDate === date.toISOString().split("T")[0] && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-b-md"></div>
                      )}
                    </div>
                  ))}
                </div>

                {availableDates.length > 7 && (
                  <button className="text-sm text-blue-600 hover:text-blue-800 mt-1">
                    Show more dates
                  </button>
                )}
              </div>

              {selectedDate && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Available Time Slots
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.map((time, index) => (
                      <div
                        key={index}
                        className={`py-2 px-3 rounded-md cursor-pointer text-center ${
                          selectedTime === time
                            ? "bg-blue-500 text-white"
                            : "border border-gray-200 hover:border-blue-300 text-gray-700"
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        <span className="text-sm font-medium">
                          {formatTime(time)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDate && selectedTime && (
                <div className="bg-blue-50 p-3 rounded-md mb-4">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">
                    Appointment Summary
                  </h4>
                  <div className="text-sm text-gray-700">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span>
                          {new Intl.DateTimeFormat("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }).format(new Date(selectedDate))}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{formatTime(selectedTime)}</span>
                      </div>

                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span>Dr. {doctor.knownAs}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                        <span>${doctor.chargeFee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  className={`w-full py-3 rounded-md font-medium ${
                    selectedDate && selectedTime
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!selectedDate || !selectedTime}
                >
                  Confirm Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

// Filter Sidebar Component
const FilterSidebar = ({ specialties, onFilterChange, filters }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Filters</h3>
        <button
          onClick={() => onFilterChange("reset")}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Reset
        </button>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties</h4>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {specialties.map((specialty, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                checked={filters.specialties.includes(specialty)}
                onChange={() => onFilterChange("specialty", specialty)}
              />
              <span className="text-sm text-gray-600">{specialty}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Availability</h4>
        <div className="space-y-1">
          {[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].map((day, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                checked={filters.days.includes(index)}
                onChange={() => onFilterChange("day", index)}
              />
              <span className="text-sm text-gray-600">{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            className="w-full p-2 text-sm border border-gray-300 rounded-md"
            value={filters.price.min}
            onChange={(e) =>
              onFilterChange("price", {
                min: e.target.value,
                max: filters.price.max,
              })
            }
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            className="w-full p-2 text-sm border border-gray-300 rounded-md"
            value={filters.price.max}
            onChange={(e) =>
              onFilterChange("price", {
                min: filters.price.min,
                max: e.target.value,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function FindDoctorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialties: [],
    days: [],
    price: { min: "", max: "" },
  });

  // List of all available specialties
  const specialties = [
    "Allergy and Immunology",
    "Anesthesiology",
    "Cardiology",
    "Cardiothoracic Surgery",
    "Dermatology",
    "Emergency Medicine",
    "Endocrinology",
    "Family Medicine",
    "Gastroenterology",
    "General Surgery",
    "Geriatrics",
    "Hematology",
    "Infectious Disease",
    "Internal Medicine",
    "Nephrology",
    "Neurology",
    "Neurosurgery",
    "Obstetrics and Gynecology",
    "Oncology",
    "Ophthalmology",
    "Orthopedic Surgery",
    "Otolaryngology (ENT)",
    "Palliative Care",
    "Pathology",
    "Pediatrics",
    "Physical Medicine and Rehabilitation",
    "Plastic Surgery",
    "Psychiatry",
    "Pulmonology",
    "Radiology",
    "Rheumatology",
    "Sleep Medicine",
    "Sports Medicine",
    "Thoracic Surgery",
    "Urology",
    "Vascular Surgery",
  ];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch doctors data
  const {
    data: doctors,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["doctors", debounceSearch],
    queryFn: () => fetchDoctors(debounceSearch),
  });

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    if (type === "reset") {
      setFilters({
        specialties: [],
        days: [],
        price: { min: "", max: "" },
      });
      return;
    }

    if (type === "specialty") {
      setFilters((prev) => ({
        ...prev,
        specialties: prev.specialties.includes(value)
          ? prev.specialties.filter((s) => s !== value)
          : [...prev.specialties, value],
      }));
    }

    if (type === "day") {
      setFilters((prev) => ({
        ...prev,
        days: prev.days.includes(value)
          ? prev.days.filter((d) => d !== value)
          : [...prev.days, value],
      }));
    }

    if (type === "price") {
      setFilters((prev) => ({
        ...prev,
        price: value,
      }));
    }
  };

  // Filter doctors
  const filteredDoctors =
    doctors?.filter((doctor) => {
      // Filter by specialties
      if (
        filters.specialties.length > 0 &&
        !doctor.specialist.some((s) => filters.specialties.includes(s))
      ) {
        return false;
      }

      // Filter by days
      if (filters.days.length > 0) {
        const doctorDays = [];
        for (let i = doctor.from; i <= doctor.to; i++) {
          doctorDays.push(i);
        }

        if (!filters.days.some((day) => doctorDays.includes(day))) {
          return false;
        }
      }

      // Filter by price
      if (
        filters.price.min !== "" &&
        doctor.chargeFee < parseFloat(filters.price.min)
      ) {
        return false;
      }

      if (
        filters.price.max !== "" &&
        doctor.chargeFee > parseFloat(filters.price.max)
      ) {
        return false;
      }

      return true;
    }) || [];

  // Handle search submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setDebounceSearch(searchTerm);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-lg text-gray-700">
          Searching for doctors...
        </span>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <AlertCircle className="h-8 w-8 mr-2" />
        <div>
          <p className="text-lg font-medium">Error finding doctors</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Find a Doctor</h1>

      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by doctor name, specialty, or location..."
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter toggle for mobile */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-700 font-medium px-4 py-2 border border-gray-300 rounded-md w-full"
        >
          <Filter className="h-5 w-5" />
          <span>Filters</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ml-auto ${
              showFilters ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {showFilters && (
          <div className="mt-4">
            <FilterSidebar
              specialties={specialties}
              onFilterChange={handleFilterChange}
              filters={filters}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar - desktop */}
        <div className="hidden md:block md:w-72 flex-shrink-0">
          <FilterSidebar
            specialties={specialties}
            onFilterChange={handleFilterChange}
            filters={filters}
          />
        </div>

        {/* Results */}
        <div className="flex-1">
          {/* Results count and sorting */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-700">
              <span className="font-medium">{filteredDoctors.length}</span>{" "}
              doctors found
            </p>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select className="text-sm border border-gray-300 rounded-md p-1.5">
                <option>Relevance</option>
                <option>Rating</option>
                <option>Fee: Low to High</option>
                <option>Fee: High to Low</option>
              </select>
            </div>
          </div>

          {/* No results */}
          {filteredDoctors.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                No doctors found
              </h3>
              <p className="text-gray-500 mt-1 max-w-md mx-auto">
                Try adjusting your search terms or filters to find doctors that
                match your criteria.
              </p>
            </div>
          )}

          {/* Doctor list */}
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

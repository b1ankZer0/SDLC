// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { callApi } from "@/global/func";
// import { useUser } from "@/global/hook/useUser";
// import {
//   useQuery,
//   useMutation,
//   useQueryClient,
//   QueryClient,
//   QueryClientProvider,
// } from "@tanstack/react-query";

// Create a client
// const queryClient = new QueryClient();

// // Wrap the app with QueryClientProvider
// export default function DoctorScheduleManagementWrapper() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <DoctorScheduleManagement />
//     </QueryClientProvider>
//   );
// }

// // Schedule API client functions
// const scheduleApi = {
//   getSchedule: async () => {
//     const res = await callApi("/schedule/get", "get");
//     if (res.error) {
//       throw new Error(res.message);
//     }
//     return res.data;
//   },
//   createSchedule: async (data) => {
//     const res = await callApi("/schedule/create", "post", data);
//     if (res.error) {
//       throw new Error(res.message);
//     }
//     return res.data;
//   },
//   updateSchedule: async (data) => {
//     const res = await callApi("/schedule/update", "put", data);
//     if (res.error) {
//       throw new Error(res.message);
//     }
//     return res.data;
//   },
// };

// // Constants for the form
// const SPECIALIST_OPTIONS = [
//   "Allergy and Immunology",
//   "Anesthesiology",
//   "Cardiology",
//   "Cardiothoracic Surgery",
//   "Dermatology",
//   "Emergency Medicine",
//   "Endocrinology",
//   "Family Medicine",
//   "Gastroenterology",
//   "General Surgery",
//   "Geriatrics",
//   "Hematology",
//   "Infectious Disease",
//   "Internal Medicine",
//   "Nephrology",
//   "Neurology",
//   "Neurosurgery",
//   "Obstetrics and Gynecology",
//   "Oncology",
//   "Ophthalmology",
//   "Orthopedic Surgery",
//   "Otolaryngology (ENT)",
//   "Palliative Care",
//   "Pathology",
//   "Pediatrics",
//   "Physical Medicine and Rehabilitation",
//   "Plastic Surgery",
//   "Psychiatry",
//   "Pulmonology",
//   "Radiology",
//   "Rheumatology",
//   "Sleep Medicine",
//   "Sports Medicine",
//   "Thoracic Surgery",
//   "Urology",
//   "Vascular Surgery",
// ];

// const DAYS_OF_WEEK = [
//   { value: 0, label: "Sunday" },
//   { value: 1, label: "Monday" },
//   { value: 2, label: "Tuesday" },
//   { value: 3, label: "Wednesday" },
//   { value: 4, label: "Thursday" },
//   { value: 5, label: "Friday" },
//   { value: 6, label: "Saturday" },
// ];

// const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// const WILLSEEFOR_OPTIONS = [5, 10, 15, 30, 45, 60];

// // Main component for doctor schedule management
// function DoctorScheduleManagement() {
//   const { user, loading: userLoading } = useUser();
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const [success, setSuccess] = useState("");
//   const [activeTab, setActiveTab] = useState("schedule");

//   // Form state
//   const [formData, setFormData] = useState({
//     knownAs: "",
//     description: "",
//     email: "",
//     phone: "",
//     address: "",
//     specialist: [],
//     from: 1, // Monday default
//     to: 5, // Friday default
//     startAt: "09:00",
//     duration: 8,
//     willSeeFor: 30,
//     chargeFee: "", // New charge fee field
//   });

//   // Check if user is authorized
//   useEffect(() => {
//     if (!userLoading) {
//       if (!user) {
//         router.push("/login");
//       } else if (user.role !== "doctor") {
//         router.push("/unauthorized");
//       }
//     }
//   }, [user, userLoading, router]);

//   // Fetch schedule using useQuery
//   const {
//     data: scheduleData,
//     isLoading: isScheduleLoading,
//     error: scheduleError,
//     isFetched: isScheduleFetched,
//   } = useQuery({
//     queryKey: ["doctorSchedule"],
//     queryFn: scheduleApi.getSchedule,
//     enabled: !!user && user.role === "doctor",
//     retry: false,
//     onSuccess: (data) => {
//       if (data && data.data) {
//         // Populate form with current schedule data
//         setFormData({
//           knownAs: data.data.knownAs || "",
//           description: data.data.description || "",
//           email: data.data.email || "",
//           phone: data.data.phone || "",
//           address: data.data.address || "",
//           specialist: data.data.specialist || [],
//           from: data.data.from || 1,
//           to: data.data.to || 5,
//           startAt: data.data.startAt || "09:00",
//           duration: data.data.duration || 8,
//           willSeeFor: data.data.willSeeFor || 30,
//           chargeFee: data.data.chargeFee || "",
//         });
//       }
//     },
//   });

//   // Fetch appointment requests
//   const {
//     data: appointmentData,
//     isLoading: isAppointmentLoading,
//     error: appointmentError,
//     refetch: refetchAppointments,
//   } = useQuery({
//     queryKey: ["appointmentRequests"],
//     queryFn: appointmentApi.getAppointmentRequests,
//     enabled: !!user && user.role === "doctor",
//     retry: false,
//   });

//   // Schedule exists check
//   const hasExistingSchedule = !!(
//     isScheduleFetched &&
//     scheduleData &&
//     scheduleData.data
//   );

//   // Create schedule mutation
//   const createScheduleMutation = useMutation({
//     mutationFn: scheduleApi.createSchedule,
//     onSuccess: (data) => {
//       setSuccess("Schedule created successfully");
//       queryClient.invalidateQueries({ queryKey: ["doctorSchedule"] });
//     },
//   });

//   // Update schedule mutation
//   const updateScheduleMutation = useMutation({
//     mutationFn: scheduleApi.updateSchedule,
//     onSuccess: (data) => {
//       setSuccess("Schedule updated successfully");
//       queryClient.invalidateQueries({ queryKey: ["doctorSchedule"] });
//     },
//   });

//   // Approve appointment mutation
//   const approveAppointmentMutation = useMutation({
//     mutationFn: appointmentApi.approveAppointment,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["appointmentRequests"] });
//     },
//   });

//   // Reject appointment mutation
//   const rejectAppointmentMutation = useMutation({
//     mutationFn: appointmentApi.rejectAppointment,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["appointmentRequests"] });
//     },
//   });

//   // Combine loading states
//   const isLoading =
//     isScheduleLoading ||
//     createScheduleMutation.isPending ||
//     updateScheduleMutation.isPending;

//   // Combine error states
//   const error =
//     scheduleError ||
//     createScheduleMutation.error ||
//     updateScheduleMutation.error;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSuccess("");

//     const mutation = hasExistingSchedule
//       ? updateScheduleMutation
//       : createScheduleMutation;

//     mutation.mutate(formData);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "duration" || name === "willSeeFor") {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: parseInt(value, 10),
//       }));
//       return;
//     }
//     if (name === "chargeFee") {
//       // Allow only numbers in charge fee field
//       const numbersOnly = value.replace(/[^0-9]/g, "");
//       setFormData((prev) => ({ ...prev, [name]: numbersOnly }));
//       return;
//     }
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSpecialistChange = (e) => {
//     const value = Array.from(
//       e.target.selectedOptions,
//       (option) => option.value
//     );
//     setFormData((prev) => ({ ...prev, specialist: value }));
//   };

//   const handleApproveAppointment = (appointmentId) => {
//     approveAppointmentMutation.mutate(appointmentId);
//   };

//   const handleRejectAppointment = (appointmentId) => {
//     rejectAppointmentMutation.mutate(appointmentId);
//   };

//   if (userLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Format date for appointment display
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Tabs for navigation */}
//         <div className="flex border-b border-gray-200 mb-8">
//           <button
//             className={`px-6 py-3 font-medium text-sm border-b-2 ${
//               activeTab === "schedule"
//                 ? "border-blue-600 text-blue-600"
//                 : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//             }`}
//             onClick={() => setActiveTab("schedule")}
//           >
//             Doctor Schedule
//           </button>
//           <button
//             className={`px-6 py-3 font-medium text-sm border-b-2 ${
//               activeTab === "appointments"
//                 ? "border-blue-600 text-blue-600"
//                 : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//             }`}
//             onClick={() => setActiveTab("appointments")}
//           >
//             Appointment Requests
//           </button>
//         </div>

//         {activeTab === "schedule" ? (
//           <>
//             {/* Schedule Management Section */}
//             <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8">
//               <div className="mb-8 text-center">
//                 <h1 className="text-3xl font-bold text-gray-800">
//                   {hasExistingSchedule
//                     ? "Your Schedule Information"
//                     : "Create Your Schedule"}
//                 </h1>
//                 <p className="text-gray-500 mt-2">
//                   {hasExistingSchedule
//                     ? "Review and update your availability for patient appointments"
//                     : "Set your availability for patient appointments"}
//                 </p>
//               </div>

//               {error && (
//                 <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
//                   {error instanceof Error ? error.message : "An error occurred"}
//                 </div>
//               )}

//               {success && (
//                 <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
//                   {success}
//                 </div>
//               )}

//               <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* Basic Information */}
//                 <div className="space-y-6">
//                   <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
//                     Basic Information
//                   </h2>

//                   <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//                     <div>
//                       <label
//                         htmlFor="knownAs"
//                         className="block text-sm font-medium text-gray-700"
//                       >
//                         Professional Name
//                       </label>
//                       <input
//                         type="text"
//                         id="knownAs"
//                         name="knownAs"
//                         value={formData.knownAs}
//                         onChange={handleChange}
//                         required
//                         maxLength={50}
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       />
//                     </div>

//                     <div>
//                       <label
//                         htmlFor="email"
//                         className="block text-sm font-medium text-gray-700"
//                       >
//                         Email
//                       </label>
//                       <input
//                         type="email"
//                         id="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                         required
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       />
//                     </div>

//                     <div>
//                       <label
//                         htmlFor="phone"
//                         className="block text-sm font-medium text-gray-700"
//                       >
//                         Phone
//                       </label>
//                       <input
//                         type="tel"
//                         id="phone"
//                         name="phone"
//                         value={formData.phone}
//                         onChange={handleChange}
//                         required
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       />
//                     </div>

//                     <div>
//                       <label
//                         htmlFor="chargeFee"
//                         className="block text-sm font-medium text-gray-700"
//                       >
//                         Consultation Fee ($)
//                       </label>
//                       <input
//                         type="text"
//                         id="chargeFee"
//                         name="chargeFee"
//                         value={formData.chargeFee}
//                         onChange={handleChange}
//                         required
//                         placeholder="0"
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       />
//                     </div>

//                     <div className="sm:col-span-2">
//                       <label
//                         htmlFor="address"
//                         className="block text-sm font-medium text-gray-700"
//                       >
//                         Address
//                       </label>
//                       <input
//                         type="text"
//                         id="address"
//                         name="address"
//                         value={formData.address}
//                         onChange={handleChange}
//                         required
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       />
//                     </div>

//                     <div className="sm:col-span-2">
//                       <label
//                         htmlFor="description"
//                         className="block text-sm font-medium text-gray-700"
//                       >
//                         Professional Description
//                       </label>
//                       <textarea
//                         id="description"
//                         name="description"
//                         rows={3}
//                         value={formData.description}
//                         onChange={handleChange}
//                         required
//                         maxLength={300}
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       />
//                       <p className="mt-1 text-sm text-gray-500">
//                         {300 - formData.description.length} characters remaining
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Specialization */}
//                 <div className="space-y-6">
//                   <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
//                     Specialization
//                   </h2>

//                   <div>
//                     <label
//                       htmlFor="specialist"
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Fields of Expertise (hold Ctrl/Cmd to select multiple)
//                     </label>
//                     <select
//                       id="specialist"
//                       name="specialist"
//                       multiple
//                       value={formData.specialist}
//                       onChange={handleSpecialistChange}
//                       required
//                       className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       size={5}
//                     >
//                       {SPECIALIST_OPTIONS.map((option) => (
//                         <option key={option} value={option}>
//                           {option}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 {/* Schedule Settings */}
//                 <div className="space-y-6">
//                   <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
//                     Schedule Settings
//                   </h2>

//                   <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//                     <div>
//                       <label
//                         htmlFor="from"
//                         className="block text-sm font-medium text-gray-700"
//                       >
//                         Available From
//                       </label>
//                       <select
//                         id="from"
//                         name="from"
//                         value={formData.from}
//                         onChange={handleChange}
//                         required
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       >
//                         {DAYS_OF_WEEK.map((day) => (
//                           <option key={day.value} value={day.value}>
//                             {day.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label
//                         htmlFor="to"
//                         className="block text-sm font-medium text-gray-700"
//                       >
//                         Available To
//                       </label>
//                       <select
//                         id="to"
//                         name="to"
//                         value={formData.to}
//                         onChange={handleChange}
//                         required
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       >
//                         {DAYS_OF_WEEK.map((day) => (
//                           <option key={day.value} value={day.value}>
//                             {day.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label
//                         htmlFor="startAt"
//                         className="block text-sm font-medium text-gray-700"
//                       >
//                         Start Time
//                       </label>
//                       <input
//                         type="time"
//                         id="startAt"
//                         name="startAt"
//                         value={formData.startAt}
//                         onChange={handleChange}
//                         required
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       />
//                     </div>

//                     <div>
//                       <label
//                         htmlFor="duration"
//                         className="block text-sm font-medium text-gray-700"
//                       >
//                         Daily Duration (hours)
//                       </label>
//                       <select
//                         id="duration"
//                         name="duration"
//                         value={formData.duration}
//                         onChange={handleChange}
//                         required
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       >
//                         {DURATION_OPTIONS.map((option) => (
//                           <option key={option} value={option}>
//                             {option} {option === 1 ? "hour" : "hours"}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label
//                         htmlFor="willSeeFor"
//                         className="block text-sm font-medium text-gray-700"
//                       >
//                         Appointment Duration (minutes)
//                       </label>
//                       <select
//                         id="willSeeFor"
//                         name="willSeeFor"
//                         value={formData.willSeeFor}
//                         onChange={handleChange}
//                         required
//                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       >
//                         {WILLSEEFOR_OPTIONS.map((option) => (
//                           <option key={option} value={option}>
//                             {option} minutes
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-8">
//                   <button
//                     type="submit"
//                     disabled={isLoading}
//                     className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
//                       isLoading ? "opacity-75 cursor-not-allowed" : ""
//                     }`}
//                   >
//                     {isLoading ? (
//                       <>
//                         <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
//                         {hasExistingSchedule ? "Updating..." : "Creating..."}
//                       </>
//                     ) : hasExistingSchedule ? (
//                       "Update Schedule"
//                     ) : (
//                       "Create Schedule"
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </>
//         ) : (
//           <>
//             {/* Appointment Requests Section */}
//             <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8">
//               <div className="mb-8 text-center">
//                 <h1 className="text-3xl font-bold text-gray-800">
//                   Appointment Requests
//                 </h1>
//                 <p className="text-gray-500 mt-2">
//                   Review and manage appointment requests from patients
//                 </p>
//               </div>

//               {appointmentError && (
//                 <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
//                   {appointmentError instanceof Error
//                     ? appointmentError.message
//                     : "An error occurred"}
//                 </div>
//               )}

//               {isAppointmentLoading ? (
//                 <div className="text-center py-8">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                   <p className="mt-4 text-gray-600">
//                     Loading appointment requests...
//                   </p>
//                 </div>
//               ) : appointmentData &&
//                 appointmentData.data &&
//                 appointmentData.data.length > 0 ? (
//                 <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
//                   <table className="min-w-full divide-y divide-gray-300">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th
//                           scope="col"
//                           className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
//                         >
//                           Patient
//                         </th>
//                         <th
//                           scope="col"
//                           className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
//                         >
//                           Date & Time
//                         </th>
//                         <th
//                           scope="col"
//                           className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
//                         >
//                           Status
//                         </th>
//                         <th
//                           scope="col"
//                           className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
//                         >
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200 bg-white">
//                       {appointmentData.data.map((appointment) => (
//                         <tr key={appointment._id}>
//                           <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
//                             {appointment.patientName}
//                             <div className="text-xs text-gray-500">
//                               {appointment.patientEmail}
//                             </div>
//                           </td>
//                           <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
//                             {formatDate(appointment.appointmentDate)}
//                           </td>
//                           <td className="whitespace-nowrap px-3 py-4 text-sm">
//                             <span
//                               className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
//                                 appointment.status === "pending"
//                                   ? "bg-yellow-100 text-yellow-800"
//                                   : appointment.status === "approved"
//                                   ? "bg-green-100 text-green-800"
//                                   : "bg-red-100 text-red-800"
//                               }`}
//                             >
//                               {appointment.status === "pending"
//                                 ? "Pending"
//                                 : appointment.status === "approved"
//                                 ? "Approved"
//                                 : "Rejected"}
//                             </span>
//                           </td>
//                           <td className="whitespace-nowrap px-3 py-4 text-sm">
//                             {appointment.status === "pending" && (
//                               <div className="flex space-x-2">
//                                 <button
//                                   onClick={() =>
//                                     handleApproveAppointment(appointment._id)
//                                   }
//                                   className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
//                                 >
//                                   Approve
//                                 </button>
//                                 <button
//                                   onClick={() =>
//                                     handleRejectAppointment(appointment._id)
//                                   }
//                                   className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//                                 >
//                                   Reject
//                                 </button>
//                               </div>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-8 bg-gray-50 rounded-lg">
//                   <p className="text-gray-500">
//                     No appointment requests available
//                   </p>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { callApi } from "@/global/func";
import { useUser } from "@/global/hook/useUser";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Schedule API client functions
const scheduleApi = {
  getSchedule: async () => {
    const res = await callApi("/schedule/get", "get");
    if (res.error) {
      throw new Error(res.message);
    }
    return res.data;
  },
  createSchedule: async (data) => {
    const res = await callApi("/schedule/create", "post", data);
    if (res.error) {
      throw new Error(res.message);
    }
    return res.data;
  },
  updateSchedule: async (data) => {
    const res = await callApi("/schedule/update", "put", data);
    if (res.error) {
      throw new Error(res.message);
    }
    return res.data;
  },
};

// Constants for the form
const SPECIALIST_OPTIONS = [
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

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const WILLSEEFOR_OPTIONS = [5, 10, 15, 30, 45, 60];

// Main component for doctor schedule management
export default function DoctorScheduleManagement() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    knownAs: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    specialist: [],
    from: 1, // Monday default
    to: 5, // Friday default
    startAt: "09:00",
    duration: 8,
    willSeeFor: 30,
    chargeFee: "", // New charge fee field
  });

  // Query for fetching schedule data
  const {
    data: scheduleData,
    isLoading: scheduleLoading,
    error: scheduleError,
  } = useQuery({
    queryKey: ["doctorSchedule"],
    queryFn: scheduleApi.getSchedule,
    enabled: !!user && user.role === "doctor", // Only fetch when user is authenticated and is a doctor
    retry: false, // Don't retry if no schedule exists
    refetchOnWindowFocus: false,
  });

  // Mutation for creating schedule
  const createScheduleMutation = useMutation({
    mutationFn: scheduleApi.createSchedule,
    onSuccess: (data) => {
      setSuccess("Schedule created successfully");
      setShowForm(false);
      // Update the cache with the new data
      queryClient.setQueryData(["doctorSchedule"], data);
      // Clear any previous errors
      setError("");
    },
    onError: (err) => {
      setError(err.message || "An error occurred while creating schedule");
      setSuccess("");
    },
  });

  // Mutation for updating schedule
  const updateScheduleMutation = useMutation({
    mutationFn: scheduleApi.updateSchedule,
    onSuccess: (data) => {
      setSuccess("Schedule updated successfully");
      setShowForm(false);
      // Update the cache with the new data
      queryClient.setQueryData(["doctorSchedule"], data);
      // Clear any previous errors
      setError("");
    },
    onError: (err) => {
      setError(err.message || "An error occurred while updating schedule");
      setSuccess("");
    },
  });

  // Check if user is authorized
  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push("/login");
        return;
      } else if (user.role !== "doctor") {
        router.push("/unauthorized");
        return;
      }
    }
  }, [user, userLoading, router]);

  // Populate form with schedule data when it's available
  useEffect(() => {
    if (scheduleData) {
      setFormData({
        knownAs: scheduleData.knownAs || "",
        description: scheduleData.description || "",
        email: scheduleData.email || "",
        phone: scheduleData.phone || "",
        address: scheduleData.address || "",
        specialist: scheduleData.specialist || [],
        from: scheduleData.from || 1,
        to: scheduleData.to || 5,
        startAt: scheduleData.startAt || "09:00",
        duration: scheduleData.duration || 8,
        willSeeFor: scheduleData.willSeeFor || 30,
        chargeFee: scheduleData.chargeFee?.toString() || "",
      });
    }
  }, [scheduleData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Determine whether to create or update based on existing schedule data
    if (scheduleData) {
      updateScheduleMutation.mutate(formData);
    } else {
      createScheduleMutation.mutate(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "duration" || name === "willSeeFor") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10),
      }));
      return;
    }
    if (name === "chargeFee") {
      // Allow only numbers in charge fee field
      const numbersOnly = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: numbersOnly }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecialistChange = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, specialist: value }));
  };

  const getDayName = (dayValue) => {
    const day = DAYS_OF_WEEK.find((d) => d.value === dayValue);
    return day ? day.label : "Unknown";
  };

  // Show loading while user is being fetched or schedule is being loaded
  const isLoading =
    userLoading ||
    scheduleLoading ||
    createScheduleMutation.isPending ||
    updateScheduleMutation.isPending;

  if (userLoading || (scheduleLoading && user?.role === "doctor")) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
            {success}
          </div>
        )}

        {!showForm ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8">
            {scheduleData ? (
              // Show existing schedule information
              <>
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-bold text-gray-800">
                    Your Schedule Information
                  </h1>
                  <p className="text-gray-500 mt-2">
                    Current schedule and availability settings
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Basic Information Display */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                      Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Professional Name
                        </label>
                        <p className="text-gray-900 font-medium">
                          {scheduleData.knownAs}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Email
                        </label>
                        <p className="text-gray-900">{scheduleData.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Phone
                        </label>
                        <p className="text-gray-900">{scheduleData.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Consultation Fee
                        </label>
                        <p className="text-gray-900 font-medium">
                          ${scheduleData.chargeFee}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600">
                          Address
                        </label>
                        <p className="text-gray-900">{scheduleData.address}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600">
                          Description
                        </label>
                        <p className="text-gray-900">
                          {scheduleData.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Specialization Display */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                      Specialization
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {scheduleData.specialist.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Schedule Settings Display */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                      Schedule Settings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Available Days
                        </label>
                        <p className="text-gray-900 font-medium">
                          {getDayName(scheduleData.from)} to{" "}
                          {getDayName(scheduleData.to)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Start Time
                        </label>
                        <p className="text-gray-900 font-medium">
                          {scheduleData.startAt}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Daily Duration
                        </label>
                        <p className="text-gray-900 font-medium">
                          {scheduleData.duration} hours
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Appointment Duration
                        </label>
                        <p className="text-gray-900 font-medium">
                          {scheduleData.willSeeFor} minutes
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Created
                        </label>
                        <p className="text-gray-900 font-medium">
                          {new Date(
                            scheduleData.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Last Updated
                        </label>
                        <p className="text-gray-900 font-medium">
                          {new Date(
                            scheduleData.updatedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Update Schedule
                  </button>
                </div>
              </>
            ) : (
              // Show add schedule option when no data found
              <>
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-bold text-gray-800">
                    No Schedule Found
                  </h1>
                  <p className="text-gray-500 mt-2">
                    You haven't created your schedule yet. Create one to start
                    accepting appointments.
                  </p>
                </div>

                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0V7m6 0V7m-6 4h6m-6 0v8a2 2 0 002 2h4a2 2 0 002-2v-8"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Create Your Schedule
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Set up your availability, consultation fees, and
                    professional information.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Schedule
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          // Show form for creating/updating schedule
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                {scheduleData ? "Update Your Schedule" : "Create Your Schedule"}
              </h1>
              <p className="text-gray-500 mt-2">
                {scheduleData
                  ? "Update your availability and professional information"
                  : "Set your availability for patient appointments"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="knownAs"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Professional Name
                    </label>
                    <input
                      type="text"
                      id="knownAs"
                      name="knownAs"
                      value={formData.knownAs}
                      onChange={handleChange}
                      required
                      maxLength={50}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="chargeFee"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Consultation Fee ($)
                    </label>
                    <input
                      type="text"
                      id="chargeFee"
                      name="chargeFee"
                      value={formData.chargeFee}
                      onChange={handleChange}
                      required
                      placeholder="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Professional Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      required
                      maxLength={300}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {300 - formData.description.length} characters remaining
                    </p>
                  </div>
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
                  Specialization
                </h2>

                <div>
                  <label
                    htmlFor="specialist"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Fields of Expertise (hold Ctrl/Cmd to select multiple)
                  </label>
                  <select
                    id="specialist"
                    name="specialist"
                    multiple
                    value={formData.specialist}
                    onChange={handleSpecialistChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    size={5}
                  >
                    {SPECIALIST_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Schedule Settings */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
                  Schedule Settings
                </h2>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="from"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Available From
                    </label>
                    <select
                      id="from"
                      name="from"
                      value={formData.from}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="to"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Available To
                    </label>
                    <select
                      id="to"
                      name="to"
                      value={formData.to}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="startAt"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="startAt"
                      name="startAt"
                      value={formData.startAt}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Daily Duration (hours)
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {DURATION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option} {option === 1 ? "hour" : "hours"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="willSeeFor"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Appointment Duration (minutes)
                    </label>
                    <select
                      id="willSeeFor"
                      name="willSeeFor"
                      value={formData.willSeeFor}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {WILLSEEFOR_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option} minutes
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      {scheduleData ? "Updating..." : "Creating..."}
                    </>
                  ) : scheduleData ? (
                    "Update Schedule"
                  ) : (
                    "Create Schedule"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

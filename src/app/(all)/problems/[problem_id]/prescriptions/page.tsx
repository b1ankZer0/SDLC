"use client";
import React, { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  X,
  Plus,
  Trash2,
  Pill,
  Clock,
  Activity,
  PlusCircle,
  Loader2,
  AlertCircle,
  Search,
  RefreshCw,
  AlignJustify,
} from "lucide-react";
import { callApi, callApiForm } from "@/global/func";
import FileUploader from "@/app/utils/fileUploder";
import PopUp from "@/app/utils/popup";
import { ShowFileInPopUp } from "@/app/utils/showFile";

// const currentUserRole = "user"; // or 'doctor'
// API functions
const fetchPrescriptions = async (_id) => {
  const response = await callApi(`/problems/${_id}/getAllPrescriptions`, "GET");

  if (response.error) {
    throw new Error(response.message || "Failed to fetch prescriptions");
  }

  return response.data;
};

const createPrescription = async ({ _id, data }) => {
  const response = await callApiForm(
    `/problems/${_id}/addPrescriptions`,
    "POST",
    data,
  );

  if (response.error) {
    throw new Error(response.message || "Failed to create prescription");
  }

  return response.data;
};

const updatePrescription = async ({ p_id, id, data }) => {
  const response = await callApi(
    `/problems/${p_id}/prescriptions/${id}`,
    "PATCH",
    data,
  );

  if (response.error) {
    throw new Error(response.message || "Failed to update prescription");
  }

  return response.data;
};

// const deletePrescription = async (id) => {
//   const response = await callApi(`/prescriptions/${id}`, "DELETE");

//   if (response.error) {
//     throw new Error(response.message || "Failed to delete prescription");
//   }

//   return response.data;
// };

// Document Component
import { useEffect, useRef } from "react";

// MedicationItem Component for editing a medication in the form
const MedicationItem = ({
  medication,
  index,
  updateMedication,
  removeMedication,
  isLast,
  canRemove,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Debounce search to avoid hitting API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      if (medication.name.trim().length >= 1) {
        fetchSuggestions(medication.name);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 400); // 400ms delay

    return () => clearTimeout(timer);
  }, [medication.name]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    setIsLoading(true);
    try {
      // Using your specific endpoint format
      const res = await callApi(`/medicine/search/${query}`, "GET");
      if (!res.error && Array.isArray(res.data)) {
        setSuggestions(res.data);
        setShowDropdown(res.data.length > 0);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (selectedName) => {
    updateMedication(index, "name", selectedName);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="p-3 bg-gray-50 rounded-md border border-gray-200 mb-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-gray-700">Medication #{index + 1}</h4>
        {canRemove && (
          <button
            type="button"
            onClick={() => removeMedication(index)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Name Input with Autocomplete */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={medication.name}
              onChange={(e) => updateMedication(index, "name", e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
              placeholder="Start typing medicine name..."
              // required
            />
            {isLoading && (
              <Loader2 className="absolute right-2 top-2.5 h-4 w-4 text-blue-500 animate-spin" />
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showDropdown && (
            <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((item) => (
                <li
                  key={item._id}
                  onClick={() => handleSelect(item.name || item.genericName)}
                  className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer flex items-center gap-2 border-b last:border-none border-gray-50"
                >
                  <Pill className="h-3 w-3 text-blue-400" />
                  <span className="font-medium text-gray-800">
                    {item.name || item.genericName}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dosage
          </label>
          <input
            type="text"
            value={medication.dosage}
            onChange={(e) => updateMedication(index, "dosage", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., 10mg"
            // required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frequency
          </label>
          <input
            type="text"
            value={medication.frequency}
            onChange={(e) =>
              updateMedication(index, "frequency", e.target.value)
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., Once daily"
            // required
          />
        </div>
      </div>

      {isLast && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => updateMedication(index + 1, "add", "")}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-all"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Another Medication
          </button>
        </div>
      )}
    </div>
  );
};

import Link from "next/link";

const PrescriptionPopup = ({ prescription, onClose }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <PopUp isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {prescription.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Prescription description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Description
            </h3>
            <p className="text-gray-800">{prescription.description}</p>
          </div>

          {/* Attached documents */}
          {prescription.givenDoc && prescription.givenDoc.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Documents
              </h3>
              <div className="flex flex-wrap gap-2">
                {prescription.givenDoc.map((doc, index) => (
                  <ShowFileInPopUp key={index} docUrl={doc} />
                ))}
              </div>
            </div>
          )}

          {/* Medication details */}
          {prescription.medication && prescription.medication.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Medications
              </h3>
              <div className="space-y-3">
                {prescription.medication.map((med, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-5 w-5 text-blue-500" />
                      {/* 
                          Updated Section: 
                          Navigates to the medicine detail page based on name 
                      */}
                      <Link
                        href={`/medicines/${encodeURIComponent(med.name)}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-all"
                        title={`View details for ${med.name}`}
                      >
                        {med.name}
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <span>Dosage: {med.dosage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Frequency: {med.frequency}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional info */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Added by:</span>{" "}
                  {prescription.by !== "-" ? prescription.by : "You"}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Added on:</span>{" "}
                  {formatDate(prescription.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Last updated:</span>{" "}
                  {formatDate(prescription.updatedAt)}
                </p>
                {prescription.doctorAdded && (
                  <p className="flex items-center mt-1">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                      Doctor Prescribed
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PopUp>
  );
};
// const PrescriptionPopup = ({ prescription, onClose }) => {
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     }).format(date);
//   };

//   return (
//     <PopUp isOpen={true} onClose={onClose}>
//       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
//         <div className="flex justify-between items-center border-b border-gray-200 p-4">
//           <h2 className="text-xl font-semibold text-gray-900">
//             {prescription.title}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <div className="p-6">
//           {/* Prescription description */}
//           <div className="mb-6">
//             <h3 className="text-sm font-medium text-gray-500 mb-1">
//               Description
//             </h3>
//             <p className="text-gray-800">{prescription.description}</p>
//           </div>

//           {/* Attached documents */}
//           {prescription.givenDoc && prescription.givenDoc.length > 0 && (
//             <div className="mb-6">
//               <h3 className="text-sm font-medium text-gray-500 mb-2">
//                 Documents
//               </h3>

//               <div className="flex flex-wrap gap-2">
//                 {prescription.givenDoc.map((doc, index) => (
//                   <ShowFileInPopUp key={index} docUrl={doc} />
//                 ))}
//                 {/* {prescription.givenDoc.map((doc, index) => (
//                   <div key={index} className="bg-gray-100 rounded-md px-3 py-2 text-sm">
//                     Document {index + 1}
//                   </div>
//                 ))} */}
//               </div>
//             </div>
//           )}

//           {/* Medication details */}
//           {prescription.medication && prescription.medication.length > 0 && (
//             <div className="mb-6">
//               <h3 className="text-sm font-medium text-gray-500 mb-2">
//                 Medications
//               </h3>
//               <div className="space-y-3">
//                 {prescription.medication.map((med, index) => (
//                   <div
//                     key={index}
//                     className="bg-white p-4 rounded-lg border border-gray-200"
//                   >
//                     <div className="flex items-center gap-2 mb-2">
//                       <Pill className="h-5 w-5 text-blue-500" />
//                       <span className="font-medium text-gray-900">
//                         {med.name}
//                       </span>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
//                       <div className="flex items-center gap-2">
//                         <Activity className="h-4 w-4 text-gray-400" />
//                         <span>Dosage: {med.dosage}</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Clock className="h-4 w-4 text-gray-400" />
//                         <span>Frequency: {med.frequency}</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Additional info */}
//           <div className="border-t border-gray-200 pt-4 mt-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <p className="text-sm text-gray-500">
//                   <span className="font-medium">Added by:</span>{" "}
//                   {prescription.by !== "-" ? prescription.by : "You"}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   <span className="font-medium">Added on:</span>{" "}
//                   {formatDate(prescription.createdAt)}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">
//                   <span className="font-medium">Last updated:</span>{" "}
//                   {formatDate(prescription.updatedAt)}
//                 </p>
//                 {prescription.doctorAdded && (
//                   <p className="flex items-center mt-1">
//                     <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-300">
//                       Doctor Prescribed
//                     </span>
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </PopUp>
//   );
// };

// Main component for Prescription Table List
const PrescriptionTableList = ({
  prescriptions,
  // onEdit,
  // onDelete,
  // currentUserRole,
}) => {
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Check if user can edit a prescription
  // const canEdit = (prescription) => {
  //   // If prescription was added by a doctor, only a doctor can edit it
  //   if (prescription.doctorAdded) {
  //     return currentUserRole === "doctor";
  //   }
  //   // If prescription was added by the user themselves, they can edit it
  //   return true;
  // };

  // Sort prescriptions by creation date (newest first)
  const sortedPrescriptions = [...prescriptions].sort(
    (a, b) =>
      new Date(b.createdAt as string).getTime() -
      new Date(a.createdAt as string).getTime(),
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Table Header */}
      <div className="grid grid-cols-12 bg-gray-50 p-3 border-b border-gray-200 font-medium text-gray-600 text-sm">
        <div className="col-span-4">Prescription</div>
        <div className="col-span-2">Added On</div>
        <div className="col-span-3">Added By</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {sortedPrescriptions.map((prescription) => (
          <div
            key={prescription._id}
            className="grid grid-cols-12 p-3 hover:bg-gray-50 items-center text-sm"
          >
            <div className="col-span-4">
              <button
                className="font-medium text-blue-600 hover:text-blue-800 text-left"
                onClick={() => setSelectedPrescription(prescription)}
              >
                {prescription.title}
              </button>
              <p className="text-gray-500 text-xs line-clamp-1">
                {prescription.description}
              </p>
            </div>
            <div className="col-span-2 text-gray-600">
              {formatDate(prescription.createdAt)}
            </div>
            <div className="col-span-3 text-gray-600">
              {prescription.by !== "-" ? prescription.by : "You"}
            </div>
            <div className="col-span-2">
              {prescription.doctorAdded ? (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                  Doctor Prescribed
                </span>
              ) : (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-300">
                  Self Added
                </span>
              )}
            </div>
            <div className="col-span-1 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedPrescription(prescription)}
                className="text-gray-500 hover:text-gray-700"
                title="View Details"
              >
                <AlignJustify className="h-4 w-4" />
              </button>

              {/* {canEdit(prescription) && (
                <button
                  onClick={() => onEdit(prescription)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit Prescription"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}

              {!prescription.doctorAdded && (
                <button
                  onClick={() => onDelete(prescription._id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete Prescription"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )} */}
            </div>
          </div>
        ))}
      </div>

      {/* Popup for displaying prescription details */}
      {selectedPrescription && (
        <PrescriptionPopup
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}
    </div>
  );
};

// Prescription Form Component
const PrescriptionForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting,
  // currentUserRole,
}) => {
  // const currentUserRole1 = currentUserRole || "user"; // or 'doctor'
  const defaultMedication = { name: "", dosage: "", frequency: "" };

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [medications, setMedications] = useState(
    initialData?.medication?.length > 0
      ? [...initialData.medication]
      : [{ ...defaultMedication }],
  );
  const [files, setFiles] = useState([]);

  // Handle medication updates
  const handleMedicationUpdate = (index, field, value) => {
    if (field === "add") {
      setMedications([...medications, { ...defaultMedication }]);
      return;
    }

    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };
    setMedications(updatedMedications);
  };

  // Handle medication removal
  const handleRemoveMedication = (index) => {
    if (medications.length <= 1) return; // Always keep at least one medication field

    const updatedMedications = [...medications];
    updatedMedications.splice(index, 1);
    setMedications(updatedMedications);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Create form data for file uploads
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    // Add existing files if editing
    if (initialData?.givenDoc) {
      initialData.givenDoc.forEach((doc) => {
        formData.append("existingDocs", doc);
      });
    }

    // Add new files
    files.forEach((file) => {
      formData.append("givenDoc", file);
    });

    // Add medications
    formData.append(
      "medication",
      JSON.stringify(medications.filter((med) => med.name.trim() !== "")),
    );

    // Add additional fields
    // formData.append("doctorAdded", currentUserRole === "doctor");

    onSubmit(formData, initialData?._id);
  };

  const handleFileUpload = (uploadedFiles) => {
    if (uploadedFiles.length > 5) {
      alert("You can only upload up to 5 files");
      return;
    }
    setFiles(uploadedFiles);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-lg">
          {initialData ? "Edit Prescription" : "Add New Prescription"}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="mb-4">
          <FileUploader
            handleUpload={handleFileUpload}
            fileLimit={5}
            initialFiles={initialData?.givenDoc}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Prescription title"
            required
            maxLength={300}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Describe the prescription..."
            rows={3}
            required
          />
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Medications
          </h4>
          <div className="space-y-3">
            {medications.map((med, index) => (
              <MedicationItem
                key={index}
                medication={med}
                index={index}
                updateMedication={handleMedicationUpdate}
                removeMedication={handleRemoveMedication}
                isLast={index === medications.length - 1}
                canRemove={medications.length > 1}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-70 flex items-center"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {initialData ? "Update Prescription" : "Add Prescription"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Main Component
export default function PrescriptionsManagement({ params }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const problem_id = use(params).problem_id;
  // const problem_id = params?.problem_id;

  // Current user role - would typically come from auth context
  // This is a placeholder, you would replace this with actual auth data

  const queryClient = useQueryClient();

  // Fetch all prescriptions
  const {
    data: prescriptions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["prescriptions", problem_id], // include _id in key for caching
    queryFn: () => fetchPrescriptions(problem_id), // pass _id here
    enabled: !!problem_id, // optional safety to avoid calling with undefined
  });

  // Mutation for creating a prescription
  const createMutation = useMutation({
    mutationFn: createPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setShowAddForm(false);
    },
  });

  // Mutation for updating a prescription
  const updateMutation = useMutation({
    mutationFn: updatePrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setEditingPrescription(null);
    },
  });

  // Mutation for deleting a prescription
  // const deleteMutation = useMutation({
  //   mutationFn: deletePrescription,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
  //   },
  // });

  // Handle add/edit prescription submission
  const handleSubmit = (formData, id = null) => {
    if (id) {
      updateMutation.mutate({ p_id: problem_id, id, data: formData });
    } else {
      createMutation.mutate({ _id: problem_id, data: formData });
    }
  };

  // Handle edit button click
  // const handleEdit = (prescription) => {
  //   setEditingPrescription(prescription);
  //   setShowAddForm(false);
  // };

  // // Handle delete button click
  // const handleDelete = (id) => {
  //   if (window.confirm("Are you sure you want to delete this prescription?")) {
  //     deleteMutation.mutate(id);
  //   }
  // };

  // const handleFileUpload = (files) => {
  //   // Handle file upload logic here
  //   console.log("Files uploaded:", files);
  // };

  // Filter prescriptions by search term
  const filteredPrescriptions = (
    Array.isArray(prescriptions) ? prescriptions : []
  ).filter((prescription) => {
    return (
      prescription.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-lg text-gray-700">
          Loading prescriptions...
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
          <p className="text-lg font-medium">Error loading prescriptions</p>
          <p className="text-sm">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        My Prescriptions
      </h1>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
        <div className="relative max-w-md flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search prescriptions..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingPrescription(null);
          }}
          className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {showAddForm ? (
            <>
              <X className="h-5 w-5 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 mr-1" />
              Add Prescription
            </>
          )}
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingPrescription) && (
        <div className="mb-6">
          <PrescriptionForm
            initialData={editingPrescription}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowAddForm(false);
              setEditingPrescription(null);
            }}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            // currentUserRole={currentUserRole}
          />
        </div>
      )}

      {/* No prescriptions state */}
      {filteredPrescriptions.length === 0 &&
        !showAddForm &&
        !editingPrescription && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">
              No prescriptions found
            </h3>
            <p className="text-gray-500 mt-1">
              {searchTerm
                ? "Try adjusting your search term"
                : "You don't have any prescriptions yet"}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Prescription
            </button>
          </div>
        )}

      <PrescriptionTableList
        prescriptions={filteredPrescriptions}
        // onEdit={handleEdit}
        // onDelete={handleDelete}
        // currentUserRole={currentUserRole}
      />
      {/* Prescriptions list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* {filteredPrescriptions.map((prescription) => (
          <PrescriptionCard
            key={prescription._id}
            prescription={prescription}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentUserRole={currentUserRole}
          />
        ))} */}
      </div>

      {/* Results count */}
      {filteredPrescriptions.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {filteredPrescriptions.length} of{" "}
          {Array.isArray(prescriptions) ? prescriptions.length : 0}{" "}
          prescriptions
        </div>
      )}
    </div>
  );
}

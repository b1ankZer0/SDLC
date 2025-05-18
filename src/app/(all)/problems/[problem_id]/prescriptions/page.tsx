"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  // Calendar,
  // ChevronDown,
  // ChevronUp,
  // Edit,
  // Save,
  X,
  Plus,
  Trash2,
  Pill,
  Clock,
  Activity,
  FileIcon,
  PlusCircle,
  // MinusCircle,
  Loader2,
  AlertCircle,
  Search,
  // Filter,
  RefreshCw,
  // User,
  File,
  AlignJustify,
} from "lucide-react";
import { callApi, callApiForm } from "@/global/func";
import FileUploader from "@/app/utils/fileUploder";

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
    data
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
    data
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
const DocumentViewer = ({ docUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getFileExtension = (url) => {
    return url.split(".").pop().toLowerCase();
  };

  const isImage = (url) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    return imageExtensions.includes(getFileExtension(url));
  };

  const isPdf = (url) => {
    return getFileExtension(url) === "pdf";
  };

  const getFileName = (url) => {
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  return (
    <>
      <div
        className="relative w-24 h-24 border border-gray-200 rounded-md overflow-hidden bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity flex flex-col items-center justify-center"
        onClick={() => setIsModalOpen(true)}
      >
        {isImage(docUrl) ? (
          <img
            src={docUrl}
            alt="Document preview"
            className="w-full h-full object-cover"
          />
        ) : isPdf(docUrl) ? (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <FileText className="h-8 w-8 text-red-500" />
            <span className="text-xs mt-1 text-gray-500">PDF</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <File className="h-8 w-8 text-blue-500" />
            <span className="text-xs mt-1 text-gray-500">
              {getFileExtension(docUrl).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full flex flex-col w-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-lg">{getFileName(docUrl)}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[300px]">
              {isImage(docUrl) ? (
                <img
                  src={docUrl}
                  alt="Document preview"
                  className="max-w-full max-h-full object-contain"
                />
              ) : isPdf(docUrl) ? (
                <iframe
                  src={`${docUrl}#view=FitH`}
                  title="PDF document"
                  className="w-full h-full min-h-[500px]"
                ></iframe>
              ) : (
                <div className="text-center">
                  <FileIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <p>This file type cannot be previewed.</p>
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// MedicationItem Component for editing a medication in the form
const MedicationItem = ({
  medication,
  index,
  updateMedication,
  removeMedication,
  isLast,
  canRemove,
}) => {
  return (
    <div className="p-3 bg-gray-50 rounded-md border border-gray-200 mb-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Medication #{index + 1}</h4>
        {canRemove && (
          <button
            type="button"
            onClick={() => removeMedication(index)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={medication.name}
            onChange={(e) => updateMedication(index, "name", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Medication name"
            required
          />
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
            required
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
            required
          />
        </div>
      </div>

      {isLast && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => updateMedication(index + 1, "add", "")}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Another Medication
          </button>
        </div>
      )}
    </div>
  );
};

// Prescription Card Component
// const PrescriptionCard = ({
//   prescription,
//   // onEdit,
//   // onDelete,
//   // currentUserRole,
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     }).format(date);
//   };

//   // Check if user can edit this prescription
//   // const canEdit = () => {
//   //   // If prescription was added by a doctor, only a doctor can edit it
//   //   if (prescription.doctorAdded) {
//   //     return currentUserRole === "doctor";
//   //   }

//   //   // If prescription was added by the user themselves, they can edit it
//   //   return true;
//   // };

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
//       <div className="p-4">
//         <div className="flex justify-between items-center mb-3">
//           <h3 className="font-medium text-gray-900">{prescription.title}</h3>
//           {prescription.doctorAdded && (
//             <span className="px-2 py-1 text-xs font-medium rounded-full border bg-blue-100 text-blue-800 border-blue-300">
//               Doctor Prescribed
//             </span>
//           )}
//         </div>

//         <div className="flex items-center text-sm text-gray-500 mb-2">
//           <Calendar className="h-4 w-4 mr-1" />
//           <span>Added: {formatDate(prescription.createdAt)}</span>
//         </div>

//         <p className="text-sm text-gray-600 mb-3 line-clamp-2">
//           {prescription.description}
//         </p>

//         <div className="flex justify-between items-center">
//           <button
//             onClick={() => setIsExpanded(!isExpanded)}
//             className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
//           >
//             {isExpanded ? (
//               <>
//                 <ChevronUp className="h-4 w-4 mr-1" />
//                 Show Less
//               </>
//             ) : (
//               <>
//                 <ChevronDown className="h-4 w-4 mr-1" />
//                 Show More
//               </>
//             )}
//           </button>

//           {/* <div className="flex space-x-2">
//             {canEdit() && (
//               <button
//                 onClick={() => onEdit(prescription)}
//                 className="flex items-center text-blue-600 hover:text-blue-800"
//               >
//                 <Edit className="h-4 w-4" />
//               </button>
//             )}

//             {!prescription.doctorAdded && (
//               <button
//                 onClick={() => onDelete(prescription._id)}
//                 className="flex items-center text-red-600 hover:text-red-800"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </button>
//             )}
//           </div> */}
//         </div>
//       </div>

//       {isExpanded && (
//         <div className="border-t border-gray-200 p-4 bg-gray-50">
//           {/* Attached documents */}
//           {prescription.givenDoc && prescription.givenDoc.length > 0 && (
//             <div className="mb-4">
//               <h4 className="text-sm font-medium text-gray-700 mb-2">
//                 Documents:
//               </h4>
//               <div className="flex flex-wrap gap-2">
//                 {prescription.givenDoc.map((doc, index) => (
//                   <DocumentViewer key={index} docUrl={doc} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Medication details */}
//           {prescription.medication && prescription.medication.length > 0 && (
//             <div>
//               <h4 className="text-sm font-medium text-gray-700 mb-2">
//                 Medications:
//               </h4>
//               <div className="space-y-2">
//                 {prescription.medication.map((med, index) => (
//                   <div
//                     key={index}
//                     className="bg-white p-3 rounded-lg border border-gray-200"
//                   >
//                     <div className="flex items-center gap-1 mb-1">
//                       <Pill className="h-4 w-4 text-blue-500" />
//                       <span className="font-medium">{med.name}</span>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
//                       <div className="flex items-center gap-1">
//                         <Activity className="h-4 w-4 text-gray-400" />
//                         <span>Dosage: {med.dosage}</span>
//                       </div>
//                       <div className="flex items-center gap-1">
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
//           <div className="mt-4 pt-3 border-t border-gray-200">
//             <div className="flex items-center text-sm text-gray-500 mb-1">
//               <span className="font-medium mr-1">Added by:</span>
//               <span>{prescription.by !== "-" ? prescription.by : "You"}</span>
//             </div>
//             <div className="flex items-center text-sm text-gray-500">
//               <span className="font-medium mr-1">Last updated:</span>
//               <span>{formatDate(prescription.updatedAt)}</span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {prescription.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
                  <DocumentViewer key={index} docUrl={doc} />
                ))}
                {/* {prescription.givenDoc.map((doc, index) => (
                  <div key={index} className="bg-gray-100 rounded-md px-3 py-2 text-sm">
                    Document {index + 1}
                  </div>
                ))} */}
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
                    className="bg-white p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-gray-900">
                        {med.name}
                      </span>
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
    </div>
  );
};

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
      new Date(a.createdAt as string).getTime()
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
    initialData?.description || ""
  );
  const [medications, setMedications] = useState(
    initialData?.medication?.length > 0
      ? [...initialData.medication]
      : [{ ...defaultMedication }]
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
      JSON.stringify(medications.filter((med) => med.name.trim() !== ""))
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
  const problem_id = params?.problem_id;

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

// const PrescriptionFilters = ({ onFilterChange }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [filters, setFilters] = useState({
//     dateRange: "all",
//     source: "all",
//     hasDocuments: false,
//   });

//   const handleFilterChange = (key, value) => {
//     const newFilters = { ...filters, [key]: value };
//     setFilters(newFilters);
//     onFilterChange(newFilters);
//   };

//   return (
//     <div className="relative mb-4">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
//       >
//         <Filter className="h-4 w-4 mr-1" />
//         Filters
//         <ChevronDown
//           className={`h-4 w-4 ml-1 transition-transform ${
//             isOpen ? "rotate-180" : ""
//           }`}
//         />
//       </button>

//       {isOpen && (
//         <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 p-4 z-10">
//           <h4 className="text-sm font-medium text-gray-700 mb-3">
//             Filter Prescriptions
//           </h4>

//           <div className="mb-3">
//             <label className="block text-xs font-medium text-gray-700 mb-1">
//               Date Range
//             </label>
//             <select
//               value={filters.dateRange}
//               onChange={(e) => handleFilterChange("dateRange", e.target.value)}
//               className="w-full text-sm border border-gray-300 rounded-md p-1"
//             >
//               <option value="all">All Time</option>
//               <option value="week">Past Week</option>
//               <option value="month">Past Month</option>
//               <option value="year">Past Year</option>
//             </select>
//           </div>

//           <div className="mb-3">
//             <label className="block text-xs font-medium text-gray-700 mb-1">
//               Source
//             </label>
//             <select
//               value={filters.source}
//               onChange={(e) => handleFilterChange("source", e.target.value)}
//               className="w-full text-sm border border-gray-300 rounded-md p-1"
//             >
//               <option value="all">All Sources</option>
//               <option value="doctor">Doctor Prescribed</option>
//               <option value="self">Self Added</option>
//             </select>
//           </div>

//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               id="hasDocuments"
//               checked={filters.hasDocuments}
//               onChange={(e) =>
//                 handleFilterChange("hasDocuments", e.target.checked)
//               }
//               className="h-4 w-4 text-blue-600 border-gray-300 rounded"
//             />
//             <label
//               htmlFor="hasDocuments"
//               className="ml-2 text-xs text-gray-700"
//             >
//               Has attached documents
//             </label>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const PrintablePrescription = ({ prescription, onClose }) => {
//   const componentRef = React.useRef();

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     }).format(date);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-auto">
//         <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//           <h3 className="font-medium text-lg">Print Prescription</h3>
//           <div className="flex space-x-2">
//             <button
//               onClick={() => window.print()}
//               className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Print
//             </button>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-500"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         <div ref={componentRef} className="p-8 print:p-0">
//           <div className="mb-8 text-center border-b pb-4 print:border-b-2">
//             <h1 className="text-2xl font-bold">Medical Prescription</h1>
//             <p className="text-gray-500">
//               Reference #: {prescription._id.substring(0, 8)}
//             </p>
//           </div>

//           <div className="mb-6">
//             <h2 className="text-xl font-bold mb-2">{prescription.title}</h2>
//             <p className="text-gray-700">{prescription.description}</p>
//           </div>

//           <div className="mb-6">
//             <h3 className="text-lg font-semibold mb-2 border-b print:border-b">
//               Medications
//             </h3>
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="border-b">
//                   <th className="py-2 text-left">Medication</th>
//                   <th className="py-2 text-left">Dosage</th>
//                   <th className="py-2 text-left">Frequency</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {prescription.medication.map((med, index) => (
//                   <tr key={index} className="border-b">
//                     <td className="py-2">{med.name}</td>
//                     <td className="py-2">{med.dosage}</td>
//                     <td className="py-2">{med.frequency}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="mb-6">
//             <div className="flex justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">
//                   <span className="font-medium">Prescribed By:</span>{" "}
//                   {prescription.by !== "-" ? prescription.by : "Self-added"}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">
//                   <span className="font-medium">Date:</span>{" "}
//                   {formatDate(prescription.createdAt)}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="mt-12 text-center text-sm text-gray-500 print:mt-24">
//             <p>This is a digital copy of your prescription.</p>
//             <p>
//               For medical emergencies, please contact your healthcare provider
//               immediately.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const MedicationReminders = ({ medications }) => {
//   const [reminders, setReminders] = useState([]);

//   useEffect(() => {
//     // Load saved reminders from localStorage
//     const savedReminders = localStorage.getItem("medicationReminders");
//     if (savedReminders) {
//       setReminders(JSON.parse(savedReminders));
//     }
//   }, []);

//   const toggleReminder = (medicationName) => {
//     let updatedReminders;

//     if (reminders.includes(medicationName)) {
//       updatedReminders = reminders.filter((name) => name !== medicationName);
//     } else {
//       updatedReminders = [...reminders, medicationName];
//     }

//     setReminders(updatedReminders);
//     localStorage.setItem(
//       "medicationReminders",
//       JSON.stringify(updatedReminders)
//     );

//     if (!reminders.includes(medicationName)) {
//       // Request notification permission if adding a reminder
//       if (Notification.permission !== "granted") {
//         Notification.requestPermission();
//       }
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
//       <h3 className="font-medium text-gray-900 mb-3 flex items-center">
//         <Clock className="h-5 w-5 mr-1 text-blue-500" />
//         Medication Reminders
//       </h3>

//       {medications.length === 0 ? (
//         <p className="text-sm text-gray-500">
//           No medications available to set reminders.
//         </p>
//       ) : (
//         <div className="space-y-2">
//           {medications.map((med, index) => (
//             <div
//               key={index}
//               className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
//             >
//               <div>
//                 <p className="font-medium">{med.name}</p>
//                 <p className="text-sm text-gray-500">{med.frequency}</p>
//               </div>
//               <button
//                 onClick={() => toggleReminder(med.name)}
//                 className={`px-3 py-1 text-xs font-medium rounded-full ${
//                   reminders.includes(med.name)
//                     ? "bg-blue-100 text-blue-800 border border-blue-300"
//                     : "bg-gray-100 text-gray-800 border border-gray-300"
//                 }`}
//               >
//                 {reminders.includes(med.name) ? "Reminder On" : "Set Reminder"}
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const PrescriptionStats = ({ prescriptions }) => {
//   // Calculate statistics
//   const doctorPrescribed = prescriptions.filter((p) => p.doctorAdded).length;
//   const selfAdded = prescriptions.length - doctorPrescribed;
//   const totalMedications = prescriptions.reduce(
//     (total, p) => total + (p.medication ? p.medication.length : 0),
//     0
//   );

//   const mostCommonMedication = React.useMemo(() => {
//     const medCount = {};
//     prescriptions.forEach((p) => {
//       if (p.medication) {
//         p.medication.forEach((med) => {
//           medCount[med.name] = (medCount[med.name] || 0) + 1;
//         });
//       }
//     });

//     let maxMed = "";
//     let maxCount = 0;

//     for (const [med, count] of Object.entries(medCount)) {
//       if (count > maxCount) {
//         maxMed = med;
//         maxCount = count;
//       }
//     }

//     return { name: maxMed, count: maxCount };
//   }, [prescriptions]);

//   return (
//     <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
//       <h3 className="font-medium text-gray-900 mb-3">Prescription Overview</h3>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
//           <p className="text-lg font-semibold text-blue-700">
//             {prescriptions.length}
//           </p>
//           <p className="text-xs text-gray-600">Total Prescriptions</p>
//         </div>

//         <div className="bg-green-50 p-3 rounded-md border border-green-100">
//           <p className="text-lg font-semibold text-green-700">
//             {doctorPrescribed}
//           </p>
//           <p className="text-xs text-gray-600">Doctor Prescribed</p>
//         </div>

//         <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
//           <p className="text-lg font-semibold text-purple-700">{selfAdded}</p>
//           <p className="text-xs text-gray-600">Self Added</p>
//         </div>

//         <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
//           <p className="text-lg font-semibold text-yellow-700">
//             {totalMedications}
//           </p>
//           <p className="text-xs text-gray-600">Total Medications</p>
//         </div>
//       </div>

//       {mostCommonMedication.name && (
//         <div className="mt-4 p-3 bg-gray-50 rounded-md">
//           <p className="text-sm">
//             <span className="font-medium">Most common medication:</span>{" "}
//             {mostCommonMedication.name} (used in {mostCommonMedication.count}{" "}
//             prescriptions)
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// const ExportPrescriptions = ({ prescriptions }) => {
//   const [exportFormat, setExportFormat] = useState("json");
//   const [isExporting, setIsExporting] = useState(false);

//   const handleExport = () => {
//     setIsExporting(true);

//     try {
//       let dataStr;
//       let filename;

//       if (exportFormat === "json") {
//         dataStr = JSON.stringify(prescriptions, null, 2);
//         filename = "prescriptions.json";
//       } else if (exportFormat === "csv") {
//         // Simple CSV export for prescriptions
//         const headers = [
//           "Title",
//           "Description",
//           "Created Date",
//           "Doctor Prescribed",
//           "Medications",
//         ];
//         const rows = prescriptions.map((p) => [
//           p.title,
//           p.description,
//           new Date(p.createdAt).toLocaleDateString(),
//           p.doctorAdded ? "Yes" : "No",
//           p.medication
//             ? p.medication.map((m) => `${m.name} (${m.dosage})`).join("; ")
//             : "",
//         ]);

//         dataStr = [
//           headers.join(","),
//           ...rows.map((r) =>
//             r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
//           ),
//         ].join("\n");

//         filename = "prescriptions.csv";
//       }

//       const blob = new Blob([dataStr], { type: "text/plain" });
//       const url = URL.createObjectURL(blob);

//       const link = document.createElement("a");
//       link.download = filename;
//       link.href = url;
//       link.click();

//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Error exporting data:", error);
//       alert("Error exporting data. Please try again.");
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   return (
//     <div className="flex items-center space-x-2">
//       <select
//         value={exportFormat}
//         onChange={(e) => setExportFormat(e.target.value)}
//         className="text-sm border border-gray-300 rounded-md p-1"
//       >
//         <option value="json">JSON</option>
//         <option value="csv">CSV</option>
//       </select>

//       <button
//         onClick={handleExport}
//         disabled={isExporting || prescriptions.length === 0}
//         className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
//       >
//         {isExporting ? (
//           <Loader2 className="h-4 w-4 mr-1 animate-spin" />
//         ) : (
//           <FileText className="h-4 w-4 mr-1" />
//         )}
//         Export
//       </button>
//     </div>
//   );
// };

"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileX,
  Search,
  AlertCircle,
  Loader2,
  FileText,
  Calendar,
  Plus,
  X,
  FileIcon,
  ExternalLink,
  File,
} from "lucide-react";
import { callApi, callApiForm } from "@/global/func";
import FileUploader from "@/app/utils/fileUploder";
import { useRouter } from "next/navigation";
import PopUp from "@/app/utils/popup";

// Mock API calls (replace with your actual implementations)
const fetchProblems = async () => {
  // This would be replaced with your actual API call
  const response = await callApi("/problems/allProblems", "GET");
  if (response.error) {
    throw new Error(response.message || "Failed to fetch problems");
  }
  return response.data;
};

const createProblem = async (problemData) => {
  const response = await callApiForm(
    "/problems/addProblems",
    "POST",
    problemData
  );

  if (response.error) {
    throw new Error(response.message || "Failed to create problem");
  }
  return response.data;
};

const DocumentThumbnail = ({ docUrl }) => {
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
        <PopUp isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
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
        </PopUp>
      )}
    </>
  );
};

export default function ProblemsDisplay() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    givenDoc: [],
  });
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: problems,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["problems"],
    queryFn: fetchProblems,
  });

  const createMutation = useMutation({
    mutationFn: createProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      resetForm();
    },
  });

  const filteredProblems = (Array.isArray(problems) ? problems : []).filter(
    (problem) =>
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (files) => {
    // Update only the givenDoc part of formData
    setFormData((prev) => ({ ...prev, givenDoc: files }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      givenDoc: [],
    });
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create a FormData object to properly handle file uploads
      const formDataToSubmit = new FormData();

      // Add text fields
      formDataToSubmit.append("title", formData.title);
      formDataToSubmit.append("description", formData.description);

      // Add files
      if (formData.givenDoc && formData.givenDoc.length > 0) {
        formData.givenDoc.forEach((file) => {
          formDataToSubmit.append(`givenDoc`, file);
        });
      }

      // Submit using the mutation
      await createMutation.mutateAsync(formDataToSubmit);
    } catch (error) {
      console.error("Error creating problem:", error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FileX className="text-red-500 mr-2" size={28} />
          <h1 className="text-2xl font-bold">Disease & Medical Problems</h1>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? (
            <X size={16} className="mr-1" />
          ) : (
            <Plus size={16} className="mr-1" />
          )}
          {showAddForm ? "Cancel" : "Add New Problem"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 p-4">
          <h2 className="text-lg font-semibold mb-4">
            Add New Disease/Problem
          </h2>
          <form onSubmit={handleSubmit}>
            <FileUploader handleUpload={handleFileChange} fileLimit={3} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength={300}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter disease title"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the disease or medical problem"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Problem"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search by disease name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading problems...</span>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="ml-3 text-red-700">
              Error loading problems. Please try again later.
            </p>
          </div>
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No disease records found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProblems.map((problem) => (
            <div
              key={problem._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between bg-blue-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <FileX className="text-red-500 mr-2" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {problem.title}
                  </h3>
                </div>
                <button
                  onClick={() =>
                    router.push(`/problems/${problem._id}/prescriptions`)
                  }
                  className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  <ExternalLink size={14} className="mr-1" />
                  Open
                </button>
              </div>
              <div className="p-4">
                {/* File thumbnail display - 100x100 */}
                {problem.givenDoc && problem.givenDoc.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {problem.givenDoc.map((doc, index) => (
                        <DocumentThumbnail key={index} docUrl={doc} />
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {problem.description}
                </p>
                <div className="flex flex-col space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      Added: {new Date(problem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

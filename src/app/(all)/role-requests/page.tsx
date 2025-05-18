"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Search,
  Calendar,
  User,
  FileText,
  X,
  FileIcon,
  File,
} from "lucide-react";
import { callApi } from "@/global/func";

const fetchAllRoleRequests = async () => {
  const response = await callApi("/user/getAllRoleReq", "GET");

  if (response.error) {
    throw new Error(response.message || "Failed to fetch role requests");
  }

  return response.data;
};

const updateRoleRequest = async ({ id, status, reason }) => {
  const response = await callApi(`/user//updateRoleReq/${id}`, "PATCH", {
    status,
    reason,
  });

  if (response.error) {
    throw new Error(response.message || "Failed to fetch role requests");
  }

  return response.data;
};

// Document Thumbnail Component
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

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusClasses = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusClasses()}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Role Request Card Component
const RoleRequestCard = ({ request, onUpdateStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [reason, setReason] = useState("");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <h3 className="font-medium text-gray-900">
              {request.ref?.name || "Unknown User"}
            </h3>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Requested: {formatDate(request.createdAt)}</span>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <FileText className="h-4 w-4 mr-1" />
          <span>
            Role:{" "}
            <span className="font-medium text-blue-600">{request.role}</span>
          </span>
        </div>

        {request.description && (
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium">Description:</span>{" "}
            {request.description}
          </p>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {request.givenDoc && request.givenDoc.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Documents:
              </h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {request.givenDoc.map((doc, index) => (
                  <DocumentThumbnail key={index} docUrl={doc} />
                ))}
              </div>
            </div>
          )}

          {request.status === "pending" ? (
            <>
              <div className="mb-3">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reason (optional)
                </label>
                <textarea
                  id="reason"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide a reason for your decision..."
                ></textarea>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    onUpdateStatus(request._id, "accepted", reason)
                  }
                  className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept
                </button>
                <button
                  onClick={() =>
                    onUpdateStatus(request._id, "rejected", reason)
                  }
                  className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </button>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-medium">Status:</span> {request.status}
              </p>
              {request.reason && (
                <p>
                  <span className="font-medium">Reason:</span> {request.reason}
                </p>
              )}
              {request.by && (
                <p>
                  <span className="font-medium">Processed by:</span>{" "}
                  {request.by}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Component
export default function RoleRequestsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const queryClient = useQueryClient();

  // Fetch all role requests
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["roleRequests"],
    queryFn: fetchAllRoleRequests,
  });

  // Mutation for updating a role request
  const updateMutation = useMutation({
    mutationFn: updateRoleRequest,
    onSuccess: () => {
      // Invalidate and refetch the role requests query
      queryClient.invalidateQueries({ queryKey: ["roleRequests"] });
    },
  });

  // Handler for updating role request status
  const handleUpdateStatus = (id, status, reason) => {
    updateMutation.mutate({
      id,
      status,
      reason,
    });
  };

  // Filter and search functionality
  const filteredRequests =
    data?.filter((request) => {
      const matchesStatus =
        filterStatus === "all" || request.status === filterStatus;
      const matchesSearch =
        searchTerm === "" ||
        (request.ref?.name &&
          request.ref.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.ref?.email &&
          request.ref.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.description &&
          request.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesStatus && matchesSearch;
    }) || [];

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-lg text-gray-700">
          Loading role requests...
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
          <p className="text-lg font-medium">Error loading role requests</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Role Request Management
      </h1>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email or description..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="md:w-48">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-lg font-medium text-gray-700">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900">
            {data?.length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-lg font-medium text-gray-700">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {data?.filter((req) => req.status === "pending").length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-lg font-medium text-gray-700">Processed</p>
          <p className="text-2xl font-bold text-green-600">
            {data?.filter(
              (req) => req.status === "accepted" || req.status === "rejected"
            ).length || 0}
          </p>
        </div>
      </div>

      {/* No results */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">
            No role requests found
          </h3>
          <p className="text-gray-500 mt-1">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filters"
              : "There are no role requests at the moment"}
          </p>
        </div>
      )}

      {/* Role requests list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map((request) => (
          <RoleRequestCard
            key={request._id}
            request={request}
            onUpdateStatus={handleUpdateStatus}
          />
        ))}
      </div>
    </div>
  );
}

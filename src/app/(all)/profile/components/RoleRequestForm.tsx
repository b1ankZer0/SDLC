"use client";

import FileUploader from "@/app/utils/fileUploder";
import { callApi, callApiForm } from "@/global/func";
import { useMutation } from "@tanstack/react-query";
import { useState, ChangeEvent } from "react";
import { toast } from "react-hot-toast";

export default function RoleRequestForm() {
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [validationError, setValidationError] = useState("");

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await callApiForm("/user/addRoleReq", "POST", formData);

      if (response.error) {
        throw new Error(response.message || "Request failed");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Role request submitted successfully!");
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!role || files.length === 0) {
      setValidationError("Role and at least one file are required");
      return;
    }

    const formData = new FormData();
    formData.append("role", role);
    formData.append("description", description);

    formData.append("givenDoc", files);
    // files.forEach((file) => {
    //   formData.append("givenDoc", file);
    // });

    mutate(formData);
  };

  const resetForm = () => {
    setRole("");
    setDescription("");
    setFiles([]);
    setValidationError("");
  };

  const handleUpload = (uploadedFiles: File[]) => {
    if (uploadedFiles.length > 5) {
      setValidationError("Maximum 5 files allowed");
      return;
    }
    setFiles(uploadedFiles);
    setValidationError("");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl text-gray-700 font-bold mb-4">
        Request Role Upgrade
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-500 mt-1">
          Upload relevant documents (PDF, JPG, PNG)
        </p>
        <FileUploader handleUpload={handleUpload} fileLimit={5} />
        <div>
          <label className="block text-sm font-medium mb-1">Select Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Choose a role</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
          />
        </div>

        {validationError && (
          <p className="text-red-500 text-sm">{validationError}</p>
        )}

        {isError && <p className="text-red-500 text-sm">{error.message}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isPending ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}

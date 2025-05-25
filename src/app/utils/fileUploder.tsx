"use client";
import { useState, useRef } from "react";

export default function FileUploader({
  fileLimit = 5,
  handleUpload,
  initialFiles = [],
}) {
  const [files, setFiles] = useState(initialFiles);
  const [viewFile, setViewFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Accepted file types
  const acceptedTypes = {
    img: "image/jpeg",
    png: "image/png",
    pdf: "application/pdf",
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    // Check if adding these files would exceed the limit
    if (files.length + selectedFiles.length > fileLimit) {
      setError(`You can only upload up to ${fileLimit} files`);
      return;
    }

    // Check file types
    const validFiles = selectedFiles.filter((file) =>
      Object.values(acceptedTypes).includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      setError("Only images (JPEG, PNG) and PDF files are allowed");
    } else {
      setError("");
    }

    // Create URL previews for the files
    const newFiles = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
    }));

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);

    // Call the parent handler with the updated files
    if (handleUpload) {
      handleUpload(updatedFiles.map((f) => f.file));
    }
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(updatedFiles[index].preview);

    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);

    // Call the parent handler with the updated files
    if (handleUpload) {
      handleUpload(updatedFiles.map((f) => f.file));
    }
  };

  const triggerFileInput = (type) => {
    if (files.length >= fileLimit) {
      setError(`You can only upload up to ${fileLimit} files`);
      return;
    }

    // Set accepted type for the file input
    fileInputRef.current.accept =
      type === "img"
        ? acceptedTypes.img
        : type === "png"
        ? acceptedTypes.png
        : type === "pdf"
        ? acceptedTypes.pdf
        : Object.values(acceptedTypes).join(",");

    fileInputRef.current.click();
  };

  const openFileViewer = (file) => {
    setViewFile(file);
  };

  const closeFileViewer = () => {
    setViewFile(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        multiple
      />

      {/* Error Message */}
      {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}

      {/* File Preview or Single Box with Plus Icon */}
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2 text-gray-800">
          Uploaded Files ({files.length}/{fileLimit})
        </h3>
        {files.length > 0 ? (
          <>
            {/* <h3 className="text-lg font-medium mb-2 text-gray-800">
              Uploaded Files ({files.length || 0}/{fileLimit})
            </h3> */}
            <div className="flex flex-wrap gap-4">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="relative border border-gray-700 rounded p-2 bg-gray-100"
                  style={{ width: "100px", height: "100px" }}
                >
                  <div
                    className="w-14 h-14 overflow-hidden flex items-center justify-center cursor-pointer mx-auto"
                    onClick={() => openFileViewer(file)}
                    style={{ width: "80px", height: "80px" }}
                  >
                    {file.type.startsWith("image/") ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-14 h-14 object-cover"
                        style={{ width: "auto", height: "auto" }}
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs text-gray-500">PDF</span>
                      </div>
                    )}
                  </div>
                  <button
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    onClick={() => removeFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Add new file box if limit not reached */}
              {files.length < fileLimit && (
                <div
                  onClick={() => triggerFileInput("all")}
                  className="border border-gray-700 rounded p-2 flex items-center justify-center cursor-pointer bg-gray-100 hover:border-blue-500 transition-colors"
                  style={{ width: "100px", height: "100px" }}
                >
                  <span className="text-4xl text-gray-500 hover:text-blue-500">
                    +
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <div
              onClick={() => triggerFileInput("all")}
              className="border border-gray-700 rounded p-2 flex items-center justify-center cursor-pointer bg-gray-100 hover:border-blue-500 transition-colors"
              style={{ width: "100px", height: "100px" }}
            >
              <span className="text-xl text-gray-500 hover:text-blue-500">
                +
              </span>
            </div>
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {viewFile && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg text-gray-700 font-medium">
                {viewFile.name}
              </h3>
              <button
                onClick={closeFileViewer}
                className="bg-gray-300 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-300"
              >
                ×
              </button>
            </div>
            <div className="flex items-center justify-center min-h-64">
              {viewFile.type.startsWith("image/") ? (
                <img
                  src={viewFile.preview}
                  alt={viewFile.name}
                  className="max-w-full max-h-96 object-contain"
                />
              ) : (
                <iframe
                  src={viewFile.preview}
                  className="w-full h-96"
                  title={viewFile.name}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

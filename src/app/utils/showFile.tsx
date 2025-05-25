import { useState } from "react";
import PopUp from "./popup";
import { File, FileIcon, FileText, X } from "lucide-react";

export const ShowFileInPopUp = ({ docUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getFileExtension = (url) => {
    return url.split(";")[0].split("/")[1].toLowerCase();
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

import { useEffect, useState } from "react";
import { isAudioFile, isVideoFile } from "../TaskNotesModal";
import { Download, Maximize2, Minimize2, X, FileText } from "lucide-react";

interface MediaPreviewModalProps {
  mediaUrl: string;
  fileName?: string;
  fileType?: string;
  isOpen: boolean;
  onClose: () => void;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  mediaUrl,
  fileName,
  fileType,
  isOpen,
  onClose,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const mime = (fileType || "").toLowerCase();
  const extension = fileName?.split(".").pop()?.toLowerCase();

  const videoExtensions = ["mp4", "mov", "webm", "mkv", "avi"];
  const audioExtensions = [
    "mp3",
    "wav",
    "aac",
    "m4a",
    "ogg",
    "oga",
    "flac",
    "opus",
  ];

  // Office / text docs
  const docExtensions = [
    "doc",
    "docx",
    "ppt",
    "pptx",
    "xls",
    "xlsx",
    "csv",
    "txt",
    "rtf",
    "odt",
  ];

  const isVideo =
    isVideoFile(fileType) ||
    (!!extension && videoExtensions.includes(extension));

  const isAudio =
    isAudioFile(fileType) ||
    (!!extension && audioExtensions.includes(extension));

  const isPdf = mime === "application/pdf" || extension === "pdf";

  const isOfficeDoc =
    (!!extension && docExtensions.includes(extension)) ||
    mime.includes("word") ||
    mime.includes("excel") ||
    mime.includes("powerpoint") ||
    mime.includes("officedocument");

  // "Document" branch: pdf OR office/text docs
  const isDocument = isPdf || isOfficeDoc;

  const safeFileName =
    fileName || mediaUrl.split("/").pop()?.split("?")[0] || "file";

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Toggle zoom for images only
      if (
        !isVideo &&
        !isAudio &&
        !isDocument &&
        (e.key === " " || e.key === "f")
      ) {
        e.preventDefault();
        setIsZoomed((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, onClose, isVideo, isAudio, isDocument]);

  useEffect(() => {
    if (isOpen) {
      setIsZoomed(false);
    }
  }, [isOpen, mediaUrl]);

  if (!isOpen) return null;

  // For non-PDF docs (like .docx) we can try Google Docs Viewer
  const googleDocsViewerUrl =
    !isPdf && isOfficeDoc
      ? `https://docs.google.com/gview?url=${encodeURIComponent(
          mediaUrl
        )}&embedded=true`
      : null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-[60]"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl max-h-[95vh] w-full h-full flex flex-col rounded-xl overflow-hidden bg-gray-950/90 border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 bg-gray-900/90 text-white border-b border-gray-800">
          <h3 className="text-sm md:text-lg font-semibold truncate flex-1 mr-3 md:mr-4">
            {safeFileName ||
              `${
                isVideo
                  ? "Video"
                  : isAudio
                  ? "Audio"
                  : isDocument
                  ? "Document"
                  : "Image"
              } Preview`}
          </h3>
          <div className="flex items-center gap-1 md:gap-2">
            {!isVideo && !isAudio && !isDocument && (
              <button
                onClick={() => setIsZoomed((prev) => !prev)}
                className="p-1.5 md:p-2 hover:bg-white/15 rounded-lg transition-colors"
                title={isZoomed ? "Fit to screen" : "Zoom to actual size"}
              >
                {isZoomed ? (
                  <Minimize2 className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 md:p-2 hover:bg-white/15 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-2 md:p-4 overflow-hidden bg-black">
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : isAudio ? (
            <div className="bg-gray-900/80 px-4 py-3 md:px-6 md:py-4 rounded-xl border border-gray-800 shadow-lg">
              <p className="text-xs md:text-sm text-gray-300 mb-2 truncate max-w-xs md:max-w-sm">
                {safeFileName}
              </p>
              <audio
                src={mediaUrl}
                controls
                autoPlay
                className="w-64 md:w-80 lg:w-96"
              />
            </div>
          ) : isDocument ? (
            <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800 flex flex-col">
              {isPdf ? (
                <iframe
                  src={mediaUrl}
                  title={safeFileName}
                  className="w-full h-full"
                />
              ) : googleDocsViewerUrl ? (
                <iframe
                  src={googleDocsViewerUrl}
                  title={safeFileName}
                  className="w-full h-full"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-200 gap-3 p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    <span className="text-sm md:text-base font-semibold">
                      {extension?.toUpperCase() || "Document"} file
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 max-w-sm text-center">
                    Preview is not available for this document type. Use the
                    button below to open it in a new tab.
                  </p>
                  <a
                    href={mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs md:text-sm font-medium"
                  >
                    Open document
                  </a>
                </div>
              )}
            </div>
          ) : (
            <img
              src={mediaUrl}
              alt={safeFileName || "Preview"}
              className={`max-w-full max-h-full ${
                isZoomed
                  ? "object-contain cursor-zoom-out"
                  : "object-contain md:max-h-[80vh] cursor-zoom-in"
              } transition-transform duration-200`}
              onClick={() => setIsZoomed((prev) => !prev)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 bg-gray-900/90 text-white border-t border-gray-800">
          <a
            href={mediaUrl}
            download={safeFileName}
            className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-xs md:text-sm font-medium"
          >
            <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>Download</span>
          </a>
          <button
            onClick={onClose}
            className="px-3 py-1.5 md:px-4 md:py-2 hover:bg-white/10 rounded-lg transition-colors text-xs md:text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaPreviewModal;

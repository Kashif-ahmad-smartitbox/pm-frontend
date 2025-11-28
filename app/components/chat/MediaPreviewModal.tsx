import { useEffect, useState } from "react";
import { isAudioFile, isVideoFile } from "../TaskNotesModal";
import { Download, Maximize2, Minimize2, X } from "lucide-react";

const MediaPreviewModal = ({
  mediaUrl,
  fileName,
  fileType,
  isOpen,
  onClose,
}: {
  mediaUrl: string;
  fileName?: string;
  fileType?: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const isVideo = isVideoFile(fileType);
  const isAudio = isAudioFile(fileType);

  useEffect(() => {
    if (isOpen) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === " " && !isVideo && !isAudio) {
          e.preventDefault();
          setIsZoomed(!isZoomed);
        }
      };
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [isOpen, isZoomed, onClose, isVideo, isAudio]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex flex-col">
        <div className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-t-xl">
          <h3 className="text-lg font-semibold truncate flex-1 mr-4">
            {fileName ||
              `${isVideo ? "Video" : isAudio ? "Audio" : "Image"} Preview`}
          </h3>
          <div className="flex items-center gap-2">
            {!isVideo && !isAudio && (
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={isZoomed ? "Fit to screen" : "Zoom to actual size"}
              >
                {isZoomed ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-black">
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-full object-contain"
            />
          ) : isAudio ? (
            <div className="bg-gray-800 p-8 rounded-xl">
              <audio
                src={mediaUrl}
                controls
                autoPlay
                className="w-80 md:w-96"
              />
            </div>
          ) : (
            <img
              src={mediaUrl}
              alt={fileName || "Preview"}
              className={`${
                isZoomed
                  ? "object-scale-down cursor-zoom-out"
                  : "object-contain cursor-zoom-in"
              } transition-all duration-200 max-w-full max-h-full`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-b-xl">
          <a
            href={mediaUrl}
            download={fileName}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaPreviewModal;

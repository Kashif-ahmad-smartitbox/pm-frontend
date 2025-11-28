import { FilePlus, MapPin, Mic2, Video } from "lucide-react";
import { useEffect, useRef } from "react";

const ActionMenu = ({
  isOpen,
  onClose,
  onStartVoiceRecording,
  onStartVideoRecording,
  onAttachFiles,
  onShareLocation,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStartVoiceRecording: () => void;
  onStartVideoRecording: () => void;
  onAttachFiles: () => void;
  onShareLocation: () => void;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const actions = [
    {
      icon: Mic2,
      label: "Record Audio",
      onClick: onStartVoiceRecording,
      color: "text-blue-500",
      bgColor: "bg-blue-50 hover:bg-blue-100",
    },
    {
      icon: Video,
      label: "Record Video",
      onClick: onStartVideoRecording,
      color: "text-purple-500",
      bgColor: "bg-purple-50 hover:bg-purple-100",
    },
    {
      icon: FilePlus,
      label: "Attach Files",
      onClick: onAttachFiles,
      color: "text-green-500",
      bgColor: "bg-green-50 hover:bg-green-100",
    },
    {
      icon: MapPin,
      label: "Share Location",
      onClick: onShareLocation,
      color: "text-orange-500",
      bgColor: "bg-orange-50 hover:bg-orange-100",
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - only for mobile */}
      <div
        className="fixed inset-0 bg-black/10 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed md:absolute bottom-0 left-0 right-0 md:bottom-full md:left-0 md:right-auto md:mb-2 bg-white rounded-t-2xl md:rounded-2xl shadow-2xl border border-gray-200 p-3 z-50 md:min-w-[200px]"
      >
        <div className="grid grid-cols-4 md:grid-cols-1 gap-2 md:gap-1">
          {actions.map((action, index) => (
            <button
              key={action.label}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${action.bgColor} animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 w-full`}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: "both",
              }}
            >
              <action.icon
                className={`w-5 h-5 md:w-4 md:h-4 flex-shrink-0 ${action.color}`}
              />
              <span className="text-sm font-medium text-gray-700 md:block hidden">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Close button for mobile */}
        <div className="mt-3 pt-3 border-t border-gray-200 md:hidden">
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default ActionMenu;

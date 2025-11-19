import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      buttonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      headerBg: "bg-red-600",
      icon: AlertCircle,
    },
    warning: {
      buttonColor: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
      headerBg: "bg-amber-600",
      icon: AlertTriangle,
    },
    info: {
      buttonColor: "bg-[#0E3554] hover:bg-[#0A2A42] focus:ring-[#1CC2B1]",
      headerBg: "bg-[#0E3554]",
      icon: AlertCircle,
    },
    success: {
      buttonColor: "bg-[#1CC2B1] hover:bg-[#19B09F] focus:ring-[#1CC2B1]",
      headerBg: "bg-[#1CC2B1]",
      icon: CheckCircle,
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl border border-[#D9F3EE] w-full max-w-sm overflow-hidden">
        {/* Header with colored background - Compact */}
        <div className={`${config.headerBg} text-white p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold">{title}</h2>
              <p className="text-white/80 text-xs mt-0.5">
                Confirm your action
              </p>
            </div>
          </div>
        </div>

        {/* Content - Compact */}
        <div className="p-4">
          <div className="mb-4">
            <p className="text-slate-700 text-sm leading-relaxed text-center">
              {message}
            </p>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium 
                transition-all duration-200 hover:bg-[#EFFFFA] rounded 
                border border-[#D9F3EE] hover:border-[#1CC2B1]
                focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:ring-offset-1"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm text-white rounded font-medium 
                transition-all duration-200 ${config.buttonColor}
                focus:outline-none focus:ring-1 focus:ring-offset-1
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-1.5 min-w-16`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

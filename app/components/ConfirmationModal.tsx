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
      buttonColor: "bg-slate-900 hover:bg-slate-800 focus:ring-blue-500",
      headerBg: "bg-slate-900",
      icon: AlertCircle,
    },
    success: {
      buttonColor: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
      headerBg: "bg-emerald-600",
      icon: CheckCircle,
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header with colored background */}
        <div className={`${config.headerBg} text-white p-6`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-white/80 text-sm mt-1">
                Please confirm your action
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-slate-700 leading-relaxed text-center">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-medium 
                transition-all duration-200 hover:bg-slate-100 rounded-lg 
                border border-slate-300 hover:border-slate-400
                focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-5 py-2.5 text-white rounded-lg font-medium 
                transition-all duration-200 ${config.buttonColor}
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 min-w-20`}
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

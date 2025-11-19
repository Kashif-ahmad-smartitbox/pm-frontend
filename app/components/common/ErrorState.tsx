import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="min-h-screen bg-[#EFFFFA] flex items-center justify-center p-6">
    <div className="text-center space-y-4 max-w-md">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto">
        <AlertCircle className="w-5 h-5 text-red-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-[#0E3554]">
          Unable to Load Dashboard
        </h3>
        <p className="text-slate-600 text-sm">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-[#0E3554] text-white rounded-lg font-medium hover:bg-[#0A2A42] transition-colors flex items-center justify-center gap-1.5 mx-auto text-sm"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Try Again
      </button>
    </div>
  </div>
);

export default ErrorState;

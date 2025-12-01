import { Square, X } from "lucide-react";
import { formatDuration, RecordingStateData } from "../TaskNotesModal";

const VoiceRecordingControls = ({
  recording,
  onStop,
  onCancel,
}: {
  recording: RecordingStateData;
  onStop: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-1.5 md:gap-2 flex-1">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-red-500 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="text-xs md:text-sm font-semibold text-red-700">
            Recording audio...
          </div>
          <div className="text-xs text-red-600 font-mono">
            {formatDuration(recording.duration)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0.5 md:gap-1">
        <button
          onClick={onStop}
          className="p-1.5 md:p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          title="Stop recording"
        >
          <Square className="w-3 h-3 md:w-4 md:h-4" />
        </button>
        <button
          onClick={onCancel}
          className="p-1.5 md:p-2 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
          title="Cancel recording"
        >
          <X className="w-3 h-3 md:w-4 md:h-4" />
        </button>
      </div>
    </div>
  );
};

export default VoiceRecordingControls;

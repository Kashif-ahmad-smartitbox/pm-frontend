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
    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2 flex-1">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-red-700">
            Recording audio...
          </div>
          <div className="text-xs text-red-600 font-mono">
            {formatDuration(recording.duration)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onStop}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          title="Stop recording"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={onCancel}
          className="p-2 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
          title="Cancel recording"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default VoiceRecordingControls;

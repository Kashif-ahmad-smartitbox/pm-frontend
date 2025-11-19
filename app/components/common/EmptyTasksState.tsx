import { FileText, Plus } from "lucide-react";

const EmptyTasksState = ({ onCreateTask }: { onCreateTask: () => void }) => (
  <div className="text-center py-8">
    <div className="w-12 h-12 bg-[#EFFFFA] rounded-xl flex items-center justify-center mx-auto mb-3">
      <FileText className="w-5 h-5 text-slate-400" />
    </div>
    <h3 className="text-sm font-semibold text-[#0E3554] mb-1">No tasks yet</h3>
    <p className="text-slate-600 text-xs mb-4">
      Get started by creating the first task
    </p>
    <button
      onClick={onCreateTask}
      className="px-4 py-2 bg-[#0E3554] text-white rounded-lg font-medium hover:bg-[#0A2A42] transition-colors flex items-center gap-1.5 text-xs mx-auto"
    >
      <Plus className="w-3.5 h-3.5" />
      Create First Task
    </button>
  </div>
);

export default EmptyTasksState;

import { MessageSquare, RefreshCw, User, X } from "lucide-react";
import { Task } from "../TaskNotesModal";

const DesktopHeader = ({
  task,
  onClose,
  onRefresh,
  loading,
  notesCount,
}: {
  task: Task;
  onClose: () => void;
  onRefresh: () => void;
  loading: boolean;
  notesCount: number;
}) => (
  <div className="bg-white border-b border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#EFFFFA] rounded-xl flex items-center justify-center border border-blue-200">
          <MessageSquare className="w-6 h-6 text-[#1CC2B1]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate flex items-center gap-2">
            {task?.title}
            <span className="text-xs font-normal bg-[#E1F3F0] text-[#1CC2B1] px-2 py-1 rounded-full">
              {notesCount} message{notesCount !== 1 ? "s" : ""}
            </span>
          </h2>
          <p className="text-gray-600 text-sm truncate mt-1 max-w-2xl">
            {task?.description || "No description provided"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`p-3 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition-all ${
            loading ? "animate-spin" : ""
          }`}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-xl transition-colors border border-transparent hover:border-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>

    <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap mt-4">
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">
        <User className="w-4 h-4 text-[#1CC2B1]" />
        <span className="font-medium text-gray-700">
          {task?.createdBy?.name}
        </span>
      </div>
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">
        <User className="w-4 h-4 text-[#1CC2B1]" />
        <span className="text-gray-700">
          {task?.assignees?.length} team members
        </span>
      </div>
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">
        <div
          className={`w-2 h-2 rounded-full ${
            task?.status === "done"
              ? "bg-green-500"
              : task?.status === "in_progress"
              ? "bg-yellow-500"
              : "bg-gray-500"
          }`}
        />
        <span className="capitalize text-gray-700">
          {task?.status?.replace("_", " ")}
        </span>
      </div>
      {task?.priority && (
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">
          <div
            className={`w-2 h-2 rounded-full ${
              task?.priority === "critical"
                ? "bg-red-500"
                : task?.priority === "high"
                ? "bg-orange-500"
                : task?.priority === "medium"
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
          />
          <span className="capitalize text-gray-700">
            {task.priority} priority
          </span>
        </div>
      )}
    </div>
  </div>
);

export default DesktopHeader;

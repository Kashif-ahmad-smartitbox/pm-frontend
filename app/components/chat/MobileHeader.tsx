import { useState } from "react";
import { Task } from "../TaskNotesModal";
import { ChevronDown, ChevronUp, RefreshCw, User, X } from "lucide-react";

const MobileHeader = ({
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
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 p-4 safe-area-top">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {task?.title}
            </h2>
            <p className="text-blue-600 text-sm truncate">
              {notesCount} message{notesCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition-all ${
              loading ? "animate-spin" : ""
            }`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            {showDetails ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded border border-gray-300">
              <User className="w-3 h-3 text-blue-600" />
              <span className="text-gray-700">{task?.createdBy?.name}</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded border border-gray-300">
              <span className="text-gray-700">
                {task?.assignees?.length} members
              </span>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded border border-gray-300">
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
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded border border-gray-300">
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
                  {task.priority}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileHeader;

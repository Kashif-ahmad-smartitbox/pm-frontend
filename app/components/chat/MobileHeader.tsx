import { useState } from "react";
import { Task } from "../TaskNotesModal";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  User,
  X,
  Plus,
  UserPlus,
} from "lucide-react";

const MobileHeader = ({
  task,
  onClose,
  onRefresh,
  loading,
  notesCount,
  userRole,
  onCreateTask,
  onAddUsers,
  assigneesCount,
}: {
  task: Task;
  onClose: () => void;
  onRefresh: () => void;
  loading: boolean;
  notesCount: number;
  userRole?: string;
  onCreateTask?: () => void;
  onAddUsers?: () => void;
  assigneesCount?: number;
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 p-4 safe-area-top">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onClose}
            className="shrink-0 w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-xl transition-colors"
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
              <span className="text-gray-700">{assigneesCount} members</span>
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

            {(userRole === "admin" || userRole === "project_manager") &&
              onAddUsers && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddUsers();
                  }}
                  className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200 hover:border-emerald-300 transition-all duration-200 font-medium"
                  title="Add users to this task"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Add Users</span>
                  {assigneesCount !== undefined && assigneesCount > 0 && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1 py-0.5 rounded-full">
                      {assigneesCount}
                    </span>
                  )}
                </button>
              )}

            {(userRole === "admin" || userRole === "project_manager") &&
              onCreateTask && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateTask();
                  }}
                  className="flex items-center gap-1 bg-[#1CC2B1] hover:bg-[#0E3554] text-white px-2 py-1 rounded border border-transparent hover:border-[#1CC2B1] transition-all duration-200 font-medium"
                  title="Create new task for this project"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Task</span>
                </button>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileHeader;

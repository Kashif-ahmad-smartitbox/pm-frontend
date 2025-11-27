"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  BarChart3,
  Filter,
  Search,
  FileText,
  CheckCircle,
  Clock,
  PlayCircle,
  AlertTriangle,
  Menu,
} from "lucide-react";
import { Task } from "./common/TaskCard2";
import ModalTaskGrid from "./ModalTaskGrid";

// Task Stats Interface
interface TaskStats {
  total: number;
  byStatus: {
    todo: number;
    in_progress: number;
    done: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  overdue: number;
}

interface AllTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTasks: Task[];
  taskStats?: TaskStats;
  onTaskClick?: (task: Task) => void;
  onChatClick?: (task: Task) => void;
}

// Helper function to get status badge styles
const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "done":
      return "bg-[#E1F3F0] text-[#1CC2B1] border-[#D9F3EE]";
    case "in_progress":
      return "bg-[#FFF4DD] text-[#E6A93A] border-[#FAE8C8]";
    case "todo":
    default:
      return "bg-[#E0FFFA] text-[#0E3554] border-[#D9F3EE]";
  }
};

// Helper function to get priority badge styles
const getPriorityBadgeStyles = (priority: string) => {
  switch (priority) {
    case "critical":
      return "bg-red-50 text-red-700 border-red-200";
    case "high":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "medium":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "low":
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "done":
      return CheckCircle;
    case "in_progress":
      return PlayCircle;
    case "todo":
    default:
      return Clock;
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Helper function to get status display text
const getStatusDisplayText = (status: string) => {
  switch (status) {
    case "todo":
      return "To Do";
    case "in_progress":
      return "In Progress";
    case "done":
      return "Completed";
    default:
      return status;
  }
};

// Helper function to check if task is overdue
const isTaskOverdue = (task: Task): boolean => {
  if (task.status === "done") return false;
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  return dueDate < today;
};

const AllTasksModal: React.FC<AllTasksModalProps> = ({
  isOpen,
  onClose,
  allTasks = [],
  taskStats,
  onTaskClick,
  onChatClick,
}) => {
  const [activeFilter, setActiveFilter] = useState<{
    type: "status" | "priority" | "overdue" | "all";
    value: string;
  }>({ type: "all", value: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter tasks based on active filter and search
  const filteredTasks = useMemo(() => {
    let filtered = allTasks;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          // @ts-ignore
          task.project?.projectName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          task.assignees.some((assignee) =>
            assignee.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply status/priority/overdue filter
    if (activeFilter.type !== "all" && activeFilter.value !== "all") {
      if (activeFilter.type === "status") {
        filtered = filtered.filter(
          (task) => task.status === activeFilter.value
        );
      } else if (activeFilter.type === "priority") {
        filtered = filtered.filter(
          (task) => task.priority === activeFilter.value
        );
      } else if (activeFilter.type === "overdue") {
        filtered = filtered.filter((task) => isTaskOverdue(task));
      }
    }

    return filtered;
  }, [allTasks, activeFilter, searchTerm]);

  const handleFilterClick = (
    type: "status" | "priority" | "overdue",
    value: string
  ) => {
    if (activeFilter.type === type && activeFilter.value === value) {
      setActiveFilter({ type: "all", value: "all" });
    } else {
      setActiveFilter({ type, value });
    }
    // Close mobile menu on filter selection
    setIsMobileMenuOpen(false);
  };

  const handleClearFilters = () => {
    setActiveFilter({ type: "all", value: "all" });
    setSearchTerm("");
    setIsMobileMenuOpen(false);
  };

  const hasActiveFilters = activeFilter.type !== "all" || searchTerm.trim();

  // Calculate overdue tasks count
  const overdueTasksCount = allTasks.filter(isTaskOverdue).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-sm border border-[#D9F3EE] w-full max-w-6xl h-[90vh] sm:h-[85vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="border-b border-[#D9F3EE] p-3 sm:p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#EFFFFA] rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-[#0E3554]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0E3554]">
                  All Tasks Overview
                </h2>
                <p className="text-slate-600 text-xs mt-0.5">
                  {filteredTasks.length} of {allTasks.length} tasks
                  {hasActiveFilters && " (filtered)"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden w-8 h-8 flex items-center justify-center text-slate-600 hover:text-[#0E3554] hover:bg-slate-100 rounded transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-slate-600 hover:text-[#0E3554] hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Task Stats Summary with Filter Cards - Fixed */}
        {/* Task Stats Summary with Filter Cards - Fixed */}
        {taskStats && (
          <div className="p-3 sm:p-4 bg-linear-to-br from-gray-50 to-white border-b border-[#D9F3EE] shrink-0">
            {/* Mobile Filter Menu */}
            {isMobileMenuOpen && (
              <div className="sm:hidden mb-4 p-3 bg-white border border-[#D9F3EE] rounded-lg shadow-sm">
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      setActiveFilter({ type: "all", value: "all" })
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter.type === "all"
                        ? "bg-[#0E3554] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Tasks ({taskStats.total})
                  </button>
                  <button
                    onClick={() => handleFilterClick("status", "todo")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter.type === "status" &&
                      activeFilter.value === "todo"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    To Do ({taskStats.byStatus.todo})
                  </button>
                  <button
                    onClick={() => handleFilterClick("status", "in_progress")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter.type === "status" &&
                      activeFilter.value === "in_progress"
                        ? "bg-amber-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    In Progress ({taskStats.byStatus.in_progress})
                  </button>
                  <button
                    onClick={() => handleFilterClick("status", "done")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter.type === "status" &&
                      activeFilter.value === "done"
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Completed ({taskStats.byStatus.done})
                  </button>
                  <button
                    onClick={() => handleFilterClick("overdue", "overdue")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter.type === "overdue"
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Overdue ({taskStats.overdue || overdueTasksCount})
                  </button>
                </div>
              </div>
            )}

            {/* Desktop Stats Grid - Hidden on mobile when menu is open */}
            {!isMobileMenuOpen && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 mb-4">
                {/* Total Tasks Card */}
                <div
                  className={`bg-white rounded-lg p-2 sm:p-3 border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    activeFilter.type === "all"
                      ? "border-[#1CC2B1] ring-1 ring-[#1CC2B1]"
                      : "border-[#D9F3EE] hover:border-[#0E3554]"
                  }`}
                  onClick={() => setActiveFilter({ type: "all", value: "all" })}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-lg sm:text-xl font-bold text-[#0E3554]">
                      {taskStats.total}
                    </div>
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-[#1CC2B1]" />
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    Total Tasks
                  </div>
                </div>

                {/* To Do Card */}
                <div
                  className={`bg-white rounded-lg p-2 sm:p-3 border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    activeFilter.type === "status" &&
                    activeFilter.value === "todo"
                      ? "border-blue-500 ring-1 ring-blue-500"
                      : "border-[#D9F3EE] hover:border-blue-500"
                  }`}
                  onClick={() => handleFilterClick("status", "todo")}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">
                      {taskStats.byStatus.todo}
                    </div>
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    To Do
                  </div>
                </div>

                {/* In Progress Card */}
                <div
                  className={`bg-white rounded-lg p-2 sm:p-3 border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    activeFilter.type === "status" &&
                    activeFilter.value === "in_progress"
                      ? "border-amber-500 ring-1 ring-amber-500"
                      : "border-[#D9F3EE] hover:border-amber-500"
                  }`}
                  onClick={() => handleFilterClick("status", "in_progress")}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-lg sm:text-xl font-bold text-amber-600">
                      {taskStats.byStatus.in_progress}
                    </div>
                    <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    In Progress
                  </div>
                </div>

                {/* Completed Card */}
                <div
                  className={`rounded-lg p-2 sm:p-3 border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    activeFilter.type === "status" &&
                    activeFilter.value === "done"
                      ? "border-emerald-500 ring-1 ring-emerald-500"
                      : "border-[#D9F3EE] hover:border-emerald-500"
                  }`}
                  onClick={() => handleFilterClick("status", "done")}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-lg sm:text-xl font-bold text-emerald-600">
                      {taskStats.byStatus.done}
                    </div>
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    Completed
                  </div>
                </div>

                {/* Overdue Card */}
                <div
                  className={`rounded-lg p-2 sm:p-3 border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    activeFilter.type === "overdue"
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-[#D9F3EE] hover:border-red-500"
                  }`}
                  onClick={() => handleFilterClick("overdue", "overdue")}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-lg sm:text-xl font-bold text-red-600">
                      {taskStats.overdue || overdueTasksCount}
                    </div>
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    Overdue
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tasks, projects, or assignees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-[#D9F3EE] rounded-lg 
            placeholder-slate-400 transition-all duration-200
            focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
            hover:border-[#0E3554] bg-white text-[#0E3554]"
                />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 text-sm text-slate-600 hover:text-[#0E3554] font-medium 
            transition-colors hover:bg-[#EFFFFA] rounded-lg border border-[#D9F3EE] 
            flex items-center gap-1.5 justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>

            {/* Active Filter Badge */}
            {activeFilter.type !== "all" && (
              <div className="mt-3 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-600">Filtered by:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${
                    activeFilter.type === "overdue"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : getStatusBadgeStyles(activeFilter.value)
                  }`}
                >
                  {activeFilter.type === "overdue"
                    ? "Overdue Tasks"
                    : getStatusDisplayText(activeFilter.value)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tasks List - Scrollable Area */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="h-full overflow-y-auto">
            <div className="p-2 sm:p-4">
              <ModalTaskGrid
                tasks={filteredTasks}
                onTaskClick={onTaskClick}
                onChatClick={onChatClick}
              />
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-[#D9F3EE] p-3 sm:p-4 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            <div className="text-sm text-slate-600 text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-[#0E3554]">
                {filteredTasks.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#0E3554]">
                {allTasks.length}
              </span>{" "}
              tasks
              {taskStats && (
                <span className="text-emerald-600 font-medium ml-2">
                  (
                  {Math.round(
                    (taskStats.byStatus.done / Math.max(1, taskStats.total)) *
                      100
                  )}
                  % completed)
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm rounded font-medium
                bg-[#0E3554] hover:bg-[#0A2A42]
                transition-all duration-200
                flex items-center justify-center gap-1.5 text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTasksModal;

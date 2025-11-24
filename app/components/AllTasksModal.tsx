"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Calendar,
  User as UserIcon,
  Flag,
  FileText,
  CheckCircle,
  Clock,
  PlayCircle,
  BarChart3,
  Filter,
  Search,
  FolderOpen,
} from "lucide-react";
import { Task, User } from "./common/TaskCard2";

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
}

interface AllTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTasks: Task[];
  taskStats?: TaskStats;
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

const AllTasksModal: React.FC<AllTasksModalProps> = ({
  isOpen,
  onClose,
  allTasks = [],
  taskStats,
}) => {
  const [activeFilter, setActiveFilter] = useState<{
    type: "status" | "priority" | "all";
    value: string;
  }>({ type: "all", value: "all" });
  const [searchTerm, setSearchTerm] = useState("");

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
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          task.assignees.some((assignee) =>
            assignee.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply status/priority filter
    if (activeFilter.type !== "all" && activeFilter.value !== "all") {
      if (activeFilter.type === "status") {
        filtered = filtered.filter(
          (task) => task.status === activeFilter.value
        );
      } else if (activeFilter.type === "priority") {
        filtered = filtered.filter(
          (task) => task.priority === activeFilter.value
        );
      }
    }

    return filtered;
  }, [allTasks, activeFilter, searchTerm]);

  const handleFilterClick = (type: "status" | "priority", value: string) => {
    if (activeFilter.type === type && activeFilter.value === value) {
      setActiveFilter({ type: "all", value: "all" });
    } else {
      setActiveFilter({ type, value });
    }
  };

  const handleClearFilters = () => {
    setActiveFilter({ type: "all", value: "all" });
    setSearchTerm("");
  };

  const hasActiveFilters = activeFilter.type !== "all" || searchTerm.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-sm border border-[#D9F3EE] w-full max-w-6xl h-[85vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="border-b border-[#D9F3EE] p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#EFFFFA] rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#0E3554]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0E3554]">
                  All Tasks Overview
                </h2>
                <p className="text-slate-600 text-xs mt-0.5">
                  {filteredTasks.length} of {allTasks.length} tasks
                  {hasActiveFilters && " (filtered)"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-[#0E3554] hover:bg-slate-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Stats Summary with Filter Cards - Fixed */}
        {taskStats && (
          <div className="p-4 bg-linear-to-br from-gray-50 to-white border-b border-[#D9F3EE] shrink-0">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {/* Total Tasks Card */}
              <div
                className={`bg-white rounded-lg p-3 border transition-all duration-200 cursor-pointer hover:shadow-md ${
                  activeFilter.type === "all"
                    ? "border-[#1CC2B1] ring-1 ring-[#1CC2B1]"
                    : "border-[#D9F3EE] hover:border-[#0E3554]"
                }`}
                onClick={() => setActiveFilter({ type: "all", value: "all" })}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-[#0E3554]">
                    {taskStats.total}
                  </div>
                  <BarChart3 className="w-4 h-4 text-[#1CC2B1]" />
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  Total Tasks
                </div>
              </div>

              {/* To Do Card */}
              <div
                className={`bg-white rounded-lg p-3 border transition-all duration-200 cursor-pointer hover:shadow-md ${
                  activeFilter.type === "status" &&
                  activeFilter.value === "todo"
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : "border-[#D9F3EE] hover:border-blue-500"
                }`}
                onClick={() => handleFilterClick("status", "todo")}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-blue-600">
                    {taskStats.byStatus.todo}
                  </div>
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  To Do
                </div>
              </div>

              {/* In Progress Card */}
              <div
                className={`bg-white rounded-lg p-3 border transition-all duration-200 cursor-pointer hover:shadow-md ${
                  activeFilter.type === "status" &&
                  activeFilter.value === "in_progress"
                    ? "border-amber-500 ring-1 ring-amber-500"
                    : "border-[#D9F3EE] hover:border-amber-500"
                }`}
                onClick={() => handleFilterClick("status", "in_progress")}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-amber-600">
                    {taskStats.byStatus.in_progress}
                  </div>
                  <PlayCircle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  In Progress
                </div>
              </div>

              {/* Completed Card */}
              <div
                className={`rounded-lg p-3 border transition-all duration-200 cursor-pointer hover:shadow-md ${
                  activeFilter.type === "status" &&
                  activeFilter.value === "done"
                    ? "border-emerald-500 ring-1 ring-emerald-500"
                    : "border-[#D9F3EE] hover:border-emerald-500"
                }`}
                onClick={() => handleFilterClick("status", "done")}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-emerald-600">
                    {taskStats.byStatus.done}
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  Completed
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex items-center gap-3">
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
                    flex items-center gap-1.5"
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
                  className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeStyles(
                    activeFilter.value
                  )}`}
                >
                  {getStatusDisplayText(activeFilter.value)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tasks List - Scrollable Area */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="h-full overflow-y-auto">
            <div className="p-4">
              {filteredTasks.length > 0 ? (
                <div className="grid gap-3">
                  {filteredTasks.map((task) => {
                    const StatusIcon = getStatusIcon(task.status);
                    return (
                      <div
                        key={task._id}
                        className="border border-[#D9F3EE] rounded-lg p-4 
                          hover:shadow-md transition-all duration-200 
                          hover:border-[#1CC2B1]/30 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            {/* Header with status and priority */}
                            <div className="flex items-center gap-2 mb-3">
                              <div
                                className={`p-1.5 rounded-lg ${getStatusBadgeStyles(
                                  task.status
                                )}`}
                              >
                                <StatusIcon className="w-3.5 h-3.5" />
                              </div>
                              <h3 className="font-semibold text-[#0E3554] text-sm leading-tight flex-1">
                                {task.title}
                              </h3>
                              <div
                                className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeStyles(
                                  task.priority
                                )}`}
                              >
                                <Flag className="w-3 h-3 inline mr-1" />
                                {task.priority.charAt(0).toUpperCase() +
                                  task.priority.slice(1)}
                              </div>
                            </div>

                            {/* Description */}
                            {task.description && (
                              <p className="text-xs text-slate-600 mb-3 leading-relaxed line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            {/* Meta Information */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                {/* Project */}
                                <div className="flex items-center gap-1.5">
                                  <FolderOpen className="w-3.5 h-3.5 text-[#1CC2B1]" />
                                  <span className="font-medium text-[#0E3554]">
                                    {/* @ts-ignore */}
                                    {task.project?.projectName}
                                  </span>
                                </div>

                                {/* Due Date */}
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-[#1CC2B1]" />
                                  <span>Due: {formatDate(task.dueDate)}</span>
                                </div>

                                {/* Assignees */}
                                <div className="flex items-center gap-1.5">
                                  <UserIcon className="w-3.5 h-3.5 text-[#1CC2B1]" />
                                  <div className="flex items-center gap-1">
                                    {task.assignees
                                      .slice(0, 2)
                                      .map((assignee) => (
                                        <span
                                          key={assignee._id}
                                          className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200"
                                        >
                                          {assignee.name.split(" ")[0]}
                                        </span>
                                      ))}
                                    {task.assignees.length > 2 && (
                                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                        +{task.assignees.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Notes count */}
                              {task.notes && task.notes.length > 0 && (
                                <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                  {task.notes.length} note
                                  {task.notes.length !== 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No tasks found
                  </h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    {hasActiveFilters
                      ? "No tasks match your current filters. Try adjusting your search or filters."
                      : "There are currently no tasks across all projects."}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="mt-4 px-4 py-2 text-sm text-[#0E3554] hover:text-[#1CC2B1] font-medium 
                        transition-colors hover:bg-[#EFFFFA] rounded-lg border border-[#D9F3EE]"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-[#D9F3EE] p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
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
              className="px-4 py-2 text-sm rounded font-medium
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

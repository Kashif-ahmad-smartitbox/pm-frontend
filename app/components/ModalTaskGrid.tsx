"use client";

import React from "react";
import {
  Calendar,
  FileText,
  MessageCircle,
  User as UserIcon,
  FolderOpen,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  Clock,
  Flag,
} from "lucide-react";
import { Task, TaskStatus, TaskPriority } from "./common/TaskCard2";

// Helper function to get status badge styles
const getStatusBadgeStyles = (status: TaskStatus) => {
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
const getPriorityBadgeStyles = (priority: TaskPriority) => {
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
const getStatusIcon = (status: TaskStatus) => {
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
  });
};

// Helper function to check if task is overdue
const isTaskOverdue = (task: Task): boolean => {
  if (task.status === "done") return false;
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  return dueDate < today;
};

interface ModalTaskGridProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onChatClick?: (task: Task) => void;
}

const ModalTaskCard: React.FC<{
  task: Task;
  onTaskClick?: (task: Task) => void;
  onChatClick?: (task: Task) => void;
}> = ({ task, onTaskClick, onChatClick }) => {
  const StatusIcon = getStatusIcon(task.status);
  const overdue = isTaskOverdue(task);

  const handleTaskClick = () => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering task click
    if (onChatClick) {
      onChatClick(task);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl p-3 sm:p-4 border transition-all duration-300 
        hover:shadow-lg group cursor-pointer h-full flex flex-col
        ${
          overdue
            ? "border-red-200 bg-red-50/50 hover:border-red-300"
            : "border-[#E1F3F0] hover:border-[#1CC2B1] hover:bg-[#F8FDFC]"
        }`}
      onClick={handleTaskClick}
    >
      {/* Header with Status and Priority */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              overdue
                ? "bg-red-100 text-red-600"
                : "bg-[#E0FFFA] text-[#1CC2B1]"
            }`}
          >
            {overdue ? (
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[#0E3554] text-sm leading-tight line-clamp-2 group-hover:text-[#1CC2B1] transition-colors">
              {task.title}
            </h3>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getPriorityBadgeStyles(
            task.priority
          )}`}
        >
          <Flag className="w-3 h-3 inline mr-1 hidden xs:inline" />
          <span className="hidden sm:inline">
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          <span className="sm:hidden">
            {task.priority.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Overdue Badge */}
      {overdue && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200">
            <AlertTriangle className="w-3 h-3" />
            Overdue
          </span>
        </div>
      )}

      {/* Description */}
      {task.description && (
        <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-3 flex-1">
          {task.description}
        </p>
      )}

      {/* Meta Information */}
      <div className="space-y-2 mt-auto">
        {/* Project */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <FolderOpen className="w-3.5 h-3.5 text-[#1CC2B1] flex-shrink-0" />
          <span className="font-medium text-[#0E3554] truncate">
            {/* @ts-ignore */}
            {task.project?.projectName || "No Project"}
          </span>
        </div>

        {/* Due Date */}
        <div
          className={`flex items-center gap-2 text-xs ${
            overdue ? "text-red-600 font-medium" : "text-slate-600"
          }`}
        >
          <Calendar
            className={`w-3.5 h-3.5 flex-shrink-0 ${
              overdue ? "text-red-500" : "text-[#1CC2B1]"
            }`}
          />
          <span>Due: {formatDate(task.dueDate)}</span>
        </div>

        {/* Assignees */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <UserIcon className="w-3.5 h-3.5 text-[#1CC2B1] flex-shrink-0" />
          <div className="flex items-center gap-1 flex-wrap">
            {task.assignees.slice(0, 3).map((assignee) => (
              <span
                key={assignee._id}
                className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-200 truncate max-w-16 sm:max-w-20"
              >
                {assignee.name.split(" ")[0]}
              </span>
            ))}
            {task.assignees.length > 3 && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">
                +{task.assignees.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Notes and Actions Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          {/* Notes count */}
          {task.notes && task.notes.length > 0 && (
            <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {task.notes.length} note{task.notes.length !== 1 ? "s" : ""}
            </div>
          )}

          {/* Chat Button */}
          <button
            onClick={handleChatClick}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-slate-600 hover:text-[#1CC2B1] 
              hover:bg-[#EFFFFA] rounded-lg transition-all duration-200 group/chat border border-slate-300 hover:border-[#1CC2B1]"
            title="Open chat"
          >
            <MessageCircle className="w-3.5 h-3.5 group-hover/chat:scale-110 transition-transform" />
            <span className="text-xs font-medium hidden sm:inline">Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ModalTaskGrid: React.FC<ModalTaskGridProps> = ({
  tasks,
  onTaskClick,
  onChatClick,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
          No tasks found
        </h3>
        <p className="text-gray-500 text-xs sm:text-sm max-w-sm mx-auto">
          {tasks.length === 0
            ? "There are currently no tasks to display."
            : "No tasks match your current filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
      {tasks.map((task) => (
        <ModalTaskCard
          key={task._id}
          task={task}
          onTaskClick={onTaskClick}
          onChatClick={onChatClick}
        />
      ))}
    </div>
  );
};

export default ModalTaskGrid;

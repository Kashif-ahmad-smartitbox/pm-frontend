"use client";

import React from "react";
import {
  MoreVertical,
  Edit,
  Trash2,
  FolderOpen,
  MapPin,
  User,
  Calendar,
  Users,
  BarChart3,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Project } from "@/types/project";
import StatusBadge from "./StatusBadge";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onViewTasks: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  showActions?: boolean;
  taskStats?: {
    total: number;
    byStatus: {
      todo: number;
      in_progress: number;
      done: number;
    };
  };
}

// Helper function to check if project is overdue
const isProjectOverdue = (project: Project): boolean => {
  if (project.status === "completed") return false;
  const today = new Date();
  const endDate = new Date(project.endDate);
  return endDate < today;
};

// Color mapping for user roles or predefined colors
const getColorClass = (colorValue?: string) => {
  if (!colorValue) return "bg-slate-400";

  // If it's a hex color, use inline style
  if (colorValue.startsWith("#")) {
    return "";
  }

  // If it's a Tailwind color class, use it directly
  const colorMap: { [key: string]: string } = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    indigo: "bg-indigo-500",
    teal: "bg-teal-500",
    orange: "bg-orange-500",
    cyan: "bg-cyan-500",
    lime: "bg-lime-500",
    emerald: "bg-emerald-500",
    violet: "bg-violet-500",
    fuchsia: "bg-fuchsia-500",
    rose: "bg-rose-500",
    sky: "bg-sky-500",
    amber: "bg-amber-500",
  };

  return colorMap[colorValue] || "bg-slate-400";
};

// Helper function to check if project was created within last 24 hours
const isNewProject = (createdAt: string): boolean => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInHours =
    (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
  return diffInHours <= 24;
};

// Format date to relative time or specific format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

// Format date with month, day, and year
const formatDateWithYear = (dateString: string) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Format date for compact display (month, day, year)
const formatCompactDate = (dateString: string) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Format date for timeline display (more compact)
const formatTimelineDate = (dateString: string) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const now = new Date();
  const currentYear = now.getFullYear();
  const dateYear = date.getFullYear();

  // If the date is in the current year, don't show the year
  if (dateYear === currentYear) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // For other years, show with 2-digit year format
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onViewTasks,
  menuOpen,
  onToggleMenu,
  showActions = true,
  taskStats,
}) => {
  const userColorClass = getColorClass(project.projectManager?.color);
  const isHexColor = project.projectManager?.color?.startsWith("#");
  const isNew = project.createdAt && isNewProject(project.createdAt);
  const overdue = isProjectOverdue(project);

  console.log("boolen", project.projectOverdue);

  return (
    <div
      onClick={onViewTasks}
      className={`rounded-lg p-3 border transition-all duration-200 group cursor-pointer ${
        overdue
          ? "border-red-200 bg-red-50/50 hover:border-red-300 hover:bg-red-50/70"
          : "bg-white border-[#D9F3EE] hover:border-[#1CC2B1] hover:shadow-md"
      }`}
    >
      {/* Header - Ultra Compact */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-200 ${
              overdue
                ? "bg-red-100 border-red-200 text-red-600 group-hover:bg-red-200 group-hover:border-red-300"
                : "bg-gradient-to-br from-[#EFFFFA] to-[#D9F3EE] border-[#D9F3EE] group-hover:from-[#1CC2B1] group-hover:to-[#0E3554] group-hover:border-[#1CC2B1]"
            }`}
          >
            {overdue ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <FolderOpen
                className={`w-4 h-4 transition-colors ${
                  overdue
                    ? "text-red-600"
                    : "text-[#0E3554] group-hover:text-white"
                }`}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`text-sm font-bold truncate transition-colors ${
                  overdue
                    ? "text-red-900 group-hover:text-red-700"
                    : "text-[#0E3554] group-hover:text-[#1CC2B1]"
                }`}
              >
                {project.projectName}
              </h3>
            </div>
            <div
              className={`flex items-center gap-1.5 text-xs ${
                overdue ? "text-red-700" : "text-slate-500"
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span className="truncate">{project.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Overdue Badge */}
          {overdue && (
            <div className="bg-red-100 text-red-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-red-200 flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5" />
              OVERDUE
            </div>
          )}

          {/* New Badge - Next to status */}
          {isNew && !overdue && (
            <div className="bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-0.5">
              <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
              NEW
            </div>
          )}

          <StatusBadge status={project.status} compact={true} />

          {showActions && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMenu();
                }}
                className={`p-1 rounded transition-colors ${
                  overdue
                    ? "text-red-400 hover:text-red-600 hover:bg-red-100"
                    : "text-slate-400 hover:text-[#0E3554] hover:bg-[#EFFFFA]"
                }`}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <div
                  className={`absolute right-0 top-6 rounded-lg shadow-lg border py-1 z-10 min-w-28 ${
                    overdue
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-[#D9F3EE]"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(project);
                    }}
                    className={`w-full px-2 py-1.5 text-left text-xs flex items-center gap-1.5 transition-colors ${
                      overdue
                        ? "text-red-800 hover:bg-red-100"
                        : "text-[#0E3554] hover:bg-[#EFFFFA]"
                    }`}
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(project._id);
                    }}
                    className={`w-full px-2 py-1.5 text-left text-xs flex items-center gap-1.5 transition-colors ${
                      overdue
                        ? "text-red-600 hover:bg-red-100"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Created Date */}
      <div
        className={`flex items-center gap-1 text-xs mb-2 ${
          overdue ? "text-red-700" : "text-slate-500"
        }`}
      >
        <Clock className="w-3 h-3" />
        <span>Created: </span>
        <span
          className={`font-medium ${
            overdue ? "text-red-800" : "text-slate-700"
          }`}
        >
          {project.createdAt ? formatDate(project.createdAt) : "N/A"}
        </span>
      </div>

      {/* Task Stats - Compact */}
      {taskStats && (
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-5 h-5 rounded flex items-center justify-center border ${
                overdue
                  ? "bg-red-100 border-red-200"
                  : "bg-[#EFFFFA] border-[#D9F3EE]"
              }`}
            >
              <span
                className={`text-[10px] font-bold ${
                  overdue ? "text-red-800" : "text-[#0E3554]"
                }`}
              >
                {taskStats.total}
              </span>
            </div>
            <span
              className={`text-[10px] font-medium ${
                overdue ? "text-red-700" : "text-slate-600"
              }`}
            >
              Tasks
            </span>
          </div>

          {/* Progress Bar - Mini */}
          <div className="flex-1 max-w-20">
            <div
              className={`w-full rounded-full h-1.5 ${
                overdue ? "bg-red-200" : "bg-slate-200"
              }`}
            >
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  overdue
                    ? "bg-gradient-to-r from-red-500 to-red-700"
                    : "bg-gradient-to-r from-[#1CC2B1] to-[#0E3554]"
                }`}
                style={{
                  width: `${
                    taskStats.byStatus.done > 0
                      ? (taskStats.byStatus.done / taskStats.total) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Status Dots */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  overdue ? "bg-red-400" : "bg-slate-400"
                }`}
              ></div>
              <span
                className={`text-[10px] font-semibold ${
                  overdue ? "text-red-800" : "text-slate-700"
                }`}
              >
                {taskStats.byStatus.todo}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  overdue ? "bg-red-500" : "bg-[#E6A93A]"
                }`}
              ></div>
              <span
                className={`text-[10px] font-semibold ${
                  overdue ? "text-red-800" : "text-slate-700"
                }`}
              >
                {taskStats.byStatus.in_progress}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  overdue ? "bg-green-500" : "bg-[#1CC2B1]"
                }`}
              ></div>
              <span
                className={`text-[10px] font-semibold ${
                  overdue ? "text-green-700" : "text-slate-700"
                }`}
              >
                {taskStats.byStatus.done}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Project Details - Compact Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Manager */}
        <div
          className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 border ${
            overdue
              ? "text-red-700 bg-red-100 border-red-200"
              : "text-slate-600 bg-slate-50 border-slate-100"
          }`}
        >
          <User className="w-3 h-3" />
          <span className="font-medium truncate">
            {project.projectManager?.name?.split(" ")[0] || "N/A"}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${userColorClass} shrink-0`}
            style={
              isHexColor
                ? { backgroundColor: project.projectManager?.color }
                : {}
            }
          />
        </div>

        {/* Project Type */}
        <div
          className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 border ${
            overdue
              ? "text-red-700 bg-red-100 border-red-200"
              : "text-slate-600 bg-slate-50 border-slate-100"
          }`}
        >
          <FolderOpen className="w-3 h-3" />
          <span className="font-medium truncate">
            {project.projectType?.name || "N/A"}
          </span>
        </div>

        {/* Timeline */}
        <div
          className={`col-span-2 flex items-center justify-between text-xs rounded-md px-2 py-1.5 border ${
            overdue
              ? "bg-red-100 border-red-200 text-red-800"
              : "bg-[#EFFFFA] border-[#D9F3EE] text-slate-600"
          }`}
        >
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span className="font-medium">Start</span>
          </div>
          <span
            className={`font-semibold text-[10px] ${
              overdue ? "text-red-900" : "text-[#0E3554]"
            }`}
          >
            {project.startDate ? formatTimelineDate(project.startDate) : "N/A"}
          </span>

          <div
            className={`w-px h-3 mx-1 ${
              overdue ? "bg-red-300" : "bg-[#D9F3EE]"
            }`}
          ></div>

          <div className="flex items-center gap-1">
            <span className="font-medium">End</span>
          </div>
          <span
            className={`font-semibold text-[10px] ${
              overdue ? "text-red-900" : "text-[#0E3554]"
            }`}
          >
            {project.endDate ? formatTimelineDate(project.endDate) : "N/A"}
          </span>
        </div>
      </div>

      {/* Full Dates Footer - Shows complete dates with years */}
      <div
        className={`mt-2 pt-2 border-t ${
          overdue ? "border-red-200" : "border-slate-100"
        }`}
      >
        <div
          className={`text-[10px] text-center ${
            overdue ? "text-red-600" : "text-slate-500"
          }`}
        >
          <span className="font-medium">Project Period: </span>
          <span>
            {project.startDate ? formatCompactDate(project.startDate) : "N/A"}
            {" → "}
            {project.endDate ? formatCompactDate(project.endDate) : "N/A"}
          </span>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        <div
          className={`flex items-center gap-1 text-xs ${
            overdue ? "text-red-600" : "text-slate-500"
          }`}
        >
          <BarChart3 className="w-3 h-3" />
          <span>View tasks</span>
        </div>
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
            overdue
              ? "bg-red-100 border-red-200 group-hover:bg-red-200 group-hover:border-red-300"
              : "bg-[#EFFFFA] border-[#D9F3EE] group-hover:bg-[#1CC2B1] group-hover:border-[#1CC2B1]"
          }`}
        >
          <Users
            className={`w-2.5 h-2.5 transition-colors ${
              overdue
                ? "text-red-600 group-hover:text-red-800"
                : "text-[#0E3554] group-hover:text-white"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

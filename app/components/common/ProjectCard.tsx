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

  return (
    <div
      onClick={onViewTasks}
      className="bg-white rounded-xl p-3 border border-[#D9F3EE] hover:border-[#1CC2B1] hover:shadow-lg transition-all duration-300 group hover:scale-[1.02] cursor-pointer"
    >
      {/* Header - Ultra Compact */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 bg-gradient-to-br from-[#EFFFFA] to-[#D9F3EE] rounded-lg flex items-center justify-center flex-shrink-0 border border-[#D9F3EE] group-hover:from-[#1CC2B1] group-hover:to-[#0E3554] group-hover:border-[#1CC2B1] transition-all duration-300">
            <FolderOpen className="w-3.5 h-3.5 text-[#0E3554] group-hover:text-white transition-colors" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-[#0E3554] truncate leading-tight mb-0.5 group-hover:text-[#1CC2B1] transition-colors">
              {project.projectName}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{project.location}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <StatusBadge status={project.status} compact={true} />

          {showActions && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMenu();
                }}
                className="p-1 text-slate-400 hover:text-[#0E3554] hover:bg-[#EFFFFA] rounded-md transition-colors"
              >
                <MoreVertical className="w-3 h-3" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-7 bg-white rounded-lg shadow-lg border border-[#D9F3EE] py-1 z-10 min-w-28">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(project);
                    }}
                    className="w-full px-2 py-1.5 text-left text-xs text-[#0E3554] hover:bg-[#EFFFFA] flex items-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(project._id);
                    }}
                    className="w-full px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
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

      {/* Task Stats - Compact */}
      {taskStats && (
        <div className="flex items-center justify-between mb-3 px-1">
          {/* Total Tasks */}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-[#EFFFFA] rounded flex items-center justify-center border border-[#D9F3EE]">
              <span className="text-[10px] font-bold text-[#0E3554]">
                {taskStats.total}
              </span>
            </div>
            <span className="text-[10px] text-slate-600 font-medium">
              Tasks
            </span>
          </div>

          {/* Status Breakdown */}
          <div className="flex items-center gap-2">
            {/* To Do */}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
              <span className="text-[10px] font-semibold text-slate-700">
                {taskStats.byStatus.todo}
              </span>
            </div>

            {/* In Progress */}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#E6A93A] rounded-full"></div>
              <span className="text-[10px] font-semibold text-slate-700">
                {taskStats.byStatus.in_progress}
              </span>
            </div>

            {/* Done */}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#1CC2B1] rounded-full"></div>
              <span className="text-[10px] font-semibold text-slate-700">
                {taskStats.byStatus.done}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Project Details - Compact Layout */}
      <div className="space-y-2">
        {/* Manager and Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <User className="w-3 h-3" />
            <span className="font-medium truncate max-w-16">
              {project.projectManager?.name?.split(" ")[0] || "N/A"}
            </span>
            {/* User Color Indicator */}
            <span
              className={`w-2 h-2 rounded-full ${userColorClass}`}
              style={
                isHexColor
                  ? { backgroundColor: project.projectManager?.color }
                  : {}
              }
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <FolderOpen className="w-3 h-3" />
            <span className="font-medium truncate max-w-16">
              {project.projectType?.name || "N/A"}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
          <div className="flex items-center gap-1 text-slate-600">
            <Calendar className="w-3 h-3" />
            <span className="font-medium">Start</span>
          </div>
          <span className="font-semibold text-[#0E3554] text-[10px]">
            {project.startDate
              ? new Date(project.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </span>

          <div className="w-px h-3 bg-slate-300 mx-1"></div>

          <div className="flex items-center gap-1 text-slate-600">
            <span className="font-medium">End</span>
          </div>
          <span className="font-semibold text-[#0E3554] text-[10px]">
            {project.endDate
              ? new Date(project.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <BarChart3 className="w-3 h-3" />
            <span>Click to view tasks</span>
          </div>
          <div className="w-6 h-6 bg-[#EFFFFA] rounded-full flex items-center justify-center border border-[#D9F3EE] group-hover:bg-[#1CC2B1] group-hover:border-[#1CC2B1] transition-colors">
            <Users className="w-3 h-3 text-[#0E3554] group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

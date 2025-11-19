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
  Eye,
} from "lucide-react";
import { Project } from "@/types/project";
import StatusBadge from "./StatusBadge";

interface ProjectListItemProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onViewTasks: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  showActions?: boolean;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({
  project,
  onEdit,
  onDelete,
  onViewTasks,
  menuOpen,
  onToggleMenu,
  showActions = true,
}) => (
  <div className="bg-white rounded-xl p-3 border border-[#D9F3EE] hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-[#EFFFFA] rounded-lg flex items-center justify-center flex-shrink-0 border border-[#D9F3EE]">
          <FolderOpen className="w-4 h-4 text-[#0E3554]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-[#0E3554] truncate">
              {project.projectName}
            </h3>
            <StatusBadge status={project.status} compact={true} />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-24">{project.location}</span>
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate max-w-20">
                {project.projectManager?.name || "N/A"}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className="whitespace-nowrap">
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onViewTasks}
          className="px-2.5 py-1 bg-[#EFFFFA] text-[#0E3554] rounded-lg font-medium hover:bg-[#1CC2B1] hover:text-white transition-colors flex items-center gap-1 text-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          Tasks
        </button>

        {showActions && (
          <div className="relative">
            <button
              onClick={onToggleMenu}
              className="p-1.5 text-slate-400 hover:text-[#0E3554] hover:bg-[#EFFFFA] rounded-lg transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-[#D9F3EE] py-1 z-10 min-w-28">
                <button
                  onClick={() => onEdit(project)}
                  className="w-full px-2.5 py-1.5 text-left text-xs text-[#0E3554] hover:bg-[#EFFFFA] flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(project._id)}
                  className="w-full px-2.5 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ProjectListItem;

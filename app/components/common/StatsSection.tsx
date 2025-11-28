"use client";

import React from "react";
import {
  FolderOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

// Types
interface ProjectStatsData {
  total: number;
  planned: number;
  active: number;
  completed: number;
  overdueProjects: number;
}

interface TaskStatsData {
  total: number;
  byStatus: {
    todo: number;
    in_progress: number;
    done: number;
  };
  overdue: number;
}

interface StatsSectionProps {
  stats: ProjectStatsData | TaskStatsData;
  type: "projects" | "tasks";
  onStatsCardClick?: (status: string) => void;
  activeFilter?: string;
}

const PROJECTS_STATS_CONFIG = [
  {
    id: "total",
    label: "Total Projects",
    icon: FolderOpen,
    color: "text-[#0E3554]",
    bgColor: "bg-[#E1F3F0]",
    mainBgColor: "bg-[#e0e0e0]",
    filterValue: "all",
  },
  {
    id: "planned",
    label: "Planned",
    icon: Clock,
    color: "text-[#0E3554]",
    bgColor: "bg-[#E0FFFA]",
    mainBgColor: "bg-[#8CA9FF]",
    filterValue: "planned",
  },
  {
    id: "active",
    label: "In Progress",
    icon: TrendingUp,
    color: "text-[#1CC2B1]",
    bgColor: "bg-[#FFF4DD]",
    mainBgColor: "bg-[#FFF2C6]",
    filterValue: "active",
  },
  {
    id: "completed",
    label: "Completed",
    icon: CheckCircle,
    color: "text-[#1CC2B1]",
    bgColor: "bg-[#E1F3F0]",
    mainBgColor: "bg-[#8BAE66]",
    filterValue: "completed",
  },
  {
    id: "overdueProjects",
    label: "Overdue",
    icon: AlertTriangle,
    color: "text-[#DC2626]",
    bgColor: "bg-[#FEE2E2]",
    mainBgColor: "bg-[#EF4444]",
    filterValue: "overdue",
  },
] as const;

const TASKS_STATS_CONFIG = [
  {
    id: "total",
    label: "Total Tasks",
    icon: FileText,
    color: "text-[#0E3554]",
    bgColor: "bg-[#E1F3F0]",
    mainBgColor: "bg-[#ffffff]",
    filterValue: "all",
  },
  {
    id: "todo",
    label: "To Do",
    icon: Clock,
    color: "text-[#0E3554]",
    bgColor: "bg-[#E0FFFA]",
    mainBgColor: "bg-[#ffffff]",
    filterValue: "todo",
  },
  {
    id: "in_progress",
    label: "In Progress",
    icon: BarChart3,
    color: "text-[#1CC2B1]",
    bgColor: "bg-[#FFF4DD]",
    mainBgColor: "bg-[#ffffff]",
    filterValue: "in_progress",
  },
  {
    id: "done",
    label: "Completed",
    icon: CheckCircle,
    color: "text-[#1CC2B1]",
    bgColor: "bg-[#E1F3F0]",
    mainBgColor: "bg-[#ffffff]",
    filterValue: "done",
  },
  {
    id: "overdue",
    label: "Overdue",
    icon: AlertTriangle,
    color: "text-[#DC2626]",
    bgColor: "bg-[#FEE2E2]",
    mainBgColor: "bg-[#ffffff]",
    filterValue: "overdue",
  },
] as const;

export default function StatsSection({
  stats,
  type,
  onStatsCardClick,
  activeFilter,
}: StatsSectionProps) {
  const config =
    type === "projects" ? PROJECTS_STATS_CONFIG : TASKS_STATS_CONFIG;

  // Helper function to get the value based on type and stat id
  const getValue = (statId: string): number => {
    if (type === "projects") {
      const projectStats = stats as ProjectStatsData;
      return projectStats[statId as keyof ProjectStatsData] || 0;
    } else {
      const taskStats = stats as TaskStatsData;
      if (statId === "total") {
        return taskStats.total || 0;
      } else if (statId === "overdue") {
        return taskStats.overdue || 0;
      } else {
        return (
          taskStats.byStatus[statId as keyof typeof taskStats.byStatus] || 0
        );
      }
    }
  };

  // Calculate total for percentage calculation
  const totalValue =
    type === "projects"
      ? (stats as ProjectStatsData).total
      : (stats as TaskStatsData).total;

  const handleCardClick = (filterValue: string) => {
    if (onStatsCardClick) {
      onStatsCardClick(filterValue);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      {config.map((stat) => {
        const IconComponent = stat.icon;
        const value = getValue(stat.id);
        const percentage = Math.round((value / Math.max(1, totalValue)) * 100);
        const isActive = activeFilter === stat.filterValue;

        return (
          <div
            key={stat.id}
            className={`${
              stat.mainBgColor
            } rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-white/30 hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden cursor-pointer ${
              isActive
                ? "ring-1 sm:ring-2 ring-[#0E3554] ring-offset-1 sm:ring-offset-2"
                : ""
            }`}
            onClick={() => handleCardClick(stat.filterValue)}
          >
            {/* Subtle shine effect */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                {/* Icon and main content */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-105 sm:group-hover:scale-110 transition-all duration-300 shadow-sm sm:shadow-md border border-white/30`}
                  >
                    <IconComponent
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] xs:text-xs font-semibold text-[#0E3554]/80 uppercase tracking-wide truncate">
                      {stat.label}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-[#0E3554] mt-0.5 truncate">
                      {value}
                    </div>
                  </div>
                </div>

                {/* Compact percentage - hidden on extra small screens */}
                <div className="hidden xs:block text-right">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/40 rounded-full flex items-center justify-center border border-white/50 shadow-sm sm:shadow-md">
                    <span className="text-xs sm:text-sm font-bold text-[#0E3554]">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Compact progress bar */}
              <div className="mt-2 sm:mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] xs:text-xs font-medium text-[#0E3554]/70">
                    Progress
                  </span>
                  <span className="text-[10px] xs:text-xs font-bold text-[#0E3554]">
                    {percentage}%
                  </span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-1 sm:h-1.5 shadow-inner overflow-hidden">
                  <div
                    className={`h-1 sm:h-1.5 rounded-full transition-all duration-700 ease-out bg-[#13d116] shadow-sm relative overflow-hidden`}
                    style={{ width: `${percentage}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shimmer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Corner accents */}
            <div className="absolute top-1 right-1 w-1.5 h-1.5 sm:top-1.5 sm:right-1.5 sm:w-2 sm:h-2 border-t border-r border-white/40 rounded-tr" />
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 sm:bottom-1.5 sm:left-1.5 sm:w-2 sm:h-2 border-b border-l border-white/40 rounded-bl" />

            {/* Active indicator */}
            {isActive && (
              <div className="absolute top-1 right-1 w-1.5 h-1.5 sm:top-1.5 sm:right-1.5 sm:w-1.5 sm:h-1.5 bg-[#0E3554] rounded-full animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
}

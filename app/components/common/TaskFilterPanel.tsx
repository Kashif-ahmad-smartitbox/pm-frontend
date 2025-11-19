"use client";

import React from "react";
import {
  Filter,
  X,
  ChevronDown,
  Clock,
  AlertTriangle,
  TrendingUp,
  User,
  Calendar,
} from "lucide-react";

// Types
type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high" | "critical";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface TaskFilters {
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  assignee: string | "all";
  dueDate: "all" | "today" | "week" | "overdue";
}

interface TaskFilterPanelProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  onClearFilters: () => void;
  assignees: User[];
}

const TaskFilterPanel: React.FC<TaskFilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  assignees,
}) => {
  const hasActiveFilters =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.assignee !== "all" ||
    filters.dueDate !== "all";

  const filterConfigs = [
    {
      key: "status" as const,
      options: [
        { value: "all", label: "All Status" },
        { value: "todo", label: "To Do" },
        { value: "in_progress", label: "In Progress" },
        { value: "done", label: "Done" },
      ],
      icon: Clock,
      iconColor: "text-blue-500",
    },
    {
      key: "priority" as const,
      options: [
        { value: "all", label: "All Priority" },
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical" },
      ],
      icon: AlertTriangle,
      iconColor: "text-orange-500",
    },
    {
      key: "assignee" as const,
      options: [
        { value: "all", label: "All Assignees" },
        ...assignees.map((a) => ({ value: a._id, label: a.name })),
      ],
      icon: User,
      iconColor: "text-purple-500",
    },
    {
      key: "dueDate" as const,
      options: [
        { value: "all", label: "Any Date" },
        { value: "today", label: "Today" },
        { value: "week", label: "This Week" },
        { value: "overdue", label: "Overdue" },
      ],
      icon: Calendar,
      iconColor: "text-green-500",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "text-[#1CC2B1]";
      case "medium":
        return "text-[#E6A93A]";
      case "high":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return Clock;
      case "in_progress":
        return TrendingUp;
      case "done":
        return "✓";
      default:
        return Clock;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E1F3F0] p-3 mb-3">
      {/* Main Filter Row */}
      <div className="flex items-center gap-2">
        {/* Filter Icon */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <div className="p-1 bg-[#F0F7FF] rounded">
            <Filter className="w-3 h-3 text-[#0E3554]" />
          </div>
          <span>Filters:</span>
        </div>

        {/* Filter Controls */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-1.5">
          {filterConfigs.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <div key={filter.key} className="relative group">
                <select
                  value={filters[filter.key]}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      [filter.key]: e.target.value,
                    })
                  }
                  className="w-full p-1.5 pr-6 pl-7 border border-[#E1F3F0] rounded-lg text-xs appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1] transition-all hover:border-[#1CC2B1] cursor-pointer"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <IconComponent
                  className={`w-3 h-3 absolute left-2.5 top-1/2 transform -translate-y-1/2 ${filter.iconColor}`}
                />
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Clear Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all duration-200 flex items-center gap-1 font-medium whitespace-nowrap"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-100">
          {filterConfigs.map((filter) => {
            const value = filters[filter.key];
            if (value === "all") return null;

            let displayLabel =
              filter.options.find((opt) => opt.value === value)?.label || value;

            if (filter.key === "assignee") {
              displayLabel =
                assignees.find((a) => a._id === value)?.name || displayLabel;
            }

            const IconComponent = filter.icon;

            return (
              <div
                key={filter.key}
                className="px-2 py-1 bg-[#F8FDFC] text-[#0E3554] rounded-lg text-xs flex items-center gap-1.5 border border-[#E1F3F0] group hover:border-[#1CC2B1] transition-colors"
              >
                <IconComponent className={`w-3 h-3 ${filter.iconColor}`} />
                <span
                  className={`${
                    filter.key === "priority"
                      ? getPriorityColor(value)
                      : "text-[#0E3554]"
                  }`}
                >
                  {displayLabel}
                </span>
                <button
                  onClick={() =>
                    onFiltersChange({ ...filters, [filter.key]: "all" })
                  }
                  className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded hover:bg-slate-200 ml-1"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskFilterPanel;

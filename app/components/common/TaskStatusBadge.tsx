"use client";

import React from "react";
import { Clock, BarChart3, CheckCircle } from "lucide-react";

const TASK_STATUS_CONFIG = {
  todo: {
    label: "To Do",
    shortLabel: "Todo",
    color: "bg-slate-100 text-slate-700 border-slate-300",
    icon: Clock,
    iconColor: "text-slate-600",
  },
  in_progress: {
    label: "In Progress",
    shortLabel: "Progress",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: BarChart3,
    iconColor: "text-blue-600",
  },
  done: {
    label: "Done",
    shortLabel: "Done",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
} as const;

interface TaskStatusBadgeProps {
  status: "todo" | "in_progress" | "done";
  compact?: boolean;
  showIcon?: boolean;
  showLabel?: boolean;
}

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  compact = false,
  showIcon = true,
  showLabel = true,
}) => {
  const config = TASK_STATUS_CONFIG[status];
  const IconComponent = config.icon;

  // Ultra compact - icon only
  if (compact && !showLabel) {
    return (
      <div
        className={`p-1 rounded border ${config.color} ${config.iconColor} flex items-center justify-center`}
        title={config.label}
      >
        <IconComponent className="w-2.5 h-2.5" />
      </div>
    );
  }

  // Compact with text
  if (compact) {
    return (
      <span
        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${config.color} flex items-center gap-1 max-w-max`}
        title={config.label}
      >
        {showIcon && (
          <IconComponent className={`w-2.5 h-2.5 ${config.iconColor}`} />
        )}
        <span className="truncate">{config.shortLabel}</span>
      </span>
    );
  }

  // Regular size
  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-semibold border ${config.color} flex items-center gap-1.5 max-w-max`}
    >
      {showIcon && <IconComponent className={`w-3 h-3 ${config.iconColor}`} />}
      {showLabel && config.label}
    </span>
  );
};

export default TaskStatusBadge;

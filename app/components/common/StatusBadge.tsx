"use client";

import React from "react";
import { Clock, TrendingUp, CheckCircle } from "lucide-react";

const STATUS_CONFIG = {
  planned: {
    label: "Planned",
    color: "bg-[#E0FFFA] text-[#0E3554]",
    icon: Clock,
    iconColor: "text-[#0E3554]",
  },
  active: {
    label: "In Progress",
    color: "bg-[#FFF4DD] text-[#E6A93A]",
    icon: TrendingUp,
    iconColor: "text-[#E6A93A]",
  },
  completed: {
    label: "Completed",
    color: "bg-[#E1F3F0] text-[#1CC2B1]",
    icon: CheckCircle,
    iconColor: "text-[#1CC2B1]",
  },
  overdue: {
    label: "Overdue",
    color: "bg-[#E1F3F0] text-[#1CC2B1]",
    icon: CheckCircle,
    iconColor: "text-[#1CC2B1]",
  },
} as const;

interface StatusBadgeProps {
  status: "planned" | "active" | "completed" | "overdue";
  compact?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  compact = false,
}) => {
  const config = STATUS_CONFIG[status];
  const IconComponent = config.icon;

  if (compact) {
    return (
      <span
        className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium ${config.color} flex items-center gap-1`}
        title={config.label}
      >
        <IconComponent className={`w-2.5 h-2.5 ${config.iconColor}`} />
        <span className="hidden sm:inline">{config.label}</span>
      </span>
    );
  }

  return (
    <span
      className={`px-2 py-1 rounded-lg text-xs font-medium ${config.color} flex items-center gap-1.5`}
    >
      <IconComponent className={`w-3 h-3 ${config.iconColor}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;

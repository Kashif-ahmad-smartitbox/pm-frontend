"use client";

import React from "react";
import { TrendingUp, AlertCircle, AlertTriangle, Target } from "lucide-react";

const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    shortLabel: "Low",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: TrendingUp,
    iconColor: "text-emerald-600",
  },
  medium: {
    label: "Medium",
    shortLabel: "Medium",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: AlertCircle,
    iconColor: "text-amber-600",
  },
  high: {
    label: "High",
    shortLabel: "High",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    icon: AlertTriangle,
    iconColor: "text-orange-600",
  },
  critical: {
    label: "Critical",
    shortLabel: "Critical",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: Target,
    iconColor: "text-red-600",
  },
} as const;

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high" | "critical";
  compact?: boolean;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "xs" | "sm" | "md";
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  compact = false,
  showIcon = true,
  showLabel = true,
  size = "sm",
}) => {
  const config = PRIORITY_CONFIG[priority];
  const IconComponent = config.icon;

  const sizeClasses = {
    xs: "text-[10px] px-1 py-0.5",
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
  };

  const iconSizes = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
  };

  // Ultra compact - dot only
  if (compact && !showIcon && !showLabel) {
    return (
      <div
        className={`w-2 h-2 rounded-full ${
          config.color.split(" ")[0]
        } border border-white shadow-sm`}
        title={config.label}
      />
    );
  }

  // Icon only variant
  if (compact && !showLabel) {
    return (
      <div
        className={`p-1 rounded border ${config.color} flex items-center justify-center`}
        title={config.label}
      >
        <IconComponent className={iconSizes[size]} />
      </div>
    );
  }

  // Compact with text
  if (compact) {
    return (
      <span
        className={`${sizeClasses[size]} rounded font-semibold border ${config.color} flex items-center gap-1 max-w-max`}
        title={config.label}
      >
        {showIcon && <IconComponent className={iconSizes[size]} />}
        {showLabel && <span className="truncate">{config.shortLabel}</span>}
      </span>
    );
  }

  // Regular size
  return (
    <span
      className={`${sizeClasses.md} rounded-md font-semibold border ${config.color} flex items-center gap-1.5 max-w-max`}
    >
      {showIcon && <IconComponent className={iconSizes.md} />}
      {showLabel && config.label}
    </span>
  );
};

export default PriorityBadge;

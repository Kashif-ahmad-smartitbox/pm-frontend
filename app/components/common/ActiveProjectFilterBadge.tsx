import React from "react";
import {
  Trash2,
  X,
  Clock,
  Rocket,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type ProjectStatus = "planned" | "active" | "completed" | "overdue";

const ActiveProjectFilterBadge = ({
  filter,
  onClear,
}: {
  filter: ProjectStatus | "all";
  onClear: () => void;
}) => {
  if (filter === "all") return null;

  const PROJECT_STATUS_CONFIG = {
    planned: {
      label: "Planned Projects",
      color: "bg-[#E0FFFA] text-[#0E3554] border-[#8CA9FF]",
      icon: Clock,
      iconColor: "text-[#0E3554]",
    },
    active: {
      label: "Active Projects",
      color: "bg-[#FFF4DD] text-[#0E3554] border-[#FFD166]",
      icon: Rocket,
      iconColor: "text-[#0E3554]",
    },
    completed: {
      label: "Completed Projects",
      color: "bg-[#E1F3F0] text-[#0E3554] border-[#06D6A0]",
      icon: CheckCircle,
      iconColor: "text-[#0E3554]",
    },
    overdue: {
      label: "Overdue Projects",
      color: "bg-[#FEE2E2] text-[#DC2626] border-[#EF4444]",
      icon: AlertTriangle,
      iconColor: "text-[#DC2626]",
    },
  } as const;

  const config = PROJECT_STATUS_CONFIG[filter];
  const IconComponent = config.icon;

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#E1F3F0] shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#0E3554]">
          Active Filter:
        </span>
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${config.color} border flex items-center gap-1.5 transition-all duration-200 hover:shadow-sm`}
        >
          <IconComponent className={`w-3.5 h-3.5 ${config.iconColor}`} />
          {config.label}
        </span>
      </div>
      <button
        onClick={onClear}
        className="text-slate-400 hover:text-red-500 transition-all duration-200 p-1 hover:bg-red-50 rounded-md group"
        title="Clear filter"
      >
        <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

export default ActiveProjectFilterBadge;

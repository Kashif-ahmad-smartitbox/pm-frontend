import React from "react";
import { Trash2 } from "lucide-react";

type ProjectStatus = "planned" | "active" | "completed";

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
      label: "Planned",
      color: "bg-slate-100 text-slate-700 border-slate-300",
    },
    active: {
      label: "Active",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    completed: {
      label: "Completed",
      color: "bg-green-50 text-green-700 border-green-200",
    },
  } as const;

  const config = PROJECT_STATUS_CONFIG[filter];

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-[#D9F3EE]">
      <span className="text-xs text-slate-600">Filter:</span>
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium ${config.color} border`}
      >
        {config.label}
      </span>
      <button
        onClick={onClear}
        className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
        title="Clear filter"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
};

export default ActiveProjectFilterBadge;

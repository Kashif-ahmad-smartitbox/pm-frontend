import React from "react";

type TaskStatus = "todo" | "in_progress" | "done";

const TaskStatusTabs = ({
  activeStatus,
  onStatusChange,
  stats,
}: {
  activeStatus: TaskStatus | "all";
  onStatusChange: (status: TaskStatus | "all") => void;
  stats: {
    total: number;
    byStatus: {
      todo: number;
      in_progress: number;
      done: number;
    };
  };
}) => {
  const tabs = [
    { id: "all" as const, label: "All Tasks", count: stats.total },
    { id: "todo" as const, label: "To Do", count: stats.byStatus.todo },
    {
      id: "in_progress" as const,
      label: "In Progress",
      count: stats.byStatus.in_progress,
    },
    { id: "done" as const, label: "Completed", count: stats.byStatus.done },
  ];

  return (
    <div className="flex space-x-1 bg-[#EFFFFA] rounded-xl p-1 border border-[#D9F3EE]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onStatusChange(tab.id)}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            activeStatus === tab.id
              ? "bg-white text-[#0E3554] shadow-sm"
              : "text-slate-600 hover:text-[#0E3554] hover:bg-white/50"
          }`}
        >
          <span>{tab.label}</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-xs ${
              activeStatus === tab.id
                ? "bg-[#EFFFFA] text-[#0E3554]"
                : "bg-white text-slate-600"
            }`}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TaskStatusTabs;

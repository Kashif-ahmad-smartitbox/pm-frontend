import React from "react";

const LoadingTasksState = () => (
  <div className="text-center py-8">
    <div className="w-6 h-6 border-2 border-[#D9F3EE] border-t-[#1CC2B1] rounded-full animate-spin mx-auto"></div>
    <p className="mt-2 text-slate-600 text-xs font-medium">Loading tasks...</p>
  </div>
);

export default LoadingTasksState;

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  BarChart3,
  Filter,
  Search,
  FileText,
  Calendar,
  MapPin,
  User,
  FolderOpen,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  Clock,
  Download,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Printer,
  ArrowUpDown,
  Edit,
} from "lucide-react";
import {
  CombinedProjectsReportResponse,
  ReportProject,
  ReportTask,
  ReportNote,
  getCombinedProjectsReport,
} from "@/lib/api/reports";

interface CombinedProjectsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskClick?: (task: ReportTask) => void;
  onChatClick?: (task: ReportTask) => void;
}

// Helper functions for styling
const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "completed":
    case "done":
      return "bg-[#E1F3F0] text-[#1CC2B1] border-[#D9F3EE]";
    case "active":
    case "in_progress":
      return "bg-[#FFF4DD] text-[#E6A93A] border-[#FAE8C8]";
    case "planned":
    case "todo":
    default:
      return "bg-[#E0FFFA] text-[#0E3554] border-[#D9F3EE]";
  }
};

const getPriorityBadgeStyles = (priority: string) => {
  switch (priority) {
    case "critical":
      return "bg-red-50 text-red-700 border-red-200";
    case "high":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "medium":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "low":
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "done":
    case "completed":
      return CheckCircle;
    case "in_progress":
    case "active":
      return PlayCircle;
    case "todo":
    case "planned":
    default:
      return Clock;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "No date";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isTaskOverdue = (task: ReportTask): boolean => {
  if (task.status === "done") return false;
  if (!task.dueDate) return false;
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  return dueDate < today;
};

// Filter interface
interface ReportFilters {
  projectSearch: string;
  projectStatus: string;
  projectManagerId: string;
  taskSearch: string;
  taskStatus: string;
  taskPriority: string;
  taskAssigneeId: string;
  projectFrom: string;
  projectTo: string;
}

const DEFAULT_FILTERS: ReportFilters = {
  projectSearch: "",
  projectStatus: "",
  projectManagerId: "",
  taskSearch: "",
  taskStatus: "",
  taskPriority: "",
  taskAssigneeId: "",
  projectFrom: "",
  projectTo: "",
};

// Stats filter type
type StatsFilter = "all" | "totalProjects" | "totalTasks" | "completedTasks" | "inProgressTasks" | "todoTasks" | "overdueTasks";

// Sorting types
type SortField =
  | "projectName"
  | "status"
  | "totalTasks"
  | "completionRate"
  | "overdueTasks"
  | "endDate";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const CombinedProjectsReportModal: React.FC<
  CombinedProjectsReportModalProps
> = ({ isOpen, onClose, onTaskClick, onChatClick }) => {
  // State
  const [reportData, setReportData] =
    useState<CombinedProjectsReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "projectName",
    direction: "asc",
  });
  const [statsFilter, setStatsFilter] = useState<StatsFilter>("all");
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCombinedProjectsReport({
        page: 1,
        limit: 50,
        tasksLimitPerProject: 20,
        projectStatus: filters.projectStatus || undefined,
        projectSearch: filters.projectSearch || undefined,
        projectManagerId: filters.projectManagerId || undefined,
        taskStatus: filters.taskStatus || undefined,
        taskPriority: filters.taskPriority || undefined,
        taskAssigneeId: filters.taskAssigneeId || undefined,
        taskSearch: filters.taskSearch || undefined,
        projectFrom: filters.projectFrom || undefined,
        projectTo: filters.projectTo || undefined,
      });

      setReportData(data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load report data"
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
      fetchReportData();
    }
  }, [isOpen, fetchReportData]);

  // Handle filter changes
  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setStatsFilter("all");
  };

  // Toggle project expansion
  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // Handle stats card click
  const handleStatsCardClick = (cardType: StatsFilter) => {
    setStatsFilter(cardType === statsFilter ? "all" : cardType);
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle chat click with modal close
  const handleChatClick = (task: ReportTask) => {
    if (onChatClick) {
      onChatClick(task);
    }
    onClose();
  };

  // Handle task click with modal close
  const handleTaskClick = (task: ReportTask) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
    onClose();
  };

  // Calculate totals and sorted projects
  const { totals, sortedProjects } = useMemo(() => {
    if (!reportData) return { totals: null, sortedProjects: [] };

    const totals = reportData.projects.reduce(
      (acc, project) => {
        acc.totalProjects++;
        acc.totalTasks += project.taskStats?.total || 0;
        acc.completedTasks += project.taskStats?.done || 0;
        acc.inProgressTasks += project.taskStats?.in_progress || 0;
        acc.todoTasks += project.taskStats?.todo || 0;
        acc.overdueTasks += project.taskStats?.overdue || 0;
        acc.overdueProjects += project.projectOverdue ? 1 : 0;

        return acc;
      },
      {
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        overdueTasks: 0,
        overdueProjects: 0,
      }
    );

    // Filter projects and their tasks based on statsFilter
    let filteredProjects = reportData.projects.map((project) => {
      // If no filter or showing all, return project as is
      if (statsFilter === "all" || statsFilter === "totalProjects") {
        return project;
      }

      // Filter tasks within the project based on statsFilter
      let filteredTasks = project.tasks;
      
      switch (statsFilter) {
        case "completedTasks":
          filteredTasks = project.tasks.filter((task) => task.status === "done");
          break;
        case "inProgressTasks":
          filteredTasks = project.tasks.filter((task) => task.status === "in_progress");
          break;
        case "todoTasks":
          filteredTasks = project.tasks.filter((task) => task.status === "todo");
          break;
        case "overdueTasks":
          filteredTasks = project.tasks.filter((task) => isTaskOverdue(task));
          break;
        case "totalTasks":
          // Show all tasks
          filteredTasks = project.tasks;
          break;
      }

      // Return project with filtered tasks
      return {
        ...project,
        tasks: filteredTasks,
      };
    }).filter((project) => {
      // Only show projects that have tasks after filtering
      // (or show all projects if statsFilter is "all" or "totalProjects")
      if (statsFilter === "all" || statsFilter === "totalProjects") {
        return true;
      }
      return project.tasks.length > 0;
    });

    // Sort projects - FIXED: Handle undefined dates
    const sorted = filteredProjects.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortConfig.field) {
        case "projectName":
          aValue = a.projectName.toLowerCase();
          bValue = b.projectName.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "totalTasks":
          aValue = a.taskStats?.total || 0;
          bValue = b.taskStats?.total || 0;
          break;
        case "completionRate":
          aValue =
            (a.taskStats?.done || 0) / Math.max(1, a.taskStats?.total || 0);
          bValue =
            (b.taskStats?.done || 0) / Math.max(1, b.taskStats?.total || 0);
          break;
        case "overdueTasks":
          aValue = a.taskStats?.overdue || 0;
          bValue = b.taskStats?.overdue || 0;
          break;
        case "endDate":
          // Handle undefined dates by using a fallback value
          aValue = a.endDate ? new Date(a.endDate).getTime() : 0;
          bValue = b.endDate ? new Date(b.endDate).getTime() : 0;
          break;
        default:
          aValue = a.projectName;
          bValue = b.projectName;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return { totals, sortedProjects: sorted };
  }, [reportData, sortConfig, statsFilter]);

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  // Export functions
  const exportToCSV = () => {
    if (!reportData) return;

    const headers = [
      "Project Name",
      "Location",
      "Project Manager",
      "Project Type",
      "Status",
      "Start Date",
      "End Date",
      "Total Tasks",
      "Todo",
      "In Progress",
      "Completed",
      "Overdue",
      "Task Title",
      "Task Description",
      "Task Status",
      "Task Priority",
      "Task Due Date",
      "Task Assignees",
      "Notes Count",
    ];

    const rows = reportData.projects.flatMap((project) => {
      const baseRow = [
        project.projectName,
        project.location,
        project.projectManager?.name || "",
        project.projectType?.name || "",
        project.status,
        formatDate(project.startDate),
        formatDate(project.endDate),
        project.taskStats?.total || 0,
        project.taskStats?.todo || 0,
        project.taskStats?.in_progress || 0,
        project.taskStats?.done || 0,
        project.taskStats?.overdue || 0,
      ];

      if (project.tasks && project.tasks.length > 0) {
        return project.tasks.map((task) => [
          ...baseRow,
          task.title,
          task.description,
          task.status,
          task.priority,
          formatDate(task.dueDate),
          task.assignees.map((a) => a.name).join(", "),
          task.notes?.length || 0,
        ]);
      }

      return [[...baseRow, "", "", "", "", "", "", "", ""]];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `projects-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    setShowExportMenu(false);
  };

  const printReport = () => {
    window.print();
    setShowExportMenu(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-sm border border-[#D9F3EE] w-full max-w-7xl h-[90vh] sm:h-[85vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-[#D9F3EE] p-3 sm:p-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#EFFFFA] rounded-lg flex items-center justify-center shrink-0">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-[#0E3554]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-[#0E3554] truncate">
                  Project Reports
                </h2>
                <p className="text-slate-600 text-xs mt-0.5 truncate">
                  {reportData
                    ? `${reportData.total} projects, ${
                        totals?.totalTasks || 0
                      } tasks`
                    : "Loading report..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Export Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-3 py-1.5 text-sm bg-[#0E3554] text-white rounded-lg hover:bg-[#0A2A42] transition-all duration-200 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-[#D9F3EE] z-10">
                    <button
                      onClick={exportToCSV}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Export as CSV
                    </button>
                    {/* <button
                      onClick={printReport}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Report
                    </button> */}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  showFilters || hasActiveFilters
                    ? "bg-[#1CC2B1] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white text-[#1CC2B1] text-xs rounded-full">
                    {Object.values(filters).filter((v) => v !== "").length}
                  </span>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-slate-600 hover:text-[#0E3554] hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-b border-[#D9F3EE] p-3 sm:p-4 bg-gray-50 shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Project Search */}
              <div>
                <label className="block text-xs font-semibold text-[#0E3554] mb-1">
                  Project Name
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filters.projectSearch}
                    onChange={(e) =>
                      handleFilterChange("projectSearch", e.target.value)
                    }
                    placeholder="Search projects..."
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-[#D9F3EE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] bg-white"
                  />
                </div>
              </div>

              {/* Project Status */}
              <div>
                <label className="block text-xs font-semibold text-[#0E3554] mb-1">
                  Project Status
                </label>
                <select
                  value={filters.projectStatus}
                  onChange={(e) =>
                    handleFilterChange("projectStatus", e.target.value)
                  }
                  className="w-full px-3 py-1.5 text-sm border border-[#D9F3EE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] bg-white"
                >
                  <option value="">All Status</option>
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              {/* Project Manager */}
              <div>
                <label className="block text-xs font-semibold text-[#0E3554] mb-1">
                  Project Manager
                </label>
                <select
                  value={filters.projectManagerId}
                  onChange={(e) =>
                    handleFilterChange("projectManagerId", e.target.value)
                  }
                  className="w-full px-3 py-1.5 text-sm border border-[#D9F3EE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] bg-white"
                >
                  <option value="">All Managers</option>
                  {(() => {
                    // Get unique managers properly
                    const uniqueManagers = new Map();

                    reportData?.projects.forEach((project) => {
                      const manager = project.projectManager;
                      if (manager && manager._id && manager.name) {
                        if (!uniqueManagers.has(manager._id)) {
                          uniqueManagers.set(manager._id, {
                            _id: manager._id,
                            name: manager.name,
                          });
                        }
                      }
                    });

                    return Array.from(uniqueManagers.values()).map(
                      (manager) => (
                        <option key={manager._id} value={manager._id}>
                          {manager.name}
                        </option>
                      )
                    );
                  })()}
                </select>
              </div>

              {/* Task Search */}
              <div>
                <label className="block text-xs font-semibold text-[#0E3554] mb-1">
                  Task Title
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filters.taskSearch}
                    onChange={(e) =>
                      handleFilterChange("taskSearch", e.target.value)
                    }
                    placeholder="Search tasks..."
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-[#D9F3EE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] bg-white"
                  />
                </div>
              </div>

              {/* Task Status */}
              <div>
                <label className="block text-xs font-semibold text-[#0E3554] mb-1">
                  Task Status
                </label>
                <select
                  value={filters.taskStatus}
                  onChange={(e) =>
                    handleFilterChange("taskStatus", e.target.value)
                  }
                  className="w-full px-3 py-1.5 text-sm border border-[#D9F3EE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] bg-white"
                >
                  <option value="">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Completed</option>
                </select>
              </div>

              {/* Task Priority */}
              <div>
                <label className="block text-xs font-semibold text-[#0E3554] mb-1">
                  Task Priority
                </label>
                <select
                  value={filters.taskPriority}
                  onChange={(e) =>
                    handleFilterChange("taskPriority", e.target.value)
                  }
                  className="w-full px-3 py-1.5 text-sm border border-[#D9F3EE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] bg-white"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Date Range - From */}
              <div>
                <label className="block text-xs font-semibold text-[#0E3554] mb-1">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={filters.projectFrom}
                    onChange={(e) =>
                      handleFilterChange("projectFrom", e.target.value)
                    }
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-[#D9F3EE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] bg-white"
                  />
                </div>
              </div>

              {/* Date Range - To */}
              <div>
                <label className="block text-xs font-semibold text-[#0E3554] mb-1">
                  To Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={filters.projectTo}
                    onChange={(e) =>
                      handleFilterChange("projectTo", e.target.value)
                    }
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-[#D9F3EE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#D9F3EE]">
              <div className="text-xs text-slate-600">
                {hasActiveFilters && "Filters applied"}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:text-[#0E3554] font-medium transition-all duration-200 hover:bg-[#EFFFFA] rounded-lg border border-[#D9F3EE]"
                >
                  Clear All
                </button>
                <button
                  onClick={fetchReportData}
                  className="px-3 py-1.5 text-sm bg-[#0E3554] text-white rounded-lg font-medium hover:bg-[#0A2A42] transition-all duration-200 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {totals && (
          <div className="border-b border-[#D9F3EE] p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-white shrink-0">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3">
              <div 
                onClick={() => handleStatsCardClick("totalProjects")}
                className={`bg-white rounded-lg p-2 sm:p-3 border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  statsFilter === "totalProjects" 
                    ? "border-[#1CC2B1] ring-2 ring-[#1CC2B1]/20" 
                    : "border-[#D9F3EE] hover:border-[#1CC2B1]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg sm:text-xl font-bold text-[#0E3554]">
                    {totals.totalProjects}
                  </div>
                  <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4 text-[#1CC2B1]" />
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  Total Projects
                </div>
              </div>

              <div 
                onClick={() => handleStatsCardClick("totalTasks")}
                className={`bg-white rounded-lg p-2 sm:p-3 border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  statsFilter === "totalTasks" 
                    ? "border-blue-500 ring-2 ring-blue-500/20" 
                    : "border-[#D9F3EE] hover:border-blue-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg sm:text-xl font-bold text-blue-600">
                    {totals.totalTasks}
                  </div>
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  Total Tasks
                </div>
              </div>

              <div 
                onClick={() => handleStatsCardClick("completedTasks")}
                className={`bg-white rounded-lg p-2 sm:p-3 border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  statsFilter === "completedTasks" 
                    ? "border-emerald-500 ring-2 ring-emerald-500/20" 
                    : "border-[#D9F3EE] hover:border-emerald-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg sm:text-xl font-bold text-emerald-600">
                    {totals.completedTasks}
                  </div>
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  Completed
                </div>
              </div>

              <div 
                onClick={() => handleStatsCardClick("inProgressTasks")}
                className={`bg-white rounded-lg p-2 sm:p-3 border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  statsFilter === "inProgressTasks" 
                    ? "border-amber-500 ring-2 ring-amber-500/20" 
                    : "border-[#D9F3EE] hover:border-amber-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg sm:text-xl font-bold text-amber-600">
                    {totals.inProgressTasks}
                  </div>
                  <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  In Progress
                </div>
              </div>

              <div 
                onClick={() => handleStatsCardClick("todoTasks")}
                className={`bg-white rounded-lg p-2 sm:p-3 border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  statsFilter === "todoTasks" 
                    ? "border-gray-500 ring-2 ring-gray-500/20" 
                    : "border-[#D9F3EE] hover:border-gray-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg sm:text-xl font-bold text-gray-600">
                    {totals.todoTasks}
                  </div>
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  To Do
                </div>
              </div>

              <div 
                onClick={() => handleStatsCardClick("overdueTasks")}
                className={`bg-white rounded-lg p-2 sm:p-3 border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  statsFilter === "overdueTasks" 
                    ? "border-red-500 ring-2 ring-red-500/20" 
                    : "border-[#D9F3EE] hover:border-red-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg sm:text-xl font-bold text-red-600">
                    {totals.overdueTasks}
                  </div>
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  Overdue
                </div>
              </div>
            </div>
            
            {/* Active Filter Indicator */}
            {statsFilter !== "all" && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  Filtering by: <span className="font-semibold text-[#0E3554]">{
                    statsFilter === "totalProjects" ? "All Projects" :
                    statsFilter === "totalTasks" ? "Projects with Tasks" :
                    statsFilter === "completedTasks" ? "Projects with Completed Tasks" :
                    statsFilter === "inProgressTasks" ? "Projects with In Progress Tasks" :
                    statsFilter === "todoTasks" ? "Projects with Todo Tasks" :
                    "Projects with Overdue Tasks"
                  }</span>
                </span>
                <button
                  onClick={() => setStatsFilter("all")}
                  className="text-xs text-[#1CC2B1] hover:text-[#0E3554] font-medium"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="h-full overflow-y-auto p-2 sm:p-4">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-[#0E3554] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Loading report data...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm mb-3">{error}</p>
                <button
                  onClick={fetchReportData}
                  className="px-4 py-2 text-sm bg-[#0E3554] text-white rounded-lg hover:bg-[#0A2A42] transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : !reportData || reportData.projects.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">No projects found</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-sm text-[#0E3554] hover:text-[#1CC2B1]"
                  >
                    Clear filters to see all projects
                  </button>
                )}
              </div>
            ) : (
              // TABLE VIEW (Always table view now)
              <div className="overflow-x-auto bg-white rounded-lg border border-[#D9F3EE]">
                <table className="w-full">
                  <thead className="bg-[#F8FDFC] border-b border-[#D9F3EE]">
                    <tr>
                      <th className="p-3 text-left text-xs font-semibold text-[#0E3554] uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("projectName")}
                          className="flex items-center gap-1 hover:text-[#1CC2B1] transition-colors"
                        >
                          Project
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-[#0E3554] uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("status")}
                          className="flex items-center gap-1 hover:text-[#1CC2B1] transition-colors"
                        >
                          Status
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-[#0E3554] uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("totalTasks")}
                          className="flex items-center gap-1 hover:text-[#1CC2B1] transition-colors"
                        >
                          Tasks
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-[#0E3554] uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("completionRate")}
                          className="flex items-center gap-1 hover:text-[#1CC2B1] transition-colors"
                        >
                          Progress
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-[#0E3554] uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("overdueTasks")}
                          className="flex items-center gap-1 hover:text-[#1CC2B1] transition-colors"
                        >
                          Overdue
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-[#0E3554] uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("endDate")}
                          className="flex items-center gap-1 hover:text-[#1CC2B1] transition-colors"
                        >
                          End Date
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-[#0E3554] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9F3EE]">
                    {sortedProjects.map((project) => {
                      const completionRate = project.taskStats?.total
                        ? Math.round(
                            ((project.taskStats?.done || 0) /
                              project.taskStats.total) *
                              100
                          )
                        : 0;
                      const isExpanded = expandedProjects.has(project._id);
                      const hasTasks = project.tasks && project.tasks.length > 0;

                      return (
                        <React.Fragment key={project._id}>
                          <tr 
                            className={`hover:bg-gray-50 transition-colors ${hasTasks ? 'cursor-pointer' : ''}`}
                            onClick={() => hasTasks && toggleProjectExpansion(project._id)}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {hasTasks ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleProjectExpansion(project._id);
                                    }}
                                    className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-[#1CC2B1]" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                ) : (
                                  <div className="w-5" />
                                )}
                                <FolderOpen className="w-4 h-4 text-[#1CC2B1]" />
                                <div>
                                  <div className="font-medium text-[#0E3554]">
                                    {project.projectName}
                                  </div>
                                  <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {project.location}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyles(
                                  project.status
                                )}`}
                              >
                                {project.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="text-sm">
                                <div className="font-medium">
                                  {project.taskStats?.total || 0}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {project.taskStats?.done || 0} done
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#1CC2B1] rounded-full"
                                      style={{ width: `${completionRate}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {completionRate}%
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {project.taskStats?.todo || 0} todo,{" "}
                                  {project.taskStats?.in_progress || 0} in
                                  progress
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div
                                className={`text-sm font-medium ${
                                  project.taskStats?.overdue
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {project.taskStats?.overdue || 0}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm">
                                {formatDate(project.endDate)}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {hasTasks && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleProjectExpansion(project._id);
                                    }}
                                    className="p-1 text-gray-600 hover:text-[#0E3554] hover:bg-gray-100 rounded transition-colors"
                                    title={isExpanded ? "Collapse Tasks" : "Expand Tasks"}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                                {onTaskClick && hasTasks && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Trigger task click for the first task (opens edit modal)
                                      handleTaskClick(project.tasks[0]);
                                    }}
                                    className="p-1 text-gray-600 hover:text-[#1CC2B1] hover:bg-[#EFFFFA] rounded transition-colors"
                                    title="Edit First Task"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Tasks sub-table - Only show when expanded */}
                          {isExpanded && hasTasks && (
                            <tr>
                              <td
                                colSpan={7}
                                className="p-0 border-t border-[#D9F3EE]"
                              >
                                <div className="bg-gray-50 p-3">
                                  <div className="text-xs font-semibold text-[#0E3554] mb-2">
                                    Tasks ({project.tasks.length})
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="text-xs text-gray-600">
                                          <th className="p-2 text-left">
                                            Task
                                          </th>
                                          <th className="p-2 text-left">
                                            Status
                                          </th>
                                          <th className="p-2 text-left">
                                            Priority
                                          </th>
                                          <th className="p-2 text-left">
                                            Due Date
                                          </th>
                                          <th className="p-2 text-left">
                                            Assignees
                                          </th>
                                          <th className="p-2 text-left">
                                            Chat
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {project.tasks.map((task) => (
                                          <tr
                                            key={task._id}
                                            className="border-b border-gray-200 last:border-0 hover:bg-gray-100 cursor-pointer transition-colors"
                                            onClick={() => handleTaskClick(task)}
                                          >
                                            <td className="p-2">
                                              <div className="font-medium text-[#0E3554] hover:text-[#1CC2B1]">
                                                {task.title}
                                              </div>
                                              <div className="text-xs text-gray-600 truncate max-w-xs">
                                                {task.description}
                                              </div>
                                            </td>
                                            <td className="p-2">
                                              <span
                                                className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeStyles(
                                                  task.status
                                                )}`}
                                              >
                                                {task.status}
                                              </span>
                                            </td>
                                            <td className="p-2">
                                              <span
                                                className={`px-2 py-1 rounded-full text-xs ${getPriorityBadgeStyles(
                                                  task.priority
                                                )}`}
                                              >
                                                {task.priority}
                                              </span>
                                            </td>
                                            <td className="p-2">
                                              <div
                                                className={`text-sm ${
                                                  isTaskOverdue(task)
                                                    ? "text-red-600 font-medium"
                                                    : ""
                                                }`}
                                              >
                                                {formatDate(task.dueDate)}
                                              </div>
                                            </td>
                                            <td className="p-2">
                                              <div className="text-xs text-gray-600">
                                                {task.assignees
                                                  ?.slice(0, 2)
                                                  .map((a) => a.name)
                                                  .join(", ")}
                                                {task.assignees &&
                                                  task.assignees.length > 2 && (
                                                    <span className="text-gray-400">
                                                      {" "}
                                                      +
                                                      {task.assignees.length -
                                                        2}
                                                    </span>
                                                  )}
                                              </div>
                                            </td>
                                            <td className="p-2">
                                              <div className="flex items-center gap-1">
                                                {onTaskClick && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleTaskClick(task);
                                                    }}
                                                    className="p-1 text-slate-600 hover:text-[#1CC2B1] hover:bg-[#EFFFFA] rounded transition-colors"
                                                    title="Edit Task"
                                                  >
                                                    <Edit className="w-3.5 h-3.5" />
                                                  </button>
                                                )}
                                                {onChatClick && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleChatClick(task);
                                                    }}
                                                    className="p-1 text-slate-600 hover:text-[#1CC2B1] hover:bg-[#EFFFFA] rounded transition-colors"
                                                    title="Open Chat"
                                                  >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                  </button>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#D9F3EE] p-3 sm:p-4 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            <div className="text-sm text-slate-600 text-center sm:text-left">
              {reportData ? (
                <>
                  Showing{" "}
                  <span className="font-semibold text-[#0E3554]">
                    {reportData.projects.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#0E3554]">
                    {reportData.total}
                  </span>{" "}
                  projects
                  {totals && (
                    <span className="text-emerald-600 font-medium ml-2">
                      (
                      {Math.round(
                        (totals.completedTasks /
                          Math.max(1, totals.totalTasks)) *
                          100
                      )}
                      % completed)
                    </span>
                  )}
                </>
              ) : (
                "Loading..."
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedProjectsReportModal;

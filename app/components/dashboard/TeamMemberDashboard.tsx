"use client";

import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  BarChart3,
  Search,
  User,
  Eye,
  FileText,
  Target,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  LogOut,
  MapPin,
  Play,
  CheckCircle2,
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

interface Note {
  _id: string;
  author: User;
  text: string;
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  project: string;
  assignees: User[];
  createdBy: User;
  status: TaskStatus;
  dueDate: string;
  priority: TaskPriority;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface TaskWithProjectDetails extends Omit<Task, "project"> {
  project: {
    _id: string;
    projectName: string;
    location: string;
  };
}

interface TasksResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  stats: {
    total: number;
    byStatus: {
      todo: number;
      in_progress: number;
      done: number;
    };
    byPriority: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    overdue: number;
  };
  tasks: TaskWithProjectDetails[];
}

// Constants
const STATS_CONFIG = [
  {
    id: "total",
    label: "Total Tasks",
    icon: FileText,
    color: "text-slate-700",
    bgColor: "bg-slate-50",
  },
  {
    id: "todo",
    label: "To Do",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "in_progress",
    label: "In Progress",
    icon: BarChart3,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: "done",
    label: "Completed",
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
] as const;

const TASK_STATUS_CONFIG = {
  todo: {
    label: "To Do",
    color: "bg-slate-50 text-slate-700",
    icon: Clock,
    iconColor: "text-slate-600",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-50 text-blue-700",
    icon: BarChart3,
    iconColor: "text-blue-600",
  },
  done: {
    label: "Done",
    color: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
  },
} as const;

const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    color: "bg-emerald-50 text-emerald-700",
    icon: TrendingUp,
  },
  medium: {
    label: "Medium",
    color: "bg-amber-50 text-amber-700",
    icon: AlertCircle,
  },
  high: {
    label: "High",
    color: "bg-orange-50 text-orange-700",
    icon: AlertTriangle,
  },
  critical: {
    label: "Critical",
    color: "bg-red-50 text-red-700",
    icon: Target,
  },
} as const;

// Custom Hooks
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Components
const TaskStatusBadge = ({ status }: { status: TaskStatus }) => {
  const config = TASK_STATUS_CONFIG[status];
  const IconComponent = config.icon;

  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${config.color} flex items-center gap-1.5`}
    >
      <IconComponent className={`w-3 h-3 ${config.iconColor}`} />
      {config.label}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  const config = PRIORITY_CONFIG[priority];
  const IconComponent = config.icon;

  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${config.color} flex items-center gap-1.5`}
    >
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const StatusButton = ({
  currentStatus,
  onStatusChange,
  taskId,
  taskTitle,
}: {
  currentStatus: TaskStatus;
  onStatusChange: (
    taskId: string,
    newStatus: TaskStatus,
    taskTitle: string
  ) => void;
  taskId: string;
  taskTitle: string;
}) => {
  if (currentStatus === "todo") {
    return (
      <button
        onClick={() => onStatusChange(taskId, "in_progress", taskTitle)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 text-sm"
      >
        <Play className="w-3 h-3" />
        <span>Start Progress</span>
      </button>
    );
  }

  if (currentStatus === "in_progress") {
    return (
      <button
        onClick={() => onStatusChange(taskId, "done", taskTitle)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200 text-sm"
      >
        <CheckCircle2 className="w-3 h-3" />
        <span>Mark Complete</span>
      </button>
    );
  }

  return (
    <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-100 text-emerald-800 rounded-lg font-semibold text-sm">
      <CheckCircle2 className="w-3 h-3" />
      <span>Completed</span>
    </div>
  );
};

const ProfileDropdown = ({
  user,
  onLogout,
}: {
  user: { name?: string; email?: string; role?: string } | null;
  onLogout: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const getRoleDisplay = (role?: string) => {
    if (!role) return "User";
    const roleMap: { [key: string]: string } = {
      admin: "Administrator",
      project_manager: "Project Manager",
      team_member: "Team Member",
    };
    return roleMap[role] || role;
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setIsOpen(false);
  };

  if (!user) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-white/20 opacity-70">
        <div className="text-right">
          <div className="text-sm font-medium text-white">Not logged in</div>
        </div>
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors border border-white/20"
        >
          <div className="text-right">
            <div className="text-sm font-medium text-white">
              {user.name || "Unknown User"}
            </div>
            <div className="text-xs text-slate-300">
              {getRoleDisplay(user.role)}
            </div>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 min-w-48">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="text-sm font-medium text-slate-900">
                {user.name || "Unknown User"}
              </div>
              <div className="text-xs text-slate-500">
                {user.email || "No email"}
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={onLogout}
        title="Logout Confirmation"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        variant="info"
      />
    </>
  );
};

const LoadingState = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">
          Loading Dashboard
        </h3>
        <p className="text-slate-600">Preparing your workspace...</p>
      </div>
    </div>
  </div>
);

const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="text-center space-y-6 max-w-md">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">
          Unable to Load Dashboard
        </h3>
        <p className="text-slate-600">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mx-auto"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  </div>
);

const StatsSection = ({
  stats,
}: {
  stats: {
    total: number;
    byStatus: {
      todo: number;
      in_progress: number;
      done: number;
    };
    byPriority: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    overdue: number;
  };
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    {STATS_CONFIG.map((stat) => {
      const IconComponent = stat.icon;
      let value = 0;
      let percentage = 0;

      if (stat.id === "total") {
        value = stats.total;
        percentage = 100;
      } else if (stat.id in stats.byStatus) {
        value = stats.byStatus[stat.id as keyof typeof stats.byStatus];
        percentage = Math.round((value / Math.max(1, stats.total)) * 100);
      }

      return (
        <div
          key={stat.id}
          className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
            >
              <IconComponent className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{percentage}%</div>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-700 uppercase tracking-wide">
            {stat.label}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${stat.bgColor
                .replace("bg-", "bg-")
                .replace("-50", "-500")}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    })}
  </div>
);

const TaskCard = ({
  task,
  onTaskClick,
  onStatusChange,
}: {
  task: TaskWithProjectDetails;
  onTaskClick: (task: Task) => void;
  onStatusChange: (
    taskId: string,
    newStatus: TaskStatus,
    taskTitle: string
  ) => void;
}) => {
  const convertTaskForModal = (task: TaskWithProjectDetails): Task => {
    return {
      ...task,
      project: task.project._id,
    };
  };

  const isOverdue =
    new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300 group h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              task.status === "done"
                ? "bg-emerald-50 text-emerald-600"
                : task.status === "in_progress"
                ? "bg-blue-50 text-blue-600"
                : "bg-slate-50 text-slate-600"
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-slate-900 truncate mb-1 group-hover:text-slate-800">
              {task.title}
            </h3>
            <p className="text-slate-600 text-sm line-clamp-2">
              {task.description}
            </p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        <TaskStatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Project Info */}
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
        <FolderOpen className="w-4 h-4" />
        <span className="font-medium truncate">{task.project.projectName}</span>
        <span className="flex items-center gap-1 text-xs">
          <MapPin className="w-3 h-3" />
          {task.project.location}
        </span>
      </div>

      {/* Task Details */}
      <div className="space-y-3 mb-4 flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Due Date</span>
          <span
            className={`font-medium ${
              isOverdue ? "text-red-600" : "text-slate-900"
            }`}
          >
            {new Date(task.dueDate).toLocaleDateString()}
            {isOverdue && (
              <span className="ml-1 text-xs text-red-500">• Overdue</span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Created By</span>
          <span className="font-medium text-slate-900 truncate ml-2">
            {task.createdBy.name}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Notes</span>
          <span className="font-medium text-slate-900">
            {task.notes ? task.notes.length : 0}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <button
          onClick={() => onTaskClick(convertTaskForModal(task))}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors text-sm"
        >
          <Eye className="w-3 h-3" />
          View Notes
        </button>
        <StatusButton
          currentStatus={task.status}
          onStatusChange={onStatusChange}
          taskId={task._id}
          taskTitle={task.title}
        />
      </div>
    </div>
  );
};

const EmptyTasksState = () => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <FileText className="w-6 h-6 text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">
      No tasks assigned
    </h3>
    <p className="text-slate-600">
      You don't have any tasks assigned to you yet.
    </p>
  </div>
);

const LoadingTasksState = () => (
  <div className="text-center py-12">
    <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
    <p className="mt-3 text-slate-600 text-sm font-medium">
      Loading your tasks...
    </p>
  </div>
);

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
      <div className="text-sm text-slate-600">
        Showing {startItem}-{endItem} of {totalItems} tasks
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              currentPage === page
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Import modals and API
import TaskNotesModal from "../TaskNotesModal";
import { useAuth } from "@/app/context/AuthContext";
import ConfirmationModal from "../ConfirmationModal";
import { getTaskMe, updateTask } from "@/lib/api/tasks";

export default function TeamMemberDashboard() {
  // State
  const [tasks, setTasks] = useState<TaskWithProjectDetails[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {
      todo: 0,
      in_progress: 0,
      done: 0,
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
    overdue: 0,
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    taskId: string;
    newStatus: TaskStatus;
    taskTitle: string;
  }>({
    isOpen: false,
    taskId: "",
    newStatus: "todo",
    taskTitle: "",
  });

  const { user, logout } = useAuth();

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9,
  });

  // Use debounce for search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Effects and data fetching
  useEffect(() => {
    fetchTasks();
  }, [pagination.currentPage, debouncedSearchTerm]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: TasksResponse = await getTaskMe(
        pagination.currentPage,
        pagination.itemsPerPage,
        debouncedSearchTerm
      );

      setTasks(data.tasks || []);
      setStats(
        data.stats || {
          total: 0,
          byStatus: { todo: 0, in_progress: 0, done: 0 },
          byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
          overdue: 0,
        }
      );

      setPagination((prev) => ({
        ...prev,
        currentPage: data.page || 1,
        totalPages: data.totalPages || 1,
        totalItems: data.total || 0,
      }));
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // Event handlers
  const handleTaskClick = (task: Task) => setSelectedTask(task);
  const handleCloseModal = () => setSelectedTask(null);

  const handleStatusChangeClick = (
    taskId: string,
    newStatus: TaskStatus,
    taskTitle: string
  ) => {
    setConfirmationModal({
      isOpen: true,
      taskId,
      newStatus,
      taskTitle,
    });
  };

  const handleStatusChangeConfirm = async () => {
    const { taskId, newStatus } = confirmationModal;

    try {
      setUpdatingTaskId(taskId);

      await updateTask(taskId, { status: newStatus });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );

      fetchTasks();

      // Close confirmation modal
      setConfirmationModal({
        isOpen: false,
        taskId: "",
        newStatus: "todo",
        taskTitle: "",
      });
    } catch (err) {
      console.error("Error updating task status:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update task status";
      setError(errorMessage);

      if (
        errorMessage.includes(
          "Team member can only set status to 'in_progress' or 'done'"
        )
      ) {
        setError("You can only update task status to 'In Progress' or 'Done'");
      }
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleStatusChangeCancel = () => {
    setConfirmationModal({
      isOpen: false,
      taskId: "",
      newStatus: "todo",
      taskTitle: "",
    });
  };

  const handleNoteAdded = (newNote: Note) => {
    if (selectedTask) {
      const updatedTasks = tasks.map((task) =>
        task._id === selectedTask._id
          ? { ...task, notes: [...task.notes, newNote] }
          : task
      );

      setTasks(updatedTasks);
      setSelectedTask((prev) =>
        prev ? { ...prev, notes: [...prev.notes, newNote] } : null
      );
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Get confirmation modal details
  const getConfirmationMessage = () => {
    const { newStatus, taskTitle } = confirmationModal;

    if (newStatus === "in_progress") {
      return `Are you sure you want to start progress on "${taskTitle}"?`;
    } else if (newStatus === "done") {
      return `Are you sure you want to mark "${taskTitle}" as complete?`;
    }

    return `Are you sure you want to update the status of "${taskTitle}"?`;
  };

  const getConfirmButtonText = () => {
    const { newStatus } = confirmationModal;

    if (newStatus === "in_progress") {
      return "Start Progress";
    } else if (newStatus === "done") {
      return "Mark Complete";
    }

    return "Update Status";
  };

  // Render states
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchTasks} />;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Modern Header */}
      <header className="bg-slate-900 rounded-2xl p-6 mb-7 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Team Member Dashboard
              </h1>
              <p className="text-slate-300 mt-1">
                Manage your projects and tasks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <ProfileDropdown user={user} onLogout={handleLogout} />
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-white/20 opacity-70">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    Not logged in
                  </div>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="space-y-7">
        {/* Stats Section */}
        <StatsSection stats={stats} />

        {/* Tasks Section */}
        <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {/* Section Header */}
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  My Tasks ({pagination.totalItems})
                </h2>
                <p className="text-slate-600 mt-1">
                  Tasks assigned to you across all projects
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white w-64 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <LoadingTasksState />
            ) : tasks.length === 0 ? (
              <EmptyTasksState />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onTaskClick={handleTaskClick}
                      onStatusChange={handleStatusChangeClick}
                    />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                  />
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      {selectedTask && (
        <TaskNotesModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={handleCloseModal}
          onNoteAdded={handleNoteAdded}
        />
      )}

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleStatusChangeCancel}
        onConfirm={handleStatusChangeConfirm}
        title="Confirm Status Change"
        message={getConfirmationMessage()}
        confirmText={getConfirmButtonText()}
        variant="info"
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={false}
        onClose={() => {}}
        onConfirm={() => {}}
        title=""
        message=""
        confirmText=""
        variant="info"
      />
    </div>
  );
}

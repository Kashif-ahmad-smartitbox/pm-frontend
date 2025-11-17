"use client";

import React, { useState, useEffect } from "react";
import {
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Plus,
  FolderOpen,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  BarChart3,
  Search,
  MapPin,
  User,
  Eye,
  FileText,
  Target,
  AlertTriangle,
  TrendingUp,
  Archive,
  ChevronRight,
  Grid3X3,
  List,
  ArrowLeft,
  RefreshCw,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  LogOut,
} from "lucide-react";

// Types (same as admin dashboard)
type ProjectStatus = "planned" | "active" | "completed";
type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high" | "critical";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface ProjectType {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Project {
  _id: string;
  projectName: string;
  location: string;
  projectManager: User;
  projectType: ProjectType;
  startDate: string;
  endDate: string;
  createdBy: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  __v: number;
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

interface ProjectData {
  project: Project;
  taskStats: {
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
  tasks: Task[];
  assignees: User[];
  recentNotes: Array<{
    taskId: string;
    taskTitle: string;
    noteId: string;
    text: string;
    createdAt: string;
    author: User;
  }>;
}

interface ProjectsResponse {
  projects: Project[];
  counts: {
    total: number;
    planned: number;
    active: number;
    completed: number;
  };
  page: number;
  limit: number;
  totalPages: number;
}

// Constants (same as admin dashboard)
const STATS_CONFIG = [
  {
    id: "total",
    label: "Total Projects",
    icon: FolderOpen,
    color: "text-slate-700",
    bgColor: "bg-slate-50",
  },
  {
    id: "planned",
    label: "Planned",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "active",
    label: "In Progress",
    icon: TrendingUp,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: "completed",
    label: "Completed",
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
] as const;

const STATUS_CONFIG = {
  planned: {
    label: "Planned",
    color: "bg-blue-50 text-blue-700",
    icon: Clock,
    iconColor: "text-blue-600",
  },
  active: {
    label: "In Progress",
    color: "bg-amber-50 text-amber-700",
    icon: TrendingUp,
    iconColor: "text-amber-600",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
  },
} as const;

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

// Components (same as admin dashboard)
const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  const config = STATUS_CONFIG[status];
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

const ProjectCard = ({
  project,
  onViewTasks,
  isProjectManager,
}: {
  project: Project;
  onViewTasks: () => void;
  isProjectManager?: boolean;
}) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <FolderOpen className="w-5 h-5 text-slate-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-slate-900 truncate mb-1">
            {project.projectName}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{project.location}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={project.status} />
      </div>
    </div>

    {/* Details */}
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Manager</span>
        <span className="font-medium text-slate-900">
          {project.projectManager?.name || "N/A"}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Type</span>
        <span className="font-medium text-slate-900">
          {project.projectType?.name || "N/A"}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Start Date</span>
        <span className="font-medium text-slate-900">
          {project.startDate
            ? new Date(project.startDate).toLocaleDateString()
            : "N/A"}
        </span>
      </div>
    </div>

    {/* Action Button */}
    <button
      onClick={onViewTasks}
      className="w-full py-2.5 bg-slate-50 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm"
    >
      <Eye className="w-4 h-4" />
      View Tasks
    </button>
  </div>
);

const ProjectListItem = ({
  project,
  onViewTasks,
}: {
  project: Project;
  onViewTasks: () => void;
}) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
          <FolderOpen className="w-6 h-6 text-slate-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {project.projectName}
            </h3>
            <StatusBadge status={project.status} />
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {project.location}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {project.projectManager?.name || "N/A"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {project.startDate
                ? new Date(project.startDate).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onViewTasks}
          className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-sm"
        >
          <Eye className="w-4 h-4" />
          Tasks
        </button>
      </div>
    </div>
  </div>
);

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
  counts,
}: {
  counts: { total: number; planned: number; active: number; completed: number };
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    {STATS_CONFIG.map((stat) => {
      const IconComponent = stat.icon;
      const value = counts[stat.id as keyof typeof counts];
      const percentage = Math.round((value / Math.max(1, counts.total)) * 100);

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

const TaskList = ({
  tasks,
  onTaskClick,
  onEditTask,
  isProjectManager,
}: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
  isProjectManager?: boolean;
}) => (
  <div className="space-y-3">
    {tasks.map((task) => (
      <div
        key={task._id}
        className="bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              {task.title}
            </h3>
            <p className="text-slate-600 text-sm mb-3 line-clamp-2">
              {task.description}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <TaskStatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {task.assignees?.length || 0} assignees
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              {task.notes ? task.notes.length : 0} notes
            </span>
          </div>
        </div>

        {task.assignees && task.assignees.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-slate-500 font-medium">
              Assignees:
            </span>
            <div className="flex items-center gap-1">
              {task.assignees.map((assignee) => (
                <span
                  key={assignee._id}
                  className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-700 font-medium"
                >
                  {assignee.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Project Managers can only edit tasks, not delete */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => onTaskClick(task)}
            className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-sm"
          >
            <FileText className="w-3 h-3" />
            View Notes
          </button>
          {isProjectManager && (
            <button
              onClick={() => onEditTask(task)}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-sm"
            >
              <Edit className="w-3 h-3" />
              Edit Task
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
);

const EmptyTasksState = ({ onCreateTask }: { onCreateTask: () => void }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <FileText className="w-6 h-6 text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">No tasks yet</h3>
    <p className="text-slate-600 mb-6">
      Get started by creating the first task
    </p>
    <button
      onClick={onCreateTask}
      className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 mx-auto"
    >
      <Plus className="w-4 h-4" />
      Create First Task
    </button>
  </div>
);

const LoadingTasksState = () => (
  <div className="text-center py-12">
    <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
    <p className="mt-3 text-slate-600 text-sm font-medium">
      Loading project tasks...
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
        Showing {startItem}-{endItem} of {totalItems} projects
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
import NewTaskModal from "../NewTaskModal";
import TeamManagementModal from "../TeamManagementModal";
import TaskNotesModal from "../TaskNotesModal";
import { getProjectData, getProjects } from "@/lib/api/projects";
import UpdateTaskModal from "../UpdateTaskModal";
import { useAuth } from "@/app/context/AuthContext";
import ConfirmationModal from "../ConfirmationModal";

export default function ProjectManagerDashboard() {
  // State (removed project management states)
  const [projects, setProjects] = useState<Project[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    planned: 0,
    active: 0,
    completed: 0,
  });
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showTeamManagementModal, setShowTeamManagementModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewAllProjects, setViewAllProjects] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);

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
    fetchProjects();
  }, [pagination.currentPage, debouncedSearchTerm]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: ProjectsResponse = await getProjects(
        pagination.currentPage,
        pagination.itemsPerPage,
        debouncedSearchTerm
      );

      setProjects(data.projects || []);
      setCounts(
        data.counts || {
          total: 0,
          planned: 0,
          active: 0,
          completed: 0,
        }
      );

      setPagination((prev) => ({
        ...prev,
        currentPage: data.page || 1,
        totalPages: data.totalPages || 1,
        totalItems: data.counts?.total || 0,
      }));
    } catch (err) {
      console.error("Fetch projects error:", err);
      setError(err instanceof Error ? err.message : "Failed to load projects");
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

  const handleProjectClick = async (projectId: string) => {
    try {
      setLoadingProject(true);
      setError(null);
      const projectData = await getProjectData(projectId);
      setSelectedProject(projectData);
      setViewAllProjects(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load project details"
      );
    } finally {
      setLoadingProject(false);
    }
  };

  // Event handlers
  const handleTaskClick = (task: Task) => setSelectedTask(task);
  const handleCloseModal = () => setSelectedTask(null);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowUpdateTaskModal(true);
  };

  const handleTaskUpdated = () => {
    if (selectedProject && editingTask) {
      handleProjectClick(selectedProject.project._id);
    }
    setShowUpdateTaskModal(false);
    setEditingTask(null);
  };

  const handleNoteAdded = (newNote: Note) => {
    if (selectedProject && selectedTask) {
      const updatedTasks = selectedProject.tasks.map((task) =>
        task._id === selectedTask._id
          ? { ...task, notes: [...task.notes, newNote] }
          : task
      );

      setSelectedProject({
        ...selectedProject,
        tasks: updatedTasks,
      });

      setSelectedTask((prev) =>
        prev ? { ...prev, notes: [...prev.notes, newNote] } : null
      );
    }
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setViewAllProjects(false);
  };

  const handleBackToOverview = () => {
    setViewAllProjects(false);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setSearchTerm("");
  };

  const handleNewTaskCreated = () => {
    if (selectedProject) {
      handleProjectClick(selectedProject.project._id);
    }
    setShowNewTaskModal(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Derived state
  const latestProjects = projects.slice(0, 3);
  const filteredProjects = projects;

  // Render states
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchProjects} />;

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
                Project Manager Dashboard
              </h1>
              <p className="text-slate-300 mt-1">
                Manage your projects and tasks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTeamManagementModal(true)}
              className="px-4 py-2.5 bg-white/10 text-slate-200 rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/20"
            >
              <Users className="w-4 h-4" />
              Team Management
            </button>

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
        {!selectedProject && !viewAllProjects && (
          <StatsSection counts={counts} />
        )}

        {/* Projects Section */}
        <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {/* Section Header */}
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                  {selectedProject ? (
                    <>
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                      {selectedProject.project.projectName}
                    </>
                  ) : viewAllProjects ? (
                    <>
                      <Archive className="w-5 h-5 text-slate-600" />
                      All Projects ({pagination.totalItems})
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 text-slate-600" />
                      Latest Projects
                    </>
                  )}
                </h2>
                <p className="text-slate-600 mt-1">
                  {selectedProject
                    ? "Project tasks and details"
                    : viewAllProjects
                    ? "Complete project portfolio"
                    : "Recently updated projects"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {selectedProject ? (
                  <>
                    <button
                      onClick={handleBackToProjects}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={() => setShowNewTaskModal(true)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New Task
                    </button>
                  </>
                ) : viewAllProjects ? (
                  <>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md transition-all ${
                          viewMode === "grid"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md transition-all ${
                          viewMode === "list"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white w-64 transition-all"
                      />
                    </div>

                    <button
                      onClick={handleBackToOverview}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Overview
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setViewAllProjects(true)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
                    >
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {selectedProject && (
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <MapPin className="w-4 h-4" />
                  {selectedProject.project.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  Start:{" "}
                  {new Date(
                    selectedProject.project.startDate
                  ).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  End:{" "}
                  {new Date(
                    selectedProject.project.endDate
                  ).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {selectedProject ? (
              // Tasks List View
              <div>
                {loadingProject ? (
                  <LoadingTasksState />
                ) : !selectedProject.tasks ||
                  selectedProject.tasks.length === 0 ? (
                  <EmptyTasksState
                    onCreateTask={() => setShowNewTaskModal(true)}
                  />
                ) : (
                  <TaskList
                    tasks={selectedProject.tasks}
                    onTaskClick={handleTaskClick}
                    onEditTask={handleEditTask}
                    isProjectManager={true}
                  />
                )}
              </div>
            ) : viewAllProjects ? (
              // All Projects View with Pagination
              <div>
                {viewMode === "grid" ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
                      {filteredProjects.map((project) => (
                        <ProjectCard
                          key={project._id}
                          project={project}
                          onViewTasks={() => handleProjectClick(project._id)}
                          isProjectManager={true}
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
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {filteredProjects.map((project) => (
                        <ProjectListItem
                          key={project._id}
                          project={project}
                          onViewTasks={() => handleProjectClick(project._id)}
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
            ) : (
              // Latest Projects Overview (no pagination)
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {latestProjects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onViewTasks={() => handleProjectClick(project._id)}
                    isProjectManager={true}
                  />
                ))}

                {/* View All Card */}
                {pagination.totalItems > 3 && (
                  <div
                    className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 hover:border-slate-400 transition-colors flex items-center justify-center cursor-pointer group"
                    onClick={() => setViewAllProjects(true)}
                  >
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto group-hover:bg-slate-100 transition-colors">
                        <ChevronRight className="w-6 h-6 text-slate-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">
                        View All Projects
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {pagination.totalItems} total projects
                      </p>
                    </div>
                  </div>
                )}
              </div>
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

      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onTaskCreated={handleNewTaskCreated}
        projectId={selectedProject?.project._id || ""}
      />

      <UpdateTaskModal
        isOpen={showUpdateTaskModal}
        onClose={() => {
          setShowUpdateTaskModal(false);
          setEditingTask(null);
        }}
        onTaskUpdated={handleTaskUpdated}
        task={editingTask}
      />

      <TeamManagementModal
        isOpen={showTeamManagementModal}
        onClose={() => setShowTeamManagementModal(false)}
        onUserCreated={() => {
          /* Refresh users if needed */
        }}
      />

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

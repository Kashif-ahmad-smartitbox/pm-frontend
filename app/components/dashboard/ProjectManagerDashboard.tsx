"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Edit,
  Plus,
  FolderOpen,
  Calendar,
  AlertCircle,
  Search,
  MapPin,
  Archive,
  Grid3X3,
  List,
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Trash2,
  FileText,
  AlertTriangle,
} from "lucide-react";

import { deleteTask, getAllTasks } from "@/lib/api/tasks";
import { getProjectData, getProjects } from "@/lib/api/projects";

import NewTaskModal from "../NewTaskModal";
import TaskNotesModal from "../TaskNotesModal";
import UpdateTaskModal from "../UpdateTaskModal";
import StatsSection from "../common/StatsSection";
import CommonHeader from "../common/CommonHeader";
import ConfirmationModal from "../ConfirmationModal";
import TaskFilterPanel from "../common/TaskFilterPanel";
import TeamManagementModal from "../TeamManagementModal";
import { Note, Task, TaskPriority, TaskStatus } from "../common/TaskCard2";
import EmptyTasksState from "../common/EmptyTasksState";
import TaskGrid from "../common/TaskGrid";
import LoadingTasksState from "../common/LoadingTasksState";

import ProjectCard from "@/components/common/ProjectCard";
import ProjectListItem from "@/components/common/ProjectListItem";
import { useAuth } from "@/app/context/AuthContext";
import ActiveProjectFilterBadge from "../common/ActiveProjectFilterBadge";
import AllTasksModal from "../AllTasksModal";

type ProjectStatus = "planned" | "active" | "completed" | "overdue";

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
    overdueProjects: number;
  };
  page: number;
  limit: number;
  totalPages: number;
}

interface TaskFilters {
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  assignee: string | "all";
  dueDate: "all" | "today" | "week" | "overdue";
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface DeleteConfirmState {
  type: "project" | "task" | null;
  id: string | null;
  name: string;
}

// Task Stats Interface
interface TaskStats {
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
}

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Constants for better maintainability
const DEFAULT_PAGINATION: PaginationState = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 8,
};

const DEFAULT_TASK_FILTERS: TaskFilters = {
  status: "all",
  priority: "all",
  assignee: "all",
  dueDate: "all",
};

// Loading State Component
const LoadingState = () => (
  <div className="min-h-screen bg-[#EFFFFA] flex items-center justify-center p-6">
    <div className="text-center space-y-3">
      <div className="w-10 h-10 border-3 border-[#D9F3EE] border-t-[#1CC2B1] rounded-full animate-spin mx-auto"></div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-[#0E3554]">
          Loading Dashboard
        </h3>
        <p className="text-slate-600 text-sm">Preparing your workspace...</p>
      </div>
    </div>
  </div>
);

// Error State Component
const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="min-h-screen bg-[#EFFFFA] flex items-center justify-center p-6">
    <div className="text-center space-y-4 max-w-md">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto">
        <AlertCircle className="w-5 h-5 text-red-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-[#0E3554]">
          Unable to Load Dashboard
        </h3>
        <p className="text-slate-600 text-sm">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-[#0E3554] text-white rounded-lg font-medium hover:bg-[#0A2A42] transition-colors flex items-center justify-center gap-1.5 mx-auto text-sm"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Try Again
      </button>
    </div>
  </div>
);

export default function ProjectManagerDashboard() {
  // State management
  const [projects, setProjects] = useState<Project[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    planned: 0,
    active: 0,
    completed: 0,
    overdueProjects: 0,
  });
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Task Stats State
  const [taskStats, setTaskStats] = useState<TaskStats>({
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
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Modal states
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showTeamManagementModal, setShowTeamManagementModal] = useState(false);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);
  const [showAllTasksModal, setShowAllTasksModal] = useState(false);

  // UI states
  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectMenuOpen, setProjectMenuOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeStatus, setActiveStatus] = useState<ProjectStatus | "all">(
    "all"
  );
  const [taskFilters, setTaskFilters] =
    useState<TaskFilters>(DEFAULT_TASK_FILTERS);

  const { user: currentUser } = useAuth();

  // Complex state objects
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGINATION);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    type: null,
    id: null,
    name: "",
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Data fetching
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: debouncedSearchTerm || undefined,
        status:
          activeStatus !== "all" && activeStatus !== "overdue"
            ? activeStatus
            : undefined,
      };

      const data: ProjectsResponse = await getProjects(queryParams);

      console.log("data", data, activeStatus);

      setProjects(data.projects || []);
      setCounts(
        data.counts || {
          total: 0,
          planned: 0,
          active: 0,
          completed: 0,
          overdueProjects: 0,
        }
      );
      setPagination((prev) => ({
        ...prev,
        currentPage: data.page || 1,
        totalPages: data.totalPages || 1,
        totalItems: data.counts?.total || 0,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    debouncedSearchTerm,
    activeStatus,
  ]);

  const fetchAllTasks = useCallback(async () => {
    try {
      setLoadingTasks(true);
      const data = await getAllTasks();

      const stats: TaskStats = {
        total: data.count || 0,
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
      };

      const today = new Date();

      data.tasks.forEach((task: Task) => {
        if (task.status === "todo") stats.byStatus.todo++;
        else if (task.status === "in_progress") stats.byStatus.in_progress++;
        else if (task.status === "done") stats.byStatus.done++;

        if (task.priority === "low") stats.byPriority.low++;
        else if (task.priority === "medium") stats.byPriority.medium++;
        else if (task.priority === "high") stats.byPriority.high++;
        else if (task.priority === "critical") stats.byPriority.critical++;

        if (task.status !== "done" && task.dueDate) {
          const dueDate = new Date(task.dueDate);
          if (dueDate < today) {
            stats.overdue++;
          }
        }
      });

      setTaskStats(stats);
      setAllTasks(data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchAllTasks();
  }, [fetchProjects, fetchAllTasks]);

  // Event handlers
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handleProjectClick = useCallback(async (projectId: string) => {
    try {
      setLoadingProject(true);
      setError(null);
      const projectData = await getProjectData(projectId);
      setSelectedProject(projectData);
      setTaskFilters(DEFAULT_TASK_FILTERS);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load project details"
      );
    } finally {
      setLoadingProject(false);
    }
  }, []);

  const handleTaskClick = useCallback(
    (task: Task) => setSelectedTask(task),
    []
  );
  const handleCloseModal = useCallback(() => setSelectedTask(null), []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowUpdateTaskModal(true);
  }, []);

  const handleDeleteTask = useCallback((task: Task) => {
    setDeleteConfirm({ type: "task", id: task._id, name: task.title });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm.id || !deleteConfirm.type) return;

    try {
      if (deleteConfirm.type === "task") {
        await deleteTask(deleteConfirm.id);
        if (selectedProject) {
          handleProjectClick(selectedProject.project._id);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to delete ${deleteConfirm.type}`
      );
    } finally {
      setDeleteConfirm({ type: null, id: null, name: "" });
    }
  }, [deleteConfirm, selectedProject, handleProjectClick]);

  const handleTaskUpdated = useCallback(() => {
    if (selectedProject && editingTask) {
      handleProjectClick(selectedProject.project._id);
    }
    setShowUpdateTaskModal(false);
    setEditingTask(null);
  }, [selectedProject, editingTask, handleProjectClick]);

  const handleTaskClickFromAllTasks = useCallback((task: Task) => {
    setSelectedTask(task);
    setShowAllTasksModal(false);
  }, []);

  const handleChatClickFromAllTasks = useCallback((task: Task) => {
    setSelectedTask(task);
    setShowAllTasksModal(false);
  }, []);

  const handleNoteAdded = useCallback(
    (newNote: Note) => {
      if (selectedProject && selectedTask) {
        const updatedTasks = selectedProject.tasks.map((task) =>
          task._id === selectedTask._id
            ? { ...task, notes: [...task.notes, newNote] }
            : task
        );
        setSelectedProject({ ...selectedProject, tasks: updatedTasks });
        setSelectedTask((prev) =>
          prev ? { ...prev, notes: [...prev.notes, newNote] } : null
        );
      }
    },
    [selectedProject, selectedTask]
  );

  const handleBackToProjects = useCallback(() => setSelectedProject(null), []);

  const handleNewTaskCreated = useCallback(() => {
    if (selectedProject) handleProjectClick(selectedProject.project._id);
    setShowNewTaskModal(false);
  }, [selectedProject, handleProjectClick]);

  const handleStatsCardClick = useCallback((status: string) => {
    if (status === "tasks") {
      setShowAllTasksModal(true);
    } else {
      setActiveStatus(status as ProjectStatus | "all");
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  }, []);

  const handleClearFilter = useCallback(() => {
    setActiveStatus("all");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleTaskFiltersChange = useCallback((newFilters: TaskFilters) => {
    setTaskFilters(newFilters);
  }, []);

  const handleClearTaskFilters = useCallback(() => {
    setTaskFilters(DEFAULT_TASK_FILTERS);
  }, []);

  const toggleProjectMenu = useCallback((projectId: string) => {
    setProjectMenuOpen((prev) => (prev === projectId ? null : projectId));
  }, []);

  // Computed values
  const getProjectTaskStats = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p._id === projectId);

      if (project && (project as any).taskStats) {
        const taskStats = (project as any).taskStats;
        return {
          total: taskStats.total || 0,
          byStatus: {
            todo: taskStats.todo || 0,
            in_progress: taskStats.in_progress || 0,
            done: taskStats.done || 0,
          },
        };
      }

      return {
        total: 0,
        byStatus: {
          todo: 0,
          in_progress: 0,
          done: 0,
        },
      };
    },
    [projects]
  );

  // Fixed filteredProjects logic to handle overdue projects
  const filteredProjects = useMemo(() => {
    if (activeStatus === "all") return projects;

    if (activeStatus === "overdue") {
      const today = new Date();
      const overdueProjects = projects.filter((project) => {
        const endDate = new Date(project.endDate);
        // A project is overdue if:
        // 1. The end date has passed
        // 2. It's not completed
        return endDate < today && project.status !== "completed";
      });

      console.log("Overdue projects calculation:", {
        totalProjects: projects.length,
        overdueCount: overdueProjects.length,
        today: today.toISOString(),
        projects: projects.map((p) => ({
          name: p.projectName,
          endDate: p.endDate,
          status: p.status,
          isOverdue: new Date(p.endDate) < today && p.status !== "completed",
        })),
      });

      return overdueProjects;
    }

    return projects.filter((project) => project.status === activeStatus);
  }, [projects, activeStatus]);

  const getFilteredTasks = useCallback(
    (tasks: Task[]) => {
      return tasks.filter((task) => {
        if (taskFilters.status !== "all" && task.status !== taskFilters.status)
          return false;
        if (
          taskFilters.priority !== "all" &&
          task.priority !== taskFilters.priority
        )
          return false;

        if (taskFilters.assignee !== "all") {
          const hasAssignee = task.assignees.some(
            (assignee) => assignee._id === taskFilters.assignee
          );
          if (!hasAssignee) return false;
        }

        if (taskFilters.dueDate !== "all") {
          const today = new Date();
          const taskDueDate = new Date(task.dueDate);

          switch (taskFilters.dueDate) {
            case "today":
              if (taskDueDate.toDateString() !== today.toDateString())
                return false;
              break;
            case "week":
              const endOfWeek = new Date(today);
              endOfWeek.setDate(today.getDate() + 7);
              if (taskDueDate < today || taskDueDate > endOfWeek) return false;
              break;
            case "overdue":
              if (taskDueDate >= today) return false;
              break;
          }
        }

        return true;
      });
    },
    [taskFilters]
  );

  const filteredTasks = useMemo(
    () => (selectedProject ? getFilteredTasks(selectedProject.tasks) : []),
    [selectedProject, getFilteredTasks]
  );

  const getUniqueAssignees = useCallback(() => {
    if (!selectedProject) return [];

    const assigneesMap = new Map();
    selectedProject.tasks.forEach((task) => {
      task.assignees.forEach((assignee) => {
        if (!assigneesMap.has(assignee._id)) {
          assigneesMap.set(assignee._id, assignee);
        }
      });
    });

    return Array.from(assigneesMap.values());
  }, [selectedProject]);

  // Format dates for display
  const formatProjectDates = useCallback((project: Project) => {
    const formatDate = (dateString: string) =>
      new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    return {
      startDate: formatDate(project.startDate),
      endDate: formatDate(project.endDate),
    };
  }, []);

  // Project actions for Project Manager (read-only for projects)
  const handleEditProject = useCallback((project: Project) => {
    // Project managers can't edit projects, only view them
    console.log("View project details:", project);
  }, []);

  const handleDeleteProject = useCallback((projectId: string) => {
    // Project managers can't delete projects
    console.log("View project:", projectId);
  }, []);

  // Render loading state
  if (loading) {
    return <LoadingState />;
  }

  // Render error state
  if (error) {
    return <ErrorState error={error} onRetry={fetchProjects} />;
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4">
      {/* Header */}
      <CommonHeader
        title="SKC Project Management"
        subtitle="Project Manager Dashboard"
        onTeamManagementClick={() => setShowTeamManagementModal(true)}
        showTeamManagement
        showNotifications
      />

      <main className="space-y-4">
        {/* Stats Section */}
        {!selectedProject && (
          <div className="space-y-4">
            <StatsSection
              stats={counts}
              type="projects"
              onStatsCardClick={handleStatsCardClick}
              activeFilter={activeStatus}
            />

            {/* Divider */}
            <div className="relative">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-orange-400" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-orange-400 px-2 text-xs text-white">
                  Overview
                </span>
              </div>
            </div>

            {/* Task Stats */}
            <StatsSection
              stats={taskStats}
              type="tasks"
              onStatsCardClick={() => handleStatsCardClick("tasks")}
            />
          </div>
        )}

        {/* Projects/Tasks Section */}
        <section>
          {/* Section Header */}
          <div className="bg-white rounded-xl border border-[#E1F3F0] overflow-hidden p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Title Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`p-1.5 rounded-lg ${
                      selectedProject ? "bg-[#E0FFFA]" : "bg-[#F0F7FF]"
                    }`}
                  >
                    {selectedProject ? (
                      <FolderOpen className="w-4 h-4 text-[#1CC2B1]" />
                    ) : (
                      <Archive className="w-4 h-4 text-[#0E3554]" />
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-[#0E3554] truncate">
                    {selectedProject
                      ? selectedProject.project.projectName
                      : `All Projects (${pagination.totalItems})`}
                  </h2>
                </div>
                <p className="text-slate-500 text-xs ml-7">
                  {selectedProject
                    ? "Project tasks and details"
                    : "Complete project portfolio"}
                </p>
              </div>

              {/* Actions Section */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedProject ? (
                  <>
                    <button
                      onClick={handleBackToProjects}
                      className="px-3 py-1.5 text-[#0E3554] hover:text-[#1CC2B1] font-medium transition-all duration-200 flex items-center gap-1.5 text-sm hover:bg-[#F8FDFC] rounded-lg"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Back</span>
                    </button>
                    <button
                      onClick={() => setShowNewTaskModal(true)}
                      className="px-3 py-1.5 bg-[#0E3554] text-white font-medium rounded-lg hover:bg-[#0A2A42] transition-all duration-200 flex items-center gap-1.5 text-sm hover:shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">New Task</span>
                      <span className="sm:hidden">Task</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* View Toggle */}
                    <div className="flex items-center gap-0.5 bg-[#F8FDFC] rounded-lg p-0.5 border border-[#E1F3F0]">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-md transition-all duration-200 ${
                          viewMode === "grid"
                            ? "bg-white text-[#0E3554] shadow-sm"
                            : "text-slate-400 hover:text-[#0E3554] hover:bg-white"
                        }`}
                      >
                        <Grid3X3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded-md transition-all duration-200 ${
                          viewMode === "list"
                            ? "bg-white text-[#0E3554] shadow-sm"
                            : "text-slate-400 hover:text-[#0E3554] hover:bg-white"
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 sm:flex-none min-w-0 sm:min-w-48">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 border border-[#E1F3F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-transparent bg-white transition-all text-sm placeholder-slate-400"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Active Filter Badge */}
            {!selectedProject && activeStatus !== "all" && (
              <div className="mt-3">
                <ActiveProjectFilterBadge
                  filter={activeStatus}
                  onClear={handleClearFilter}
                />
              </div>
            )}

            {/* Project Details Bar */}
            {selectedProject && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E1F3F0]">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-[#F8FDFC] px-2 py-1 rounded-lg border border-[#E1F3F0]">
                    <MapPin className="w-3.5 h-3.5 text-[#1CC2B1]" />
                    <span className="font-medium truncate max-w-40">
                      {selectedProject.project.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-[#1CC2B1]" />
                    <span>
                      {formatProjectDates(selectedProject.project).startDate} -{" "}
                      {formatProjectDates(selectedProject.project).endDate}
                    </span>
                  </div>
                </div>

                {/* Project managers can't edit projects, so this button is removed */}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="my-2">
            {selectedProject ? (
              <div>
                <TaskFilterPanel
                  filters={taskFilters}
                  onFiltersChange={handleTaskFiltersChange}
                  onClearFilters={handleClearTaskFilters}
                  assignees={getUniqueAssignees()}
                />

                {loadingProject ? (
                  <LoadingTasksState />
                ) : filteredTasks.length === 0 ? (
                  <EmptyTasksState
                    onCreateTask={() => setShowNewTaskModal(true)}
                  />
                ) : (
                  <TaskGrid
                    tasks={filteredTasks}
                    onTaskClick={handleTaskClick}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                  />
                )}
              </div>
            ) : (
              <div>
                {viewMode === "grid" ? (
                  <>
                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 mb-4">
                      {filteredProjects.map((project) => (
                        <ProjectCard
                          key={project._id}
                          project={project}
                          onEdit={handleEditProject}
                          onDelete={handleDeleteProject}
                          onViewTasks={() => handleProjectClick(project._id)}
                          menuOpen={projectMenuOpen === project._id}
                          onToggleMenu={() => toggleProjectMenu(project._id)}
                          taskStats={getProjectTaskStats(project._id)}
                          showActions={false} // Project managers can't edit/delete projects
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <Pagination
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        totalItems={pagination.totalItems}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {/* List Layout */}
                    <div className="space-y-2 mb-4">
                      {filteredProjects.map((project) => (
                        <ProjectListItem
                          key={project._id}
                          project={project}
                          onEdit={handleEditProject}
                          onDelete={handleDeleteProject}
                          onViewTasks={() => handleProjectClick(project._id)}
                          menuOpen={projectMenuOpen === project._id}
                          onToggleMenu={() => toggleProjectMenu(project._id)}
                          showActions={false} // Project managers can't edit/delete projects
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <Pagination
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        totalItems={pagination.totalItems}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Modals
        selectedTask={selectedTask}
        showNewTaskModal={showNewTaskModal}
        showTeamManagementModal={showTeamManagementModal}
        showUpdateTaskModal={showUpdateTaskModal}
        editingTask={editingTask}
        deleteConfirm={deleteConfirm}
        selectedProject={selectedProject}
        allTasks={allTasks}
        taskStats={taskStats}
        showAllTasksModal={showAllTasksModal}
        onCloseModal={handleCloseModal}
        onNoteAdded={handleNoteAdded}
        onNewTaskCreated={handleNewTaskCreated}
        onTaskUpdated={handleTaskUpdated}
        onConfirmDelete={handleConfirmDelete}
        onCloseNewTaskModal={() => setShowNewTaskModal(false)}
        onCloseTeamManagementModal={() => setShowTeamManagementModal(false)}
        onCloseUpdateTaskModal={() => {
          setShowUpdateTaskModal(false);
          setEditingTask(null);
        }}
        onCloseAllTasksModal={() => setShowAllTasksModal(false)}
        onCloseDeleteConfirm={() =>
          setDeleteConfirm({ type: null, id: null, name: "" })
        }
        currentUser={currentUser as User}
        onTaskClick={handleTaskClickFromAllTasks}
        onChatClick={handleChatClickFromAllTasks}
      />
    </div>
  );
}

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  totalItems,
}) => {
  const getVisiblePages = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible; i++) pages.push(i);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#D9F3EE] flex-col gap-3 sm:flex-row">
      <div className="text-xs text-slate-600 text-center sm:text-left">
        Showing{" "}
        {Math.min(
          (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
          totalItems
        )}
        -
        {Math.min(pagination.currentPage * pagination.itemsPerPage, totalItems)}{" "}
        of {totalItems} projects
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="p-1.5 rounded border border-[#D9F3EE] text-slate-600 hover:bg-[#EFFFFA] disabled:opacity-50 text-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {getVisiblePages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              pagination.currentPage === page
                ? "bg-[#0E3554] text-white"
                : "text-slate-600 hover:bg-[#EFFFFA] border border-[#D9F3EE]"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="p-1.5 rounded border border-[#D9F3EE] text-slate-600 hover:bg-[#EFFFFA] disabled:opacity-50 text-xs"
        >
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

interface ModalsProps {
  selectedTask: Task | null;
  showNewTaskModal: boolean;
  showTeamManagementModal: boolean;
  showUpdateTaskModal: boolean;
  showAllTasksModal: boolean;
  editingTask: Task | null;
  deleteConfirm: DeleteConfirmState;
  selectedProject: ProjectData | null;
  allTasks: Task[];
  taskStats: TaskStats;
  onCloseModal: () => void;
  onNoteAdded: (note: Note) => void;
  onNewTaskCreated: () => void;
  onTaskUpdated: () => void;
  onConfirmDelete: () => void;
  onCloseNewTaskModal: () => void;
  onCloseTeamManagementModal: () => void;
  onCloseAllTasksModal: () => void;
  onCloseUpdateTaskModal: () => void;
  onCloseDeleteConfirm: () => void;
  currentUser: User;
  onTaskClick?: (task: Task) => void;
  onChatClick?: (task: Task) => void;
}

const Modals: React.FC<ModalsProps> = ({
  selectedTask,
  showNewTaskModal,
  showTeamManagementModal,
  showUpdateTaskModal,
  showAllTasksModal,
  allTasks = [],
  taskStats,
  editingTask,
  deleteConfirm,
  selectedProject,
  onCloseModal,
  onNoteAdded,
  onNewTaskCreated,
  onTaskUpdated,
  onConfirmDelete,
  onCloseNewTaskModal,
  onCloseTeamManagementModal,
  onCloseAllTasksModal,
  onCloseUpdateTaskModal,
  onCloseDeleteConfirm,
  currentUser,
  onTaskClick,
  onChatClick,
}) => {
  const handleTaskClick = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
    onCloseAllTasksModal();
  };

  const handleChatClick = (task: Task) => {
    if (onChatClick) {
      onChatClick(task);
    }
    onCloseAllTasksModal();
  };

  return (
    <>
      {selectedTask && (
        <TaskNotesModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={onCloseModal}
          onNoteAdded={onNoteAdded}
          currentUser={currentUser}
        />
      )}

      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={onCloseNewTaskModal}
        onTaskCreated={onNewTaskCreated}
        projectId={selectedProject?.project._id || ""}
      />

      <UpdateTaskModal
        isOpen={showUpdateTaskModal}
        onClose={onCloseUpdateTaskModal}
        onTaskUpdated={onTaskUpdated}
        task={editingTask}
      />

      <TeamManagementModal
        isOpen={showTeamManagementModal}
        onClose={onCloseTeamManagementModal}
        onUserCreated={() => {}}
      />

      <AllTasksModal
        isOpen={showAllTasksModal}
        onClose={onCloseAllTasksModal}
        allTasks={allTasks}
        taskStats={taskStats}
        onTaskClick={handleTaskClick}
        onChatClick={handleChatClick}
      />

      <ConfirmationModal
        isOpen={deleteConfirm.type !== null}
        onClose={onCloseDeleteConfirm}
        onConfirm={onConfirmDelete}
        title={`Delete ${
          deleteConfirm.type === "project" ? "Project" : "Task"
        }`}
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

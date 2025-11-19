"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Edit,
  Plus,
  FolderOpen,
  Calendar,
  Search,
  MapPin,
  Archive,
  Grid3X3,
  List,
  ArrowLeft,
} from "lucide-react";

import { deleteTask } from "@/lib/api/tasks";
import { deleteProject, getProjectData, getProjects } from "@/lib/api/projects";

import TaskGrid from "../common/TaskGrid";
import StatsSection from "../common/StatsSection";
import CommonHeader from "../common/CommonHeader";
import TaskFilterPanel from "../common/TaskFilterPanel";
import EmptyTasksState from "../common/EmptyTasksState";
import LoadingTasksState from "../common/LoadingTasksState";
import { Note, Task, TaskPriority, TaskStatus } from "../common/TaskCard2";

import Modals from "../common/Modals";
import Pagination from "../common/Pagination";
import ProjectCard from "@/components/common/ProjectCard";
import ProjectListItem from "@/components/common/ProjectListItem";
import ActiveProjectFilterBadge from "../common/ActiveProjectFilterBadge";
import LoadingState from "../common/LoadingState";
import ErrorState from "../common/ErrorState";
import { useAuth } from "@/app/context/AuthContext";

type ProjectStatus = "planned" | "active" | "completed";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  color?: string;
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

export default function AdminDashboard() {
  // State management
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
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Modal states
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [showProjectTypesModal, setShowProjectTypesModal] = useState(false);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);

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

  // Complex state objects
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGINATION);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    type: null,
    id: null,
    name: "",
  });

  const { user: currentUser } = useAuth();

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
        status: activeStatus !== "all" ? activeStatus : undefined,
      };

      const data: ProjectsResponse = await getProjects(queryParams);

      setProjects(data.projects || []);
      setCounts(
        data.counts || { total: 0, planned: 0, active: 0, completed: 0 }
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

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Refresh handler for TaskNotesModal
  const handleRefresh = useCallback(async () => {
    if (selectedProject) {
      try {
        setLoadingProject(true);
        const projectData = await getProjectData(selectedProject.project._id);
        setSelectedProject(projectData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to refresh project data"
        );
      } finally {
        setLoadingProject(false);
      }
    }
  }, [selectedProject]);

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
      if (deleteConfirm.type === "project") {
        await deleteProject(deleteConfirm.id);
        fetchProjects();
        if (selectedProject?.project._id === deleteConfirm.id) {
          setSelectedProject(null);
        }
      } else if (deleteConfirm.type === "task") {
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
  }, [deleteConfirm, fetchProjects, selectedProject, handleProjectClick]);

  const handleTaskUpdated = useCallback(() => {
    if (selectedProject && editingTask) {
      handleProjectClick(selectedProject.project._id);
    }
    setShowUpdateTaskModal(false);
    setEditingTask(null);
  }, [selectedProject, editingTask, handleProjectClick]);

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

  const handleNewProjectCreated = useCallback(() => {
    fetchProjects();
    setShowNewProjectModal(false);
  }, [fetchProjects]);

  const handleNewTaskCreated = useCallback(() => {
    if (selectedProject) handleProjectClick(selectedProject.project._id);
    setShowNewTaskModal(false);
  }, [selectedProject, handleProjectClick]);

  const handleProjectUpdated = useCallback(() => {
    fetchProjects();
    if (
      selectedProject &&
      editingProject &&
      selectedProject.project._id === editingProject._id
    ) {
      handleProjectClick(selectedProject.project._id);
    }
    setShowEditProjectModal(false);
    setEditingProject(null);
  }, [fetchProjects, selectedProject, editingProject, handleProjectClick]);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setShowEditProjectModal(true);
    setProjectMenuOpen(null);
  }, []);

  const handleDeleteProject = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p._id === projectId);
      setDeleteConfirm({
        type: "project",
        id: projectId,
        name: project?.projectName || "Project",
      });
    },
    [projects]
  );

  const toggleProjectMenu = useCallback((projectId: string) => {
    setProjectMenuOpen((prev) => (prev === projectId ? null : projectId));
  }, []);

  const handleProjectTypeCreated = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleStatsCardClick = useCallback((status: string) => {
    setActiveStatus(status as ProjectStatus | "all");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
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

  const filteredProjects = useMemo(
    () =>
      activeStatus === "all"
        ? projects
        : projects.filter((project) => project.status === activeStatus),
    [projects, activeStatus]
  );

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

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchProjects} />;
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4">
      {/* Header */}
      <CommonHeader
        title="SKC Project Management"
        subtitle="Enterprise Management System"
        onProjectTypesClick={() => setShowProjectTypesModal(true)}
        onTeamManagementClick={() => setShowUserManagementModal(true)}
        showProjectTypes
        showTeamManagement
        showNotifications
      />

      <main className="space-y-4">
        {/* Stats Section */}
        {!selectedProject && (
          <StatsSection
            stats={counts}
            type="projects"
            onStatsCardClick={handleStatsCardClick}
            activeFilter={activeStatus}
          />
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

                    {/* New Project Button */}
                    <button
                      onClick={() => setShowNewProjectModal(true)}
                      className="px-3 py-1.5 bg-[#0E3554] text-white font-medium rounded-lg hover:bg-[#0A2A42] transition-all duration-200 flex items-center gap-1.5 text-sm hover:shadow-sm whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">New Project</span>
                      <span className="sm:hidden">Project</span>
                    </button>
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

                <button
                  onClick={() => handleEditProject(selectedProject.project)}
                  className="px-3 py-1.5 bg-white text-[#0E3554] rounded-lg font-medium hover:bg-[#F8FDFC] transition-all duration-200 flex items-center gap-1.5 text-sm border border-[#E1F3F0] hover:border-[#1CC2B1]"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
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
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      <Modals
        selectedTask={selectedTask}
        showNewProjectModal={showNewProjectModal}
        showNewTaskModal={showNewTaskModal}
        showEditProjectModal={showEditProjectModal}
        showUserManagementModal={showUserManagementModal}
        showProjectTypesModal={showProjectTypesModal}
        showUpdateTaskModal={showUpdateTaskModal}
        editingTask={editingTask}
        editingProject={editingProject}
        deleteConfirm={deleteConfirm}
        selectedProject={selectedProject}
        onCloseModal={handleCloseModal}
        onNoteAdded={handleNoteAdded}
        onNewProjectCreated={handleNewProjectCreated}
        onNewTaskCreated={handleNewTaskCreated}
        onProjectUpdated={handleProjectUpdated}
        onTaskUpdated={handleTaskUpdated}
        onProjectTypeCreated={handleProjectTypeCreated}
        onConfirmDelete={handleConfirmDelete}
        onCloseNewProjectModal={() => setShowNewProjectModal(false)}
        onCloseNewTaskModal={() => setShowNewTaskModal(false)}
        onCloseEditProjectModal={() => {
          setShowEditProjectModal(false);
          setEditingProject(null);
        }}
        onCloseUserManagementModal={() => setShowUserManagementModal(false)}
        onCloseProjectTypesModal={() => setShowProjectTypesModal(false)}
        onCloseUpdateTaskModal={() => {
          setShowUpdateTaskModal(false);
          setEditingTask(null);
        }}
        onCloseDeleteConfirm={() =>
          setDeleteConfirm({ type: null, id: null, name: "" })
        }
        currentUser={currentUser as User}
        onRefresh={handleRefresh}
      />
    </div>
  );
}

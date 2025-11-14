"use client";

import NewProjectModal from "../NewProjectModal";
import NewTaskModal from "../NewTaskModal";
import EditProjectModal from "../EditProjectModal";
import UserManagementModal from "../UserManagementModal";
import React, { useState, useEffect } from "react";
import { getProjectData, getProjects, updateProject } from "@/lib/api/projects";
import TaskNotesModal from "../TaskNotesModal";
import { createTask } from "@/lib/api/tasks";
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
  Shield,
  Headphones,
  Sparkles,
} from "lucide-react";

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

const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  const statusConfig = {
    planned: {
      label: "Planned",
      color: "bg-blue-50 text-blue-700 border border-blue-200",
      icon: Clock,
      iconColor: "text-blue-600",
    },
    active: {
      label: "In Progress",
      color: "bg-amber-50 text-amber-700 border border-amber-200",
      icon: TrendingUp,
      iconColor: "text-amber-600",
    },
    completed: {
      label: "Completed",
      color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      icon: CheckCircle,
      iconColor: "text-emerald-600",
    },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color} flex items-center gap-1`}
    >
      <IconComponent className={`w-3 h-3 ${config.iconColor}`} />
      {config.label}
    </span>
  );
};

const TaskStatusBadge = ({ status }: { status: TaskStatus }) => {
  const statusConfig = {
    todo: {
      label: "To Do",
      color: "bg-slate-50 text-slate-700 border border-slate-200",
      icon: Clock,
      iconColor: "text-slate-600",
    },
    in_progress: {
      label: "In Progress",
      color: "bg-blue-50 text-blue-700 border border-blue-200",
      icon: BarChart3,
      iconColor: "text-blue-600",
    },
    done: {
      label: "Done",
      color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      icon: CheckCircle,
      iconColor: "text-emerald-600",
    },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}
    >
      <IconComponent className={`w-3 h-3 ${config.iconColor}`} />
      {config.label}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  const priorityConfig = {
    low: {
      label: "Low",
      color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      icon: TrendingUp,
    },
    medium: {
      label: "Medium",
      color: "bg-amber-50 text-amber-700 border border-amber-200",
      icon: AlertCircle,
    },
    high: {
      label: "High",
      color: "bg-orange-50 text-orange-700 border border-orange-200",
      icon: AlertTriangle,
    },
    critical: {
      label: "Critical",
      color: "bg-red-50 text-red-700 border border-red-200",
      icon: Target,
    },
  };

  const config = priorityConfig[priority];
  const IconComponent = config.icon;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}
    >
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Main Dashboard Component
export default function AdminDashboard() {
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
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectMenuOpen, setProjectMenuOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewAllProjects, setViewAllProjects] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data.projects);
      setCounts(data.counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = async (projectId: string) => {
    try {
      setLoadingProject(true);
      setError(null);
      const projectData = await getProjectData(projectId);
      console.log("projectData", projectData);
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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
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
  };

  const handleNewProjectCreated = () => {
    fetchProjects();
    setShowNewProjectModal(false);
  };

  const handleNewTaskCreated = () => {
    if (selectedProject) {
      handleProjectClick(selectedProject.project._id);
    }
    setShowNewTaskModal(false);
  };

  const handleProjectUpdated = () => {
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
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowEditProjectModal(true);
    setProjectMenuOpen(null);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // await deleteProject(projectId);
      fetchProjects();
      if (selectedProject && selectedProject.project._id === projectId) {
        setSelectedProject(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  const toggleProjectMenu = (projectId: string) => {
    setProjectMenuOpen(projectMenuOpen === projectId ? null : projectId);
  };

  // Get latest 3 projects
  const latestProjects = projects.slice(0, 3);

  // Filter projects based on search term for view all mode
  const filteredProjects = projects.filter(
    (project) =>
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectManager.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const features = [
    {
      icon: Shield,
      text: "Enterprise-grade security",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      icon: Users,
      text: "Team collaboration tools",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      icon: Headphones,
      text: "24/7 dedicated support",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">
              Loading Dashboard
            </h3>
            <p className="text-slate-600">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800">
              Unable to Load Dashboard
            </h3>
            <p className="text-slate-600">{error}</p>
          </div>
          <button
            onClick={fetchProjects}
            className="w-full py-3 px-4 rounded-xl font-semibold shadow-lg shadow-blue-500/25
              bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700
              transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
              flex items-center justify-center space-x-2 group text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <RefreshCw className="w-4 h-4" />
            <span className="font-semibold">Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 -left-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-52 h-52 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header - Smaller and Compact */}
      <header className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-lg shadow-slate-200/20 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Project Dashboard
              </h1>
              <p className="text-slate-600 text-sm flex items-center gap-1.5">
                <BarChart3 className="w-3 h-3" />
                Manage projects and team collaboration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUserManagementModal(true)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
            >
              <Users className="w-3 h-3" />
              Manage Users
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-lg font-semibold hover:from-slate-900 hover:to-slate-800 transition-all duration-200 flex items-center gap-2 text-sm shadow-md shadow-slate-800/25">
              <User className="w-3 h-3" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-6">
        {/* Stats Section - Smaller and Compact */}
        {!selectedProject && !viewAllProjects && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: "total",
                label: "Total Projects",
                value: counts.total,
                color: "from-purple-500 to-purple-600",
                icon: FolderOpen,
                bgColor: "bg-purple-500/10",
                borderColor: "border-purple-200",
              },
              {
                id: "planned",
                label: "Planned",
                value: counts.planned,
                color: "from-blue-500 to-blue-600",
                icon: Clock,
                bgColor: "bg-blue-500/10",
                borderColor: "border-blue-200",
              },
              {
                id: "active",
                label: "In Progress",
                value: counts.active,
                color: "from-amber-500 to-amber-600",
                icon: TrendingUp,
                bgColor: "bg-amber-500/10",
                borderColor: "border-amber-200",
              },
              {
                id: "completed",
                label: "Completed",
                value: counts.completed,
                color: "from-emerald-500 to-emerald-600",
                icon: CheckCircle,
                bgColor: "bg-emerald-500/10",
                borderColor: "border-emerald-200",
              },
            ].map((stat) => (
              <div
                key={stat.id}
                className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md shadow-slate-200/20 border ${stat.borderColor} hover:shadow-lg hover:shadow-slate-200/30 transition-all duration-300 group`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                      <stat.icon className="w-3 h-3" />
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className="w-4 h-4 text-slate-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects Section - Compact */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/20 border border-slate-200/60 overflow-hidden">
          {/* Section Header - Compact */}
          <div className="border-b border-slate-200/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {selectedProject ? (
                      <>
                        <FolderOpen className="w-4 h-4 text-blue-600" />
                        <span className="max-w-md truncate">
                          {selectedProject.project.projectName}
                        </span>
                      </>
                    ) : viewAllProjects ? (
                      <>
                        <Archive className="w-4 h-4 text-slate-600" />
                        All Projects ({projects.length})
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 text-slate-600" />
                        Latest Projects
                      </>
                    )}
                  </h2>
                  <p className="text-slate-600 text-sm flex items-center gap-1.5 mt-0.5">
                    <FileText className="w-3 h-3" />
                    {selectedProject
                      ? "Project tasks and details"
                      : viewAllProjects
                      ? "Complete project portfolio"
                      : "Recently updated projects"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedProject ? (
                  <>
                    <button
                      onClick={handleBackToProjects}
                      className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-semibold transition-colors flex items-center gap-1.5 hover:bg-slate-100 rounded-lg text-sm"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Back
                    </button>
                    <button
                      onClick={() => setShowNewTaskModal(true)}
                      className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-md shadow-cyan-500/25 flex items-center gap-1.5 text-sm hover:shadow-lg hover:shadow-cyan-500/30"
                    >
                      <Plus className="w-3 h-3" />
                      New Task
                    </button>
                  </>
                ) : viewAllProjects ? (
                  <>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-md transition-all ${
                          viewMode === "grid"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        <Grid3X3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded-md transition-all ${
                          viewMode === "list"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        <List className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="relative group">
                      <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-400 bg-white/50 w-48 text-sm transition-all duration-300 hover:border-slate-400"
                      />
                    </div>
                    <button
                      onClick={handleBackToOverview}
                      className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-semibold transition-colors flex items-center gap-1.5 hover:bg-slate-100 rounded-lg text-sm"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Overview
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setViewAllProjects(true)}
                      className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 flex items-center gap-1.5 text-sm shadow-sm hover:shadow-md"
                    >
                      View All
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setShowNewProjectModal(true)}
                      className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-md shadow-cyan-500/25 flex items-center gap-1.5 text-sm hover:shadow-lg hover:shadow-cyan-500/30"
                    >
                      <Plus className="w-3 h-3" />
                      New Project
                    </button>
                  </>
                )}
              </div>
            </div>

            {selectedProject && (
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                    <MapPin className="w-3 h-3" />
                    {selectedProject.project.location}
                  </span>
                  <span className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-md text-blue-700">
                    <Calendar className="w-3 h-3" />
                    Start:{" "}
                    {new Date(
                      selectedProject.project.startDate
                    ).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-md text-green-700">
                    <Calendar className="w-3 h-3" />
                    End:{" "}
                    {new Date(
                      selectedProject.project.endDate
                    ).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleEditProject(selectedProject.project)}
                  className="px-3 py-1 text-cyan-600 hover:text-cyan-800 font-semibold transition-colors flex items-center gap-1.5 hover:bg-cyan-50 rounded-lg text-sm"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {selectedProject ? (
              // Tasks List View
              <div>
                {loadingProject ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-slate-600 text-sm font-medium flex items-center justify-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Loading project tasks...
                    </p>
                  </div>
                ) : !selectedProject.tasks ||
                  selectedProject.tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 mb-1">
                      No tasks yet
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                      Get started by creating the first task
                    </p>
                    <button
                      onClick={() => setShowNewTaskModal(true)}
                      className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-md shadow-cyan-500/25 flex items-center gap-1.5 mx-auto text-sm hover:shadow-lg hover:shadow-cyan-500/30"
                    >
                      <Plus className="w-3 h-3" />
                      Create First Task
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProject.tasks.map((task) => (
                      <div
                        key={task._id}
                        className="bg-white border border-slate-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-slate-800 text-base group-hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                                <FileText className="w-3 h-3 text-slate-400" />
                                {task.title}
                              </h3>
                              <div className="flex items-center gap-1.5">
                                <TaskStatusBadge status={task.status} />
                                <PriorityBadge priority={task.priority} />
                              </div>
                            </div>

                            <p className="text-slate-600 text-sm mb-3 line-clamp-2 pl-4">
                              {task.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-slate-500 pl-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Due:{" "}
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {task.assignees?.length || 0} assignees
                                </span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  {task.notes ? task.notes.length : 0} notes
                                </span>
                              </div>
                            </div>

                            {task.assignees && task.assignees.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-2 pl-4">
                                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  Assignees:
                                </span>
                                <div className="flex items-center gap-1">
                                  {task.assignees.map((assignee) => (
                                    <span
                                      key={assignee._id}
                                      className="text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-medium"
                                    >
                                      {assignee.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : viewAllProjects ? (
              // All Projects View
              <div>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                      <ProjectCard
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
                ) : (
                  <div className="space-y-3">
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
                )}
              </div>
            ) : (
              // Latest Projects Overview - Compact with View All in same row
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {latestProjects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                    onViewTasks={() => handleProjectClick(project._id)}
                    menuOpen={projectMenuOpen === project._id}
                    onToggleMenu={() => toggleProjectMenu(project._id)}
                  />
                ))}

                {/* View All Card - Smaller and in same row */}
                {projects.length > 3 && (
                  <div
                    className="bg-gradient-to-br from-slate-50 to-blue-50/30 border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-cyan-300 hover:shadow-md transition-all duration-300 flex items-center justify-center group cursor-pointer"
                    onClick={() => setViewAllProjects(true)}
                  >
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-1 group-hover:bg-cyan-200 transition-colors">
                        <ChevronRight className="w-4 h-4 text-cyan-600" />
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm group-hover:text-cyan-600 transition-colors">
                        View All
                      </h3>
                      <p className="text-slate-600 text-xs">
                        {projects.length} projects
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

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onProjectCreated={handleNewProjectCreated}
      />

      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onTaskCreated={handleNewTaskCreated}
        projectId={selectedProject?.project._id || ""}
      />

      <EditProjectModal
        isOpen={showEditProjectModal}
        onClose={() => {
          setShowEditProjectModal(false);
          setEditingProject(null);
        }}
        onProjectUpdated={handleProjectUpdated}
        project={editingProject}
      />

      <UserManagementModal
        isOpen={showUserManagementModal}
        onClose={() => setShowUserManagementModal(false)}
        onUserCreated={() => {
          /* Refresh users if needed */
        }}
      />
    </div>
  );
}

// Project Card Component - Smaller
const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  onViewTasks,
  menuOpen,
  onToggleMenu,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onViewTasks: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
}) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-md transition-all duration-300 relative group">
    {/* Project Menu */}
    <div className="absolute top-3 right-3">
      <button
        onClick={onToggleMenu}
        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <MoreVertical className="w-3 h-3" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-xl shadow-slate-300/30 z-10 min-w-32 overflow-hidden">
          <button
            onClick={() => onEdit(project)}
            className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Edit className="w-3 h-3" />
            Edit Project
          </button>
          <button
            onClick={() => onDelete(project._id)}
            className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}
    </div>

    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-800 group-hover:text-cyan-600 transition-colors mb-1 flex items-center gap-1.5">
            <FolderOpen className="w-4 h-4 text-slate-400" />
            <span className="truncate">{project.projectName}</span>
          </h3>
          <p className="text-slate-600 text-xs mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{project.location}</span>
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 flex items-center gap-1">
            <User className="w-3 h-3" />
            Manager
          </span>
          <span className="font-semibold text-slate-700 truncate ml-1 max-w-[80px]">
            {project.projectManager?.name || "N/A"}
          </span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 flex items-center gap-1">
            <Target className="w-3 h-3" />
            Type
          </span>
          <span className="font-semibold text-slate-700 truncate ml-1 max-w-[80px]">
            {project.projectType?.name || "N/A"}
          </span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Dates
          </span>
          <span className="font-semibold text-slate-700 text-xs">
            {project.startDate
              ? new Date(project.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </span>
        </div>
      </div>

      <button
        onClick={onViewTasks}
        className="w-full mt-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all duration-200 flex items-center justify-center gap-1.5 text-xs group-hover:bg-cyan-50 group-hover:text-cyan-600 hover:shadow-sm"
      >
        <Eye className="w-3 h-3" />
        View Tasks
      </button>
    </div>
  </div>
);

// Project List Item Component - Smaller
const ProjectListItem = ({
  project,
  onEdit,
  onDelete,
  onViewTasks,
  menuOpen,
  onToggleMenu,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onViewTasks: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
}) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-md transition-all duration-300 group">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
          <FolderOpen className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-800 text-sm group-hover:text-cyan-600 transition-colors truncate">
              {project.projectName}
            </h3>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {project.location}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {project.projectManager?.name || "N/A"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {project.startDate
                ? new Date(project.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onViewTasks}
          className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all duration-200 flex items-center gap-1 text-xs hover:shadow-sm"
        >
          <Eye className="w-3 h-3" />
          Tasks
        </button>

        <div className="relative">
          <button
            onClick={onToggleMenu}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="w-3 h-3" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-xl shadow-slate-300/30 z-10 min-w-32 overflow-hidden">
              <button
                onClick={() => onEdit(project)}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              >
                <Edit className="w-3 h-3" />
                Edit Project
              </button>
              <button
                onClick={() => onDelete(project._id)}
                className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

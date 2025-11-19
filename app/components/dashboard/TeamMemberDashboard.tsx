"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  AlertCircle,
  Trash2,
} from "lucide-react";

import TaskCard from "@/components/common/TaskCard";
import TaskNotesModal from "../TaskNotesModal";
import { useAuth } from "@/app/context/AuthContext";
import ConfirmationModal from "../ConfirmationModal";
import { getTaskMe, updateTask } from "@/lib/api/tasks";
import CommonHeader from "../common/CommonHeader";
import StatsSection from "../common/StatsSection";

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

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Constants
const DEFAULT_PAGINATION: PaginationState = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 12, // Increased for 4-column layout
};

// Custom Hooks
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Components
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

const EmptyTasksState = () => (
  <div className="text-center py-8">
    <div className="w-12 h-12 bg-[#EFFFFA] rounded-xl flex items-center justify-center mx-auto mb-3">
      <FileText className="w-5 h-5 text-slate-400" />
    </div>
    <h3 className="text-sm font-semibold text-[#0E3554] mb-1">
      No tasks assigned
    </h3>
    <p className="text-slate-600 text-xs">
      You don't have any tasks assigned to you yet.
    </p>
  </div>
);

const LoadingTasksState = () => (
  <div className="text-center py-8">
    <div className="w-6 h-6 border-2 border-[#D9F3EE] border-t-[#1CC2B1] rounded-full animate-spin mx-auto"></div>
    <p className="mt-2 text-slate-600 text-xs font-medium">
      Loading your tasks...
    </p>
  </div>
);

// Compact Pagination Component
const Pagination = ({
  pagination,
  onPageChange,
}: {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}) => {
  const startItem = Math.min(
    (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
    pagination.totalItems
  );
  const endItem = Math.min(
    pagination.currentPage * pagination.itemsPerPage,
    pagination.totalItems
  );

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
        Showing {startItem}-{endItem} of {pagination.totalItems} tasks
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

const ActiveTaskFilterBadge = ({
  filter,
  onClear,
}: {
  filter: TaskStatus | "all";
  onClear: () => void;
}) => {
  if (filter === "all") return null;

  const TASK_STATUS_CONFIG = {
    todo: {
      label: "To Do",
      color: "bg-slate-100 text-slate-700 border-slate-300",
    },
    in_progress: {
      label: "In Progress",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    done: {
      label: "Done",
      color: "bg-green-50 text-green-700 border-green-200",
    },
  } as const;

  const config = TASK_STATUS_CONFIG[filter];

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
  const [activeStatus, setActiveStatus] = useState<TaskStatus | "all">("all");

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

  const { user } = useAuth();
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGINATION);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Data fetching
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams: any = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
      };

      if (debouncedSearchTerm) {
        queryParams.search = debouncedSearchTerm;
      }

      if (activeStatus !== "all") {
        queryParams.status = activeStatus;
      }

      const data: TasksResponse = await getTaskMe(
        pagination.currentPage,
        pagination.itemsPerPage,
        debouncedSearchTerm
      );

      // Filter tasks on client side based on activeStatus
      let filteredTasks = data.tasks || [];
      if (activeStatus !== "all") {
        filteredTasks = filteredTasks.filter(
          (task) => task.status === activeStatus
        );
      }

      setTasks(filteredTasks);
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
        totalItems:
          activeStatus === "all" ? data.total || 0 : filteredTasks.length,
      }));
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setError(err instanceof Error ? err.message : "Failed to load tasks");
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
    fetchTasks();
  }, [fetchTasks]);

  // Event handlers
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handleStatsCardClick = useCallback((status: string) => {
    setActiveStatus(status as TaskStatus | "all");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleClearFilter = useCallback(() => {
    setActiveStatus("all");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleTaskClick = useCallback(
    (task: Task) => setSelectedTask(task),
    []
  );
  const handleCloseModal = useCallback(() => setSelectedTask(null), []);

  const handleStatusChangeClick = useCallback(
    (taskId: string, newStatus: TaskStatus, taskTitle: string) => {
      setConfirmationModal({
        isOpen: true,
        taskId,
        newStatus,
        taskTitle,
      });
    },
    []
  );

  const handleStatusChangeConfirm = useCallback(async () => {
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

      if (
        errorMessage.includes(
          "Team member can only set status to 'in_progress' or 'done'"
        )
      ) {
        setError("You can only update task status to 'In Progress' or 'Done'");
      } else {
        setError(errorMessage);
      }
    } finally {
      setUpdatingTaskId(null);
    }
  }, [confirmationModal, fetchTasks]);

  const handleStatusChangeCancel = useCallback(() => {
    setConfirmationModal({
      isOpen: false,
      taskId: "",
      newStatus: "todo",
      taskTitle: "",
    });
  }, []);

  const handleNoteAdded = useCallback(
    (newNote: Note) => {
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
    },
    [selectedTask, tasks]
  );

  // Refresh handler for TaskNotesModal
  const handleRefresh = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Computed values
  const filteredTasks = useMemo(
    () =>
      activeStatus === "all"
        ? tasks
        : tasks.filter((task) => task.status === activeStatus),
    [tasks, activeStatus]
  );

  const getConfirmationMessage = useCallback(() => {
    const { newStatus, taskTitle } = confirmationModal;

    if (newStatus === "in_progress") {
      return `Start progress on "${taskTitle}"?`;
    } else if (newStatus === "done") {
      return `Mark "${taskTitle}" as complete?`;
    }

    return `Update status of "${taskTitle}"?`;
  }, [confirmationModal]);

  const getConfirmButtonText = useCallback(() => {
    const { newStatus } = confirmationModal;

    if (newStatus === "in_progress") {
      return "Start Progress";
    } else if (newStatus === "done") {
      return "Mark Complete";
    }

    return "Update Status";
  }, [confirmationModal]);

  // Render states
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchTasks} />;

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4">
      <CommonHeader
        title="SKC Project Management"
        subtitle="Team Member Dashboard"
        showNotifications
      />

      <main className="space-y-4">
        {/* Stats Section */}
        <StatsSection
          stats={stats}
          type="tasks"
          onStatsCardClick={handleStatsCardClick}
          activeFilter={activeStatus}
        />

        {/* Tasks Section */}
        <section>
          {/* Compact Section Header */}
          <div className="bg-white rounded-xl border border-[#E1F3F0] overflow-hidden p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-[#F0F7FF]">
                    <FileText className="w-4 h-4 text-[#0E3554]" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#0E3554] truncate">
                    My Tasks ({pagination.totalItems})
                  </h2>
                </div>
                <p className="text-slate-500 text-xs ml-7">
                  Tasks assigned to you across all projects
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-none min-w-0 sm:min-w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-[#E1F3F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-transparent bg-white transition-all text-sm placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Active Filter Badge */}
            {activeStatus !== "all" && (
              <div className="mt-3">
                <ActiveTaskFilterBadge
                  filter={activeStatus}
                  onClear={handleClearFilter}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="my-2">
            {loading ? (
              <LoadingTasksState />
            ) : filteredTasks.length === 0 ? (
              <EmptyTasksState />
            ) : (
              <>
                {/* 4-column grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-4">
                  {filteredTasks.map((task) => (
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
                    pagination={pagination}
                    onPageChange={handlePageChange}
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
          onRefresh={handleRefresh}
          currentUser={user as User}
        />
      )}

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleStatusChangeCancel}
        onConfirm={handleStatusChangeConfirm}
        title="Confirm Status Change"
        message={getConfirmationMessage()}
        confirmText={getConfirmButtonText()}
        variant="info"
      />
    </div>
  );
}

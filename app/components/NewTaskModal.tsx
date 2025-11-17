"use client";

import { createTask } from "@/lib/api/tasks";
import { getTeam } from "@/lib/api/users";
import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  User,
  FileText,
  Target,
  AlertCircle,
  Plus,
  Clock,
  BarChart3,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Users,
} from "lucide-react";

type TaskPriority = "low" | "medium" | "high" | "critical";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface TeamResponse {
  count: number;
  members: User[];
}

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  projectId: string;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  projectId,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as TaskPriority,
    assigneeIds: [] as string[],
  });
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const teamData: TeamResponse = await getTeam();
      setTeamMembers(teamData.members);
    } catch (err) {
      setError("Failed to load team members");
      console.error("Error loading team members:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssigneeChange = (assigneeId: string) => {
    setFormData((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(assigneeId)
        ? prev.assigneeIds.filter((id) => id !== assigneeId)
        : [...prev.assigneeIds, assigneeId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (
        !formData.title.trim() ||
        !formData.description.trim() ||
        !formData.dueDate
      ) {
        setError("Please fill in all required fields");
        return;
      }

      if (new Date(formData.dueDate) < new Date()) {
        setError("Due date cannot be in the past");
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        projectId,
        dueDate: formData.dueDate,
        priority: formData.priority,
        assigneeIds: formData.assigneeIds,
      };

      await createTask(payload);
      onTaskCreated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      assigneeIds: [],
    });
    setError(null);
    onClose();
  };

  const priorityConfig = {
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
  };

  const statusConfig = {
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
  };

  const currentPriority = priorityConfig[formData.priority];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Task</h2>
                <p className="text-slate-300 text-sm mt-1">
                  Add a new task to the project
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div className="space-y-2">
                <p className="text-slate-700 font-medium">
                  Loading team members
                </p>
                <p className="text-slate-500 text-sm">
                  Getting everything ready for you...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <div className="p-1 bg-red-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-red-700 text-sm flex-1 font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Task Title */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Task Title *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                      placeholder-slate-400 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                      hover:border-slate-400 bg-white text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed"
                    placeholder="Enter task title"
                    required
                    disabled={submitting}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Description *
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                      placeholder-slate-400 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                      hover:border-slate-400 bg-white text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
                    placeholder="Enter task description"
                    rows={3}
                    required
                    disabled={submitting}
                  />
                  <div className="absolute left-4 top-4">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Due Date and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Due Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                        hover:border-slate-400 bg-white text-slate-900
                        disabled:bg-slate-50 disabled:cursor-not-allowed"
                      required
                      disabled={submitting}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                        hover:border-slate-400 bg-white text-slate-900
                        disabled:bg-slate-50 disabled:cursor-not-allowed appearance-none"
                      disabled={submitting}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <currentPriority.icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignees */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Assign Team Members
                </label>
                <div className="border border-slate-300 rounded-xl p-4 bg-white max-h-48 overflow-y-auto space-y-3">
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 flex items-center justify-center gap-2">
                      <Users className="w-4 h-4" />
                      No team members available
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <label
                        key={member._id}
                        className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assigneeIds.includes(member._id)}
                          onChange={() => handleAssigneeChange(member._id)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 disabled:opacity-50 w-4 h-4"
                          disabled={submitting}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-slate-800 block">
                            {member.name}
                          </span>
                          <span className="text-xs text-slate-500 block">
                            {member.email} • {member.role}
                          </span>
                        </div>
                        {formData.assigneeIds.includes(member._id) && (
                          <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                        )}
                      </label>
                    ))
                  )}
                </div>
                {formData.assigneeIds.length > 0 && (
                  <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-600" />
                    {formData.assigneeIds.length} team member(s) selected
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-6 bg-white">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="px-6 py-2.5 text-slate-600 hover:text-slate-800 font-medium disabled:opacity-50 transition-colors hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="px-6 py-2.5 rounded-lg font-medium
                bg-slate-900 hover:bg-slate-800
                transition-all duration-200
                disabled:opacity-70 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 text-white"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;

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
      color: "bg-[#E1F3F0] text-[#1CC2B1]",
      icon: TrendingUp,
    },
    medium: {
      label: "Medium",
      color: "bg-[#FFF4DD] text-[#E6A93A]",
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

  const currentPriority = priorityConfig[formData.priority];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-sm border border-[#D9F3EE] w-full max-w-lg max-h-[85vh] overflow-hidden">
        {/* Header - Compact */}
        <div className="bg-white border-b border-[#D9F3EE] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#EFFFFA] rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#0E3554]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0E3554]">New Task</h2>
                <p className="text-slate-600 text-xs mt-0.5">
                  Add task to project
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-[#0E3554] hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-8 h-8 border-2 border-[#D9F3EE] border-t-[#1CC2B1] rounded-full animate-spin mx-auto"></div>
              <div className="space-y-1">
                <p className="text-[#0E3554] font-medium text-sm">
                  Loading team members
                </p>
                <p className="text-slate-500 text-xs">
                  Getting everything ready...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm">
                  <div className="p-1 bg-red-100 rounded">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <p className="text-red-700 flex-1 font-medium">{error}</p>
                </div>
              )}

              {/* Task Title */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#0E3554]">
                  Task Title *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                      placeholder-slate-400 transition-all duration-200
                      focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                      hover:border-[#0E3554] bg-white text-[#0E3554]
                      disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
                    placeholder="Enter task title"
                    required
                    disabled={submitting}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#0E3554]">
                  Description *
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                      placeholder-slate-400 transition-all duration-200
                      focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                      hover:border-[#0E3554] bg-white text-[#0E3554]
                      disabled:bg-[#EFFFFA] disabled:cursor-not-allowed resize-none"
                    placeholder="Enter task description"
                    rows={2}
                    required
                    disabled={submitting}
                  />
                  <div className="absolute left-3 top-2.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Due Date and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#0E3554]">
                    Due Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                        transition-all duration-200
                        focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                        hover:border-[#0E3554] bg-white text-[#0E3554]
                        disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
                      required
                      disabled={submitting}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#0E3554]">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                        transition-all duration-200
                        focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                        hover:border-[#0E3554] bg-white text-[#0E3554]
                        disabled:bg-[#EFFFFA] disabled:cursor-not-allowed appearance-none"
                      disabled={submitting}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <currentPriority.icon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignees */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#0E3554]">
                  Assign Team Members
                </label>
                <div className="border border-[#D9F3EE] rounded-lg p-3 bg-white max-h-40 overflow-y-auto space-y-2">
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-3 text-slate-500 text-xs flex items-center justify-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      No team members available
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <label
                        key={member._id}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#EFFFFA] transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assigneeIds.includes(member._id)}
                          onChange={() => handleAssigneeChange(member._id)}
                          className="rounded border-[#D9F3EE] text-[#0E3554] focus:ring-[#1CC2B1] disabled:opacity-50 w-3.5 h-3.5"
                          disabled={submitting}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-[#0E3554] block">
                            {member.name}
                          </span>
                          <span className="text-xs text-slate-500 block">
                            {member.email}
                          </span>
                        </div>
                        {formData.assigneeIds.includes(member._id) && (
                          <div className="w-1.5 h-1.5 bg-[#0E3554] rounded-full"></div>
                        )}
                      </label>
                    ))
                  )}
                </div>
                {formData.assigneeIds.length > 0 && (
                  <p className="text-xs text-[#0E3554] font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0E3554]" />
                    {formData.assigneeIds.length} team member(s) selected
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer - Compact */}
        <div className="border-t border-[#D9F3EE] p-4 bg-white">
          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 text-sm text-[#0E3554] hover:text-[#1CC2B1] font-medium disabled:opacity-50 transition-colors hover:bg-[#EFFFFA] rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="px-4 py-2 text-sm rounded font-medium
                bg-[#0E3554] hover:bg-[#0A2A42]
                transition-all duration-200
                disabled:opacity-70 disabled:cursor-not-allowed
                flex items-center justify-center gap-1.5 text-white"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
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

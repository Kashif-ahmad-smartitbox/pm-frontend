"use client";

import { updateProject } from "@/lib/api/projects";
import { getProjectTypes } from "@/lib/api/projectTypes";
import { getProjectManagers } from "@/lib/api/users";
import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  MapPin,
  User,
  FolderOpen,
  Target,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type ProjectStatus = "planned" | "active" | "completed";

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

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: () => void;
  project: Project | null; // Allow project to be null
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectUpdated,
  project,
}) => {
  const [formData, setFormData] = useState({
    projectName: "",
    location: "",
    projectManagerId: "",
    projectTypeId: "",
    startDate: "",
    endDate: "",
    status: "planned" as ProjectStatus,
  });
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [projectManagers, setProjectManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && project) {
      fetchModalData();
      setFormData({
        projectName: project.projectName || "",
        location: project.location || "",
        projectManagerId: project.projectManager?._id || "",
        projectTypeId: project.projectType?._id || "",
        startDate: project.startDate ? project.startDate.split("T")[0] : "",
        endDate: project.endDate ? project.endDate.split("T")[0] : "",
        status: project.status || "planned",
      });
    }
  }, [isOpen, project]);

  const fetchModalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [typesData, managersData] = await Promise.all([
        getProjectTypes(),
        getProjectManagers(),
      ]);
      setProjectTypes(typesData);
      setProjectManagers(managersData);
    } catch (err) {
      setError("Failed to load project data");
      console.error("Error loading modal data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate form data
      if (
        !formData.projectName.trim() ||
        !formData.location.trim() ||
        !formData.projectManagerId ||
        !formData.projectTypeId ||
        !formData.startDate ||
        !formData.endDate
      ) {
        setError("Please fill in all required fields");
        return;
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        setError("End date must be after start date");
        return;
      }

      if (!project?._id) {
        setError("Invalid project data");
        return;
      }

      // Prepare payload according to API requirements
      const payload = {
        projectName: formData.projectName.trim(),
        location: formData.location.trim(),
        projectManagerId: formData.projectManagerId,
        projectTypeId: formData.projectTypeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
      };

      await updateProject(project._id, payload);
      onProjectUpdated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const hasChanges = () => {
    if (!project) return false;

    return (
      formData.projectName !== project.projectName ||
      formData.location !== project.location ||
      formData.projectManagerId !== project.projectManager?._id ||
      formData.projectTypeId !== project.projectType?._id ||
      formData.startDate !==
        (project.startDate ? project.startDate.split("T")[0] : "") ||
      formData.endDate !==
        (project.endDate ? project.endDate.split("T")[0] : "") ||
      formData.status !== project.status
    );
  };

  // Don't render if project is not available
  if (!isOpen || !project) return null;

  const statusConfig = {
    planned: {
      label: "Planned",
      color: "bg-blue-50 text-blue-700 border border-blue-200",
      icon: Clock,
      iconColor: "text-blue-600",
    },
    active: {
      label: "Active",
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

  const currentStatus = statusConfig[formData.status];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/60 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl shadow-slate-400/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center border border-white/30">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Project</h2>
                <p className="text-white/80 text-sm mt-1 flex items-center gap-2">
                  <span>Update project details and information</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 disabled:opacity-50"
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
              <div className="relative">
                <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-cyan-600 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-slate-700 font-medium">
                  Loading project data
                </p>
                <p className="text-slate-500 text-sm">
                  Getting everything ready for you...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start space-x-3 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="p-1 bg-red-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-red-700 text-sm flex-1 font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Project Name */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-cyan-600" />
                  Project Name *
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 pl-12 border border-slate-300 rounded-2xl 
                      placeholder-slate-400 shadow-sm transition-all duration-300
                      focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                      hover:border-slate-400 bg-white/50 text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed
                      group-hover:shadow-md"
                    placeholder="Enter project name"
                    required
                    disabled={submitting}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                    <FolderOpen className="w-4 h-4 text-cyan-600" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-600" />
                  Location *
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 pl-12 border border-slate-300 rounded-2xl 
                      placeholder-slate-400 shadow-sm transition-all duration-300
                      focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                      hover:border-slate-400 bg-white/50 text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed
                      group-hover:shadow-md"
                    placeholder="Enter project location"
                    required
                    disabled={submitting}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                    <MapPin className="w-4 h-4 text-cyan-600" />
                  </div>
                </div>
              </div>

              {/* Project Manager */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-600" />
                  Project Manager *
                </label>
                <div className="relative group">
                  <select
                    name="projectManagerId"
                    value={formData.projectManagerId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 pl-12 border border-slate-300 rounded-2xl 
                      shadow-sm transition-all duration-300
                      focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                      hover:border-slate-400 bg-white/50 text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed
                      group-hover:shadow-md appearance-none"
                    required
                    disabled={submitting || projectManagers.length === 0}
                  >
                    <option value="">Select Project Manager</option>
                    {projectManagers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.name} ({manager.email})
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                    <User className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45"></div>
                  </div>
                </div>
                {projectManagers.length === 0 && !loading && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    No project managers available
                  </p>
                )}
              </div>

              {/* Project Type */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-600" />
                  Project Type *
                </label>
                <div className="relative group">
                  <select
                    name="projectTypeId"
                    value={formData.projectTypeId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 pl-12 border border-slate-300 rounded-2xl 
                      shadow-sm transition-all duration-300
                      focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                      hover:border-slate-400 bg-white/50 text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed
                      group-hover:shadow-md appearance-none"
                    required
                    disabled={submitting || projectTypes.length === 0}
                  >
                    <option value="">Select Project Type</option>
                    {projectTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name} - {type.description}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                    <Target className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45"></div>
                  </div>
                </div>
                {projectTypes.length === 0 && !loading && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    No project types available
                  </p>
                )}
              </div>

              {/* Dates and Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                    Start Date *
                  </label>
                  <div className="relative group">
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 pl-12 border border-slate-300 rounded-2xl 
                        shadow-sm transition-all duration-300
                        focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                        hover:border-slate-400 bg-white/50 text-slate-900
                        disabled:bg-slate-50 disabled:cursor-not-allowed
                        group-hover:shadow-md"
                      required
                      disabled={submitting}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                      <Calendar className="w-4 h-4 text-cyan-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                    End Date *
                  </label>
                  <div className="relative group">
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 pl-12 border border-slate-300 rounded-2xl 
                        shadow-sm transition-all duration-300
                        focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                        hover:border-slate-400 bg-white/50 text-slate-900
                        disabled:bg-slate-50 disabled:cursor-not-allowed
                        group-hover:shadow-md"
                      required
                      disabled={submitting}
                      min={formData.startDate}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                      <Calendar className="w-4 h-4 text-cyan-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <currentStatus.icon
                      className={`w-4 h-4 ${currentStatus.iconColor}`}
                    />
                    Status
                  </label>
                  <div className="relative group">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 pl-12 border border-slate-300 rounded-2xl 
                        shadow-sm transition-all duration-300
                        focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                        hover:border-slate-400 bg-white/50 text-slate-900
                        disabled:bg-slate-50 disabled:cursor-not-allowed
                        group-hover:shadow-md appearance-none"
                      disabled={submitting}
                    >
                      <option value="planned">Planned</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                      <currentStatus.icon
                        className={`w-4 h-4 ${currentStatus.iconColor}`}
                      />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200/60 p-6 bg-white/50 backdrop-blur-sm">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="px-6 py-3 text-slate-600 hover:text-slate-800 font-semibold disabled:opacity-50 transition-all duration-200 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || loading || !hasChanges()}
              className="px-8 py-3 rounded-2xl font-semibold shadow-lg shadow-cyan-500/25
                bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700
                transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                disabled:transform-none disabled:opacity-70 disabled:cursor-not-allowed
                flex items-center justify-center space-x-3 text-white relative overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-semibold">Updating Project...</span>
                </>
              ) : (
                <>
                  <span className="font-semibold">Update Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;

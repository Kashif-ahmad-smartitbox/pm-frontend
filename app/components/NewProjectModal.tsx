import { createProject } from "@/lib/api/projects";
import { getProjectTypes } from "@/lib/api/projectTypes";
import { getProjectManagers } from "@/lib/api/users";
import { useEffect, useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  User,
  FolderOpen,
  Target,
  AlertCircle,
  Plus,
} from "lucide-react";

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

const NewProjectModal = ({
  isOpen,
  onClose,
  onProjectCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}) => {
  const [formData, setFormData] = useState({
    projectName: "",
    location: "",
    projectManagerId: "",
    projectTypeId: "",
    startDate: "",
    endDate: "",
  });
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [projectManagers, setProjectManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchModalData();
    }
  }, [isOpen]);

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
      if (
        !formData.projectName.trim() ||
        !formData.location.trim() ||
        !formData.projectManagerId ||
        !formData.projectTypeId ||
        !formData.startDate ||
        !formData.endDate
      ) {
        setError("Please fill in all fields");
        return;
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        setError("End date must be after start date");
        return;
      }

      await createProject(formData);
      onProjectCreated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      projectName: "",
      location: "",
      projectManagerId: "",
      projectTypeId: "",
      startDate: "",
      endDate: "",
    });
    setError(null);
    onClose();
  };

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
                <h2 className="text-lg font-bold text-[#0E3554]">
                  New Project
                </h2>
                <p className="text-slate-600 text-xs mt-0.5">
                  Create a new project
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
                  Loading project data
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

              {/* Project Name */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#0E3554]">
                  Project Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                      placeholder-slate-400 transition-all duration-200
                      focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                      hover:border-[#0E3554] bg-white text-[#0E3554]
                      disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
                    placeholder="Enter project name"
                    required
                    disabled={submitting}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#0E3554]">
                  Location *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                      placeholder-slate-400 transition-all duration-200
                      focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                      hover:border-[#0E3554] bg-white text-[#0E3554]
                      disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
                    placeholder="Enter project location"
                    required
                    disabled={submitting}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Project Manager */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#0E3554]">
                  Project Manager *
                </label>
                <div className="relative">
                  <select
                    name="projectManagerId"
                    value={formData.projectManagerId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                      transition-all duration-200
                      focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                      hover:border-[#0E3554] bg-white text-[#0E3554]
                      disabled:bg-[#EFFFFA] disabled:cursor-not-allowed appearance-none"
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
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 transform rotate-45"></div>
                  </div>
                </div>
                {projectManagers.length === 0 && !loading && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    No project managers available
                  </p>
                )}
              </div>

              {/* Project Type */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#0E3554]">
                  Project Type *
                </label>
                <div className="relative">
                  <select
                    name="projectTypeId"
                    value={formData.projectTypeId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                      transition-all duration-200
                      focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                      hover:border-[#0E3554] bg-white text-[#0E3554]
                      disabled:bg-[#EFFFFA] disabled:cursor-not-allowed appearance-none"
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
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Target className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 transform rotate-45"></div>
                  </div>
                </div>
                {projectTypes.length === 0 && !loading && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    No project types available
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#0E3554]">
                    Start Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                        transition-all duration-200
                        focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                        hover:border-[#0E3554] bg-white text-[#0E3554]
                        disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
                      required
                      disabled={submitting}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#0E3554]">
                    End Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                        transition-all duration-200
                        focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                        hover:border-[#0E3554] bg-white text-[#0E3554]
                        disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
                      required
                      disabled={submitting}
                      min={formData.startDate}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>
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
              disabled={
                submitting ||
                loading ||
                projectManagers.length === 0 ||
                projectTypes.length === 0
              }
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
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;

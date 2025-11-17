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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Project</h2>
                <p className="text-slate-300 text-sm mt-1">
                  Fill in the details to create a new project
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
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
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
                <label className="block text-sm font-semibold text-slate-700">
                  Project Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                      placeholder-slate-400 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                      hover:border-slate-400 bg-white text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed"
                    placeholder="Enter project name"
                    required
                    disabled={submitting}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <FolderOpen className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Location *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                      placeholder-slate-400 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                      hover:border-slate-400 bg-white text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed"
                    placeholder="Enter project location"
                    required
                    disabled={submitting}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Project Manager */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Project Manager *
                </label>
                <div className="relative">
                  <select
                    name="projectManagerId"
                    value={formData.projectManagerId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                      hover:border-slate-400 bg-white text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed appearance-none"
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
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <User className="w-4 h-4 text-slate-400" />
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
                <label className="block text-sm font-semibold text-slate-700">
                  Project Type *
                </label>
                <div className="relative">
                  <select
                    name="projectTypeId"
                    value={formData.projectTypeId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                      hover:border-slate-400 bg-white text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed appearance-none"
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
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Target className="w-4 h-4 text-slate-400" />
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

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Start Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
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
                    End Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                        hover:border-slate-400 bg-white text-slate-900
                        disabled:bg-slate-50 disabled:cursor-not-allowed"
                      required
                      disabled={submitting}
                      min={
                        formData.startDate ||
                        new Date().toISOString().split("T")[0]
                      }
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
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
              disabled={
                submitting ||
                loading ||
                projectManagers.length === 0 ||
                projectTypes.length === 0
              }
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

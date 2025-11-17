"use client";

import React, { useState, useEffect } from "react";
import {
  createProjectType,
  deleteProjectType,
  updateProjectType,
  getProjectTypes,
} from "@/lib/api/projectTypes";
import {
  X,
  FolderPlus,
  Folder,
  Edit,
  Trash2,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Save,
  ArrowLeft,
  FileText,
  Type,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

interface ProjectType {
  _id: string;
  name: string;
  description: string;
}

interface ProjectTypeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectTypeCreated: () => void;
}

const ProjectTypeManagementModal: React.FC<ProjectTypeManagementModalProps> = ({
  isOpen,
  onClose,
  onProjectTypeCreated,
}) => {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [editFormData, setEditFormData] = useState<{
    [key: string]: {
      name: string;
      description: string;
    };
  }>({});
  const [editingProjectType, setEditingProjectType] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Confirmation modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    projectTypeId: string | null;
    projectTypeName: string;
  }>({ isOpen: false, projectTypeId: null, projectTypeName: "" });

  useEffect(() => {
    if (isOpen && activeTab === "existing") {
      fetchProjectTypes();
    }
  }, [isOpen, activeTab]);

  const fetchProjectTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectTypes();
      setProjectTypes(data.projectTypes || data);
      // Initialize edit form data for each project type
      const editData: typeof editFormData = {};
      (data.projectTypes || data).forEach((projectType: ProjectType) => {
        editData[projectType._id] = {
          name: projectType.name,
          description: projectType.description,
        };
      });
      setEditFormData(editData);
    } catch (err) {
      setError("Failed to load project types");
      console.error("Error loading project types:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (
    projectTypeId: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [projectTypeId]: {
        ...prev[projectTypeId],
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.name.trim()) {
        setError("Please fill in the project type name");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      await createProjectType(payload);

      setSuccess("Project type created successfully!");
      setFormData({
        name: "",
        description: "",
      });
      onProjectTypeCreated();

      setTimeout(() => {
        setActiveTab("existing");
        fetchProjectTypes();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create project type"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProjectType = async (projectTypeId: string) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const projectTypeData = editFormData[projectTypeId];

      if (!projectTypeData.name.trim()) {
        setError("Please fill in the project type name");
        return;
      }

      const payload = {
        name: projectTypeData.name.trim(),
        description: projectTypeData.description.trim(),
      };

      await updateProjectType(projectTypeId, payload);
      setSuccess("Project type updated successfully!");
      setEditingProjectType(null);
      fetchProjectTypes();

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update project type"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProjectType = async (
    projectTypeId: string,
    projectTypeName: string
  ) => {
    setDeleteConfirm({
      isOpen: true,
      projectTypeId,
      projectTypeName,
    });
    setMenuOpen(null);
  };

  const confirmDeleteProjectType = async () => {
    if (!deleteConfirm.projectTypeId) return;

    setError(null);
    try {
      await deleteProjectType(deleteConfirm.projectTypeId);
      setProjectTypes(
        projectTypes.filter(
          (projectType) => projectType._id !== deleteConfirm.projectTypeId
        )
      );
      setSuccess("Project type deleted successfully!");

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete project type"
      );
    } finally {
      setDeleteConfirm({
        isOpen: false,
        projectTypeId: null,
        projectTypeName: "",
      });
    }
  };

  const toggleMenu = (projectTypeId: string) => {
    setMenuOpen(menuOpen === projectTypeId ? null : projectTypeId);
  };

  const startEditing = (projectTypeId: string) => {
    setEditingProjectType(projectTypeId);
    setMenuOpen(null);
  };

  const cancelEditing = () => {
    setEditingProjectType(null);
    // Reset form data for the project type being edited
    if (editingProjectType) {
      const projectType = projectTypes.find(
        (pt) => pt._id === editingProjectType
      );
      if (projectType) {
        setEditFormData((prev) => ({
          ...prev,
          [editingProjectType]: {
            name: projectType.name,
            description: projectType.description,
          },
        }));
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
    });
    setError(null);
    setSuccess(null);
    setActiveTab("existing");
    setMenuOpen(null);
    setEditingProjectType(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-sm border border-[#D9F3EE] overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#0E3554] to-[#1CC2B1] text-white p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                  <Folder className="w-6 h-6 text-[#0E3554]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Project Type Management</h2>
                  <p className="text-teal-100 text-sm mt-1">
                    Manage different types of projects
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#D9F3EE] bg-white flex-shrink-0">
            <div className="flex">
              <button
                onClick={() => setActiveTab("existing")}
                className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === "existing"
                    ? "border-[#0E3554] text-[#0E3554] bg-[#EFFFFA]"
                    : "border-transparent text-slate-500 hover:text-[#0E3554] hover:bg-[#EFFFFA]"
                }`}
              >
                <div className="flex items-center gap-2 justify-center">
                  <Folder className="w-4 h-4" />
                  Existing Project Types ({projectTypes.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("new")}
                className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === "new"
                    ? "border-[#0E3554] text-[#0E3554] bg-[#EFFFFA]"
                    : "border-transparent text-slate-500 hover:text-[#0E3554] hover:bg-[#EFFFFA]"
                }`}
              >
                <div className="flex items-center gap-2 justify-center">
                  <FolderPlus className="w-4 h-4" />
                  Add New Project Type
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6">
              {activeTab === "existing" ? (
                // Existing Project Types Tab
                <div>
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 mb-6">
                      <div className="p-1 bg-red-100 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <p className="text-red-700 text-sm flex-1 font-medium">
                        {error}
                      </p>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 rounded-xl bg-[#E1F3F0] border border-[#1CC2B1] flex items-start gap-3 mb-6">
                      <div className="p-1 bg-[#1CC2B1] rounded-lg">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-[#1CC2B1] text-sm flex-1 font-medium">
                        {success}
                      </p>
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-12 h-12 border-3 border-[#D9F3EE] border-t-[#1CC2B1] rounded-full animate-spin mx-auto"></div>
                      <div className="space-y-2">
                        <p className="text-[#0E3554] font-medium">
                          Loading project types
                        </p>
                        <p className="text-slate-500 text-sm">
                          Getting project type information...
                        </p>
                      </div>
                    </div>
                  ) : projectTypes.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-[#EFFFFA] rounded-2xl flex items-center justify-center mx-auto">
                        <Folder className="w-8 h-8 text-[#0E3554]" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#0E3554]">
                          No project types found
                        </h3>
                        <p className="text-slate-600">
                          Get started by adding your first project type
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("new")}
                        className="px-6 py-3 bg-[#0E3554] text-white rounded-lg font-medium hover:bg-[#0A2A42] transition-colors flex items-center gap-2 mx-auto"
                      >
                        <FolderPlus className="w-4 h-4" />
                        Add First Project Type
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projectTypes.map((projectType) => (
                        <div
                          key={projectType._id}
                          className="bg-white border border-[#D9F3EE] rounded-2xl p-4 hover:border-[#1CC2B1] transition-all duration-300 group relative"
                        >
                          {editingProjectType === projectType._id ? (
                            // Edit Mode
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-[#0E3554]">
                                  Edit Project Type
                                </h4>
                              </div>

                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[#0E3554]">
                                    Name *
                                  </label>
                                  <input
                                    type="text"
                                    name="name"
                                    value={
                                      editFormData[projectType._id]?.name || ""
                                    }
                                    onChange={(e) =>
                                      handleEditInputChange(projectType._id, e)
                                    }
                                    className="w-full px-3 py-2 border border-[#D9F3EE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1CC2B1] focus:border-[#1CC2B1] text-[#0E3554]"
                                    placeholder="Enter project type name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[#0E3554]">
                                    Description
                                  </label>
                                  <textarea
                                    name="description"
                                    value={
                                      editFormData[projectType._id]
                                        ?.description || ""
                                    }
                                    onChange={(e) =>
                                      handleEditInputChange(projectType._id, e)
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 border border-[#D9F3EE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1CC2B1] focus:border-[#1CC2B1] resize-none text-[#0E3554]"
                                    placeholder="Enter project type description"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-3 pt-4 border-t border-[#D9F3EE]">
                                <button
                                  onClick={cancelEditing}
                                  disabled={submitting}
                                  className="px-4 py-2 text-[#0E3554] hover:text-[#1CC2B1] font-medium disabled:opacity-50 transition-colors hover:bg-[#EFFFFA] rounded-lg flex items-center gap-2"
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    handleEditProjectType(projectType._id)
                                  }
                                  disabled={submitting}
                                  className="px-4 py-2 bg-[#0E3554] text-white rounded-lg font-medium hover:bg-[#0A2A42] transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                  <Save className="w-4 h-4" />
                                  {submitting ? "Saving..." : "Save Changes"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-[#E0FFFA] rounded-xl flex items-center justify-center text-[#0E3554]">
                                  <Type className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-[#0E3554] truncate">
                                    {projectType.name}
                                  </h4>
                                  <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                                    {projectType.description ||
                                      "No description provided"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <button
                                    onClick={() => toggleMenu(projectType._id)}
                                    className="p-2 text-slate-400 hover:text-[#0E3554] rounded-lg hover:bg-[#EFFFFA] transition-colors"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>

                                  {menuOpen === projectType._id && (
                                    <div className="absolute right-0 top-10 bg-white border border-[#D9F3EE] rounded-xl shadow-lg z-10 min-w-36 overflow-hidden">
                                      <button
                                        onClick={() =>
                                          startEditing(projectType._id)
                                        }
                                        className="w-full px-4 py-3 text-left text-sm text-[#0E3554] hover:bg-[#EFFFFA] flex items-center gap-2 transition-colors"
                                      >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteProjectType(
                                            projectType._id,
                                            projectType.name
                                          )
                                        }
                                        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Add New Project Type Tab
                <div>
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 mb-6">
                      <div className="p-1 bg-red-100 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <p className="text-red-700 text-sm flex-1 font-medium">
                        {error}
                      </p>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 rounded-xl bg-[#E1F3F0] border border-[#1CC2B1] flex items-start gap-3 mb-6">
                      <div className="p-1 bg-[#1CC2B1] rounded-lg">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-[#1CC2B1] text-sm flex-1 font-medium">
                        {success}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-[#0E3554]">
                        Project Type Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pl-12 border border-[#D9F3EE] rounded-xl 
                            placeholder-slate-400 transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                            hover:border-[#0E3554] bg-white text-[#0E3554]
                            disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
                          placeholder="Enter project type name (e.g., Infrastructure, Construction)"
                          required
                          disabled={submitting}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <Type className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-[#0E3554]">
                        Description
                      </label>
                      <div className="relative">
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 pl-12 border border-[#D9F3EE] rounded-xl 
                            placeholder-slate-400 transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                            hover:border-[#0E3554] bg-white text-[#0E3554] resize-none
                            disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
                          placeholder="Enter project type description (e.g., Roads, bridges, construction projects)"
                          disabled={submitting}
                        />
                        <div className="absolute left-4 top-4">
                          <FileText className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm">
                        Optional: Provide a brief description of what this
                        project type includes
                      </p>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#D9F3EE] p-6 bg-white flex-shrink-0">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                disabled={submitting}
                className="px-6 py-2.5 text-[#0E3554] hover:text-[#1CC2B1] font-medium disabled:opacity-50 transition-colors hover:bg-[#EFFFFA] rounded-lg"
              >
                {activeTab === "existing" ? "Close" : "Cancel"}
              </button>
              {activeTab === "new" && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg font-medium
                    bg-[#0E3554] hover:bg-[#0A2A42]
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
                      <FolderPlus className="w-4 h-4" />
                      <span>Create Project Type</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            projectTypeId: null,
            projectTypeName: "",
          })
        }
        onConfirm={confirmDeleteProjectType}
        title="Delete Project Type"
        message={`Are you sure you want to delete "${deleteConfirm.projectTypeName}"? This action cannot be undone.`}
        confirmText="Delete Project Type"
        variant="danger"
      />
    </>
  );
};

export default ProjectTypeManagementModal;

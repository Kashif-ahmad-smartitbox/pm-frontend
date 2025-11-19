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

type TabType = "existing" | "new";

const ProjectTypeManagementModal: React.FC<ProjectTypeManagementModalProps> = ({
  isOpen,
  onClose,
  onProjectTypeCreated,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("existing");
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editFormData, setEditFormData] = useState<
    Record<string, { name: string; description: string }>
  >({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({ isOpen: false, id: null, name: "" });

  // Fetch project types when modal opens
  useEffect(() => {
    if (isOpen && activeTab === "existing") {
      fetchProjectTypes();
    }
  }, [isOpen, activeTab]);

  const fetchProjectTypes = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await getProjectTypes();
      const types = data.projectTypes || data;
      setProjectTypes(types);

      // Initialize edit form data
      const editData: typeof editFormData = {};
      types.forEach((type: ProjectType) => {
        editData[type._id] = { name: type.name, description: type.description };
      });
      setEditFormData(editData);
    } catch {
      setMessage({ type: "error", text: "Failed to load project types" });
    } finally {
      setLoading(false);
    }
  };

  const handleApiCall = async (
    apiCall: () => Promise<void>,
    successMsg: string
  ) => {
    setSubmitting(true);
    setMessage(null);
    try {
      await apiCall();
      setMessage({ type: "success", text: successMsg });
      return true;
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Operation failed",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMessage({
        type: "error",
        text: "Please fill in the project type name",
      });
      return;
    }

    const success = await handleApiCall(async () => {
      await createProjectType({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
    }, "Project type created successfully!");

    if (success) {
      setFormData({ name: "", description: "" });
      onProjectTypeCreated();
      setTimeout(() => {
        setActiveTab("existing");
        fetchProjectTypes();
      }, 1500);
    }
  };

  const handleEdit = async (id: string) => {
    const typeData = editFormData[id];
    if (!typeData?.name.trim()) {
      setMessage({
        type: "error",
        text: "Please fill in the project type name",
      });
      return;
    }

    await handleApiCall(async () => {
      await updateProjectType(id, {
        name: typeData.name.trim(),
        description: typeData.description.trim(),
      });
    }, "Project type updated successfully!");

    setEditingId(null);
    fetchProjectTypes();
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, id, name });
    setMenuOpen(null);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    const success = await handleApiCall(async () => {
      await deleteProjectType(deleteConfirm.id!);
      setProjectTypes((types) =>
        types.filter((type) => type._id !== deleteConfirm.id)
      );
    }, "Project type deleted successfully!");

    setDeleteConfirm({ isOpen: false, id: null, name: "" });
  };

  const resetEditData = (id: string) => {
    const type = projectTypes.find((pt) => pt._id === id);
    if (type) {
      setEditFormData((prev) => ({
        ...prev,
        [id]: { name: type.name, description: type.description },
      }));
    }
  };

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setMessage(null);
    setActiveTab("existing");
    setMenuOpen(null);
    setEditingId(null);
    onClose();
  };

  if (!isOpen) return null;

  const tabs = [
    {
      key: "existing" as TabType,
      label: "Existing Types",
      icon: Folder,
      count: projectTypes.length,
    },
    { key: "new" as TabType, label: "Add New", icon: FolderPlus },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-sm border border-[#D9F3EE] overflow-hidden w-full max-w-2xl max-h-[85vh] flex flex-col">
          {/* Header - Compact */}
          <div className="bg-white border-b border-[#D9F3EE] p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#EFFFFA] rounded-lg flex items-center justify-center">
                  <Folder className="w-4 h-4 text-[#0E3554]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0E3554]">
                    Project Types
                  </h2>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Manage project types
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-[#0E3554] hover:bg-slate-100 rounded transition-colors"
                disabled={submitting}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs - Compact */}
          <div className="border-b border-[#D9F3EE] bg-white flex-shrink-0">
            <div className="flex">
              {tabs.map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 px-4 py-3 text-xs font-semibold border-b-2 transition-all duration-200 ${
                    activeTab === key
                      ? "border-[#0E3554] text-[#0E3554] bg-[#EFFFFA]"
                      : "border-transparent text-slate-500 hover:text-[#0E3554] hover:bg-[#EFFFFA]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 justify-center">
                    <Icon className="w-3.5 h-3.5" />
                    {label} {count !== undefined && `(${count})`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content - Compact */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4">
            {/* Message Display - Compact */}
            {message && (
              <div
                className={`p-3 rounded-lg border flex items-start gap-2 mb-4 text-sm ${
                  message.type === "error"
                    ? "bg-red-50 border-red-200"
                    : "bg-[#E1F3F0] border-[#1CC2B1]"
                }`}
              >
                <div
                  className={`p-1 rounded ${
                    message.type === "error" ? "bg-red-100" : "bg-[#1CC2B1]"
                  }`}
                >
                  {message.type === "error" ? (
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <p
                  className={`flex-1 font-medium ${
                    message.type === "error" ? "text-red-700" : "text-[#1CC2B1]"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )}

            {activeTab === "existing" ? (
              <ExistingTypesTab
                loading={loading}
                projectTypes={projectTypes}
                editingId={editingId}
                editFormData={editFormData}
                submitting={submitting}
                menuOpen={menuOpen}
                onEditChange={handleEdit}
                onDelete={handleDelete}
                onMenuToggle={setMenuOpen}
                onEditStart={setEditingId}
                onEditCancel={() => {
                  if (editingId) resetEditData(editingId);
                  setEditingId(null);
                }}
                onEditInputChange={(id, e) => {
                  const { name, value } = e.target;
                  setEditFormData((prev) => ({
                    ...prev,
                    [id]: { ...prev[id], [name]: value },
                  }));
                }}
                onAddNew={() => setActiveTab("new")}
              />
            ) : (
              <NewTypeTab
                formData={formData}
                submitting={submitting}
                onInputChange={(e) => {
                  const { name, value } = e.target;
                  setFormData((prev) => ({ ...prev, [name]: value }));
                }}
                onSubmit={handleSubmit}
              />
            )}
          </div>

          {/* Footer - Compact */}
          <div className="border-t border-[#D9F3EE] p-4 bg-white flex-shrink-0">
            <div className="flex justify-end gap-2">
              <button
                onClick={handleClose}
                disabled={submitting}
                className="px-4 py-2 text-sm text-[#0E3554] hover:text-[#1CC2B1] font-medium disabled:opacity-50 transition-colors hover:bg-[#EFFFFA] rounded"
              >
                {activeTab === "existing" ? "Close" : "Cancel"}
              </button>
              {activeTab === "new" && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-2 text-sm rounded font-medium bg-[#0E3554] hover:bg-[#0A2A42] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-white"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Create</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: "" })}
        onConfirm={confirmDelete}
        title="Delete Project Type"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmText="Delete Project Type"
        variant="danger"
      />
    </>
  );
};

// Sub-components for better organization
const ExistingTypesTab: React.FC<{
  loading: boolean;
  projectTypes: ProjectType[];
  editingId: string | null;
  editFormData: Record<string, { name: string; description: string }>;
  submitting: boolean;
  menuOpen: string | null;
  onEditChange: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onMenuToggle: (id: string | null) => void;
  onEditStart: (id: string) => void;
  onEditCancel: () => void;
  onEditInputChange: (
    id: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onAddNew: () => void;
}> = ({
  loading,
  projectTypes,
  editingId,
  editFormData,
  submitting,
  menuOpen,
  onEditChange,
  onDelete,
  onMenuToggle,
  onEditStart,
  onEditCancel,
  onEditInputChange,
  onAddNew,
}) => {
  if (loading) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="w-8 h-8 border-2 border-[#D9F3EE] border-t-[#1CC2B1] rounded-full animate-spin mx-auto"></div>
        <div className="space-y-1">
          <p className="text-[#0E3554] font-medium text-sm">Loading types</p>
          <p className="text-slate-500 text-xs">Getting project types...</p>
        </div>
      </div>
    );
  }

  if (projectTypes.length === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="w-12 h-12 bg-[#EFFFFA] rounded-lg flex items-center justify-center mx-auto">
          <Folder className="w-6 h-6 text-[#0E3554]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#0E3554]">
            No project types
          </h3>
          <p className="text-slate-600 text-sm">Add your first project type</p>
        </div>
        <button
          onClick={onAddNew}
          className="px-4 py-2 text-sm bg-[#0E3554] text-white rounded font-medium hover:bg-[#0A2A42] transition-colors flex items-center gap-1.5 mx-auto"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          Add First Type
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projectTypes.map((type) => (
        <div
          key={type._id}
          className="bg-white border border-[#D9F3EE] rounded-lg p-3 hover:border-[#1CC2B1] transition-all duration-200 group relative"
        >
          {editingId === type._id ? (
            <EditForm
              type={type}
              data={editFormData[type._id]}
              submitting={submitting}
              onInputChange={(e) => onEditInputChange(type._id, e)}
              onSave={() => onEditChange(type._id)}
              onCancel={onEditCancel}
            />
          ) : (
            <ViewMode
              type={type}
              menuOpen={menuOpen === type._id}
              onMenuToggle={() =>
                onMenuToggle(menuOpen === type._id ? null : type._id)
              }
              onEditStart={() => onEditStart(type._id)}
              onDelete={() => onDelete(type._id, type.name)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const EditForm: React.FC<{
  type: ProjectType;
  data: { name: string; description: string };
  submitting: boolean;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSave: () => void;
  onCancel: () => void;
}> = ({ type, data, submitting, onInputChange, onSave, onCancel }) => (
  <div className="space-y-3">
    <h4 className="font-semibold text-[#0E3554] text-sm">Edit Project Type</h4>
    <div className="space-y-3">
      <FormField
        label="Name *"
        name="name"
        value={data?.name || ""}
        onChange={onInputChange}
        type="text"
        placeholder="Enter project type name"
      />
      <FormField
        label="Description"
        name="description"
        value={data?.description || ""}
        onChange={onInputChange}
        type="textarea"
        placeholder="Enter project type description"
      />
    </div>
    <div className="flex justify-end gap-2 pt-3 border-t border-[#D9F3EE]">
      <button
        onClick={onCancel}
        disabled={submitting}
        className="px-3 py-1.5 text-xs text-[#0E3554] hover:text-[#1CC2B1] font-medium disabled:opacity-50 transition-colors hover:bg-[#EFFFFA] rounded flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={submitting}
        className="px-3 py-1.5 text-xs bg-[#0E3554] text-white rounded font-medium hover:bg-[#0A2A42] transition-colors disabled:opacity-50 flex items-center gap-1.5"
      >
        <Save className="w-3.5 h-3.5" />
        {submitting ? "Saving..." : "Save"}
      </button>
    </div>
  </div>
);

const ViewMode: React.FC<{
  type: ProjectType;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onEditStart: () => void;
  onDelete: () => void;
}> = ({ type, menuOpen, onMenuToggle, onEditStart, onDelete }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-8 h-8 bg-[#E0FFFA] rounded flex items-center justify-center text-[#0E3554]">
        <Type className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-[#0E3554] text-sm truncate">
          {type.name}
        </h4>
        <p className="text-slate-600 text-xs mt-0.5 line-clamp-2">
          {type.description || "No description provided"}
        </p>
      </div>
    </div>
    <div className="relative">
      <button
        onClick={onMenuToggle}
        className="p-1.5 text-slate-400 hover:text-[#0E3554] rounded hover:bg-[#EFFFFA] transition-colors"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-8 bg-white border border-[#D9F3EE] rounded-lg shadow-lg z-10 min-w-32 overflow-hidden">
          <button
            onClick={onEditStart}
            className="w-full px-3 py-2 text-left text-xs text-[#0E3554] hover:bg-[#EFFFFA] flex items-center gap-1.5 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  </div>
);

const NewTypeTab: React.FC<{
  formData: { name: string; description: string };
  submitting: boolean;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({ formData, submitting, onInputChange, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <FormField
      label="Project Type Name *"
      name="name"
      value={formData.name}
      onChange={onInputChange}
      type="text"
      placeholder="Enter project type name"
      icon={Type}
      required
      disabled={submitting}
    />
    <FormField
      label="Description"
      name="description"
      value={formData.description}
      onChange={onInputChange}
      type="textarea"
      placeholder="Enter project type description"
      icon={FileText}
      disabled={submitting}
      helperText="Optional: Provide a brief description"
    />
  </form>
);

const FormField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  type: "text" | "textarea";
  placeholder: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}> = ({
  label,
  name,
  value,
  onChange,
  type,
  placeholder,
  icon: Icon,
  required,
  disabled,
  helperText,
}) => (
  <div className="space-y-2">
    <label className="block text-xs font-semibold text-[#0E3554]">
      {label}
    </label>
    <div className="relative">
      {type === "text" ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1] hover:border-[#0E3554] bg-white text-[#0E3554] disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      ) : (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={3}
          className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1] hover:border-[#0E3554] bg-white text-[#0E3554] resize-none disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {Icon && (
        <div
          className={`absolute left-3 ${
            type === "text" ? "top-1/2 -translate-y-1/2" : "top-2.5"
          }`}
        >
          <Icon className="w-3.5 h-3.5 text-slate-400" />
        </div>
      )}
    </div>
    {helperText && <p className="text-slate-500 text-xs">{helperText}</p>}
  </div>
);

export default ProjectTypeManagementModal;

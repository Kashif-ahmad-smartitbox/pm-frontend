"use client";

import React, { useState, useEffect } from "react";
import { getUsers, createTeam, deleteUser, updateUser } from "@/lib/api/users";
import {
  X,
  UserPlus,
  Users,
  Mail,
  Lock,
  User,
  Trash2,
  MoreVertical,
  Edit,
  AlertCircle,
  CheckCircle,
  Save,
  ArrowLeft,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [editFormData, setEditFormData] = useState<{
    [key: string]: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    };
  }>({});
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Confirmation modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({ isOpen: false, userId: null, userName: "" });

  useEffect(() => {
    if (isOpen && activeTab === "existing") {
      fetchUsers();
    }
  }, [isOpen, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      const teamMembers = data.users;
      setUsers(teamMembers);

      const editData: typeof editFormData = {};
      teamMembers.forEach((user: User) => {
        editData[user._id] = {
          name: user.name,
          email: user.email,
          password: "",
          confirmPassword: "",
        };
      });
      setEditFormData(editData);
    } catch (err) {
      setError("Failed to load team members");
      console.error("Error loading team members:", err);
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

  const handleEditInputChange = (
    userId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
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
      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.password
      ) {
        setError("Please fill in all required fields");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      await createTeam(payload);

      setSuccess("Team Member created successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      onUserCreated();

      setTimeout(() => {
        setActiveTab("existing");
        fetchUsers();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create team member"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (userId: string) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const userData = editFormData[userId];

      if (!userData.name.trim() || !userData.email.trim()) {
        setError("Please fill in name and email");
        return;
      }

      if (userData.password && userData.password !== userData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (userData.password && userData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      const payload: any = {
        name: userData.name.trim(),
        email: userData.email.trim(),
      };

      // Only include password if it's provided
      if (userData.password) {
        payload.password = userData.password;
      }

      await updateUser(userId, payload);
      setSuccess("Team member updated successfully!");
      setEditingUser(null);
      fetchUsers();

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update team member"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setDeleteConfirm({ isOpen: true, userId, userName });
    setMenuOpen(null);
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirm.userId) return;

    setError(null);
    try {
      await deleteUser(deleteConfirm.userId);
      setUsers(users.filter((user) => user._id !== deleteConfirm.userId));
      setSuccess("Team member deleted successfully!");

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete team member"
      );
    } finally {
      setDeleteConfirm({ isOpen: false, userId: null, userName: "" });
    }
  };

  const toggleMenu = (userId: string) => {
    setMenuOpen(menuOpen === userId ? null : userId);
  };

  const startEditing = (userId: string) => {
    setEditingUser(userId);
    setMenuOpen(null);
  };

  const cancelEditing = () => {
    setEditingUser(null);
    // Reset form data for the user being edited
    if (editingUser) {
      const user = users.find((u) => u._id === editingUser);
      if (user) {
        setEditFormData((prev) => ({
          ...prev,
          [editingUser]: {
            name: user.name,
            email: user.email,
            password: "",
            confirmPassword: "",
          },
        }));
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setError(null);
    setSuccess(null);
    setActiveTab("existing");
    setMenuOpen(null);
    setEditingUser(null);
    onClose();
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      team_member: {
        label: "Team Member",
        color: "bg-blue-50 text-blue-700",
        icon: Users,
      },
      admin: {
        label: "Admin",
        color: "bg-red-50 text-red-700",
        icon: User,
      },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || {
      label: role,
      color: "bg-slate-50 text-slate-700",
      icon: User,
    };

    const IconComponent = config.icon;

    return (
      <span
        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${config.color} flex items-center gap-1.5`}
      >
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-slate-900 text-white p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Team Management</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    Manage team members and their access
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

          {/* Tabs */}
          <div className="border-b border-slate-100 bg-white flex-shrink-0">
            <div className="flex">
              <button
                onClick={() => setActiveTab("existing")}
                className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === "existing"
                    ? "border-slate-900 text-slate-900 bg-slate-50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 justify-center">
                  <User className="w-4 h-4" />
                  Team Members ({users.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("new")}
                className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === "new"
                    ? "border-slate-900 text-slate-900 bg-slate-50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 justify-center">
                  <UserPlus className="w-4 h-4" />
                  Add Team Member
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6">
              {activeTab === "existing" ? (
                // Existing Team Members Tab
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
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 mb-6">
                      <div className="p-1 bg-emerald-100 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-emerald-700 text-sm flex-1 font-medium">
                        {success}
                      </p>
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-12 h-12 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                      <div className="space-y-2">
                        <p className="text-slate-700 font-medium">
                          Loading team members
                        </p>
                        <p className="text-slate-500 text-sm">
                          Getting team information...
                        </p>
                      </div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-800">
                          No team members found
                        </h3>
                        <p className="text-slate-600">
                          Get started by adding team members to your projects
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("new")}
                        className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add First Team Member
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div
                          key={user._id}
                          className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-slate-200 transition-all duration-300 group relative"
                        >
                          {editingUser === user._id ? (
                            // Edit Mode
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-slate-800">
                                  Edit Team Member
                                </h4>
                                <div className="flex items-center gap-2">
                                  {getRoleBadge(user.role)}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-slate-700">
                                    Name *
                                  </label>
                                  <input
                                    type="text"
                                    name="name"
                                    value={editFormData[user._id]?.name || ""}
                                    onChange={(e) =>
                                      handleEditInputChange(user._id, e)
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                                    placeholder="Enter name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-slate-700">
                                    Email *
                                  </label>
                                  <input
                                    type="email"
                                    name="email"
                                    value={editFormData[user._id]?.email || ""}
                                    onChange={(e) =>
                                      handleEditInputChange(user._id, e)
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                                    placeholder="Enter email"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-slate-700">
                                    New Password
                                  </label>
                                  <input
                                    type="password"
                                    name="password"
                                    value={
                                      editFormData[user._id]?.password || ""
                                    }
                                    onChange={(e) =>
                                      handleEditInputChange(user._id, e)
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                                    placeholder="Leave blank to keep current"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-slate-700">
                                    Confirm Password
                                  </label>
                                  <input
                                    type="password"
                                    name="confirmPassword"
                                    value={
                                      editFormData[user._id]?.confirmPassword ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleEditInputChange(user._id, e)
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                                    placeholder="Confirm new password"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                  onClick={cancelEditing}
                                  disabled={submitting}
                                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium disabled:opacity-50 transition-colors hover:bg-slate-100 rounded-lg flex items-center gap-2"
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleEditUser(user._id)}
                                  disabled={submitting}
                                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
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
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 font-semibold text-lg">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-800 truncate">
                                    {user.name}
                                  </h4>
                                  <p className="text-slate-600 text-sm truncate">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {getRoleBadge(user.role)}

                                <div className="relative">
                                  <button
                                    onClick={() => toggleMenu(user._id)}
                                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>

                                  {menuOpen === user._id && (
                                    <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-36 overflow-hidden">
                                      <button
                                        onClick={() => startEditing(user._id)}
                                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                      >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteUser(user._id, user.name)
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
                // Add New Team Member Tab
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
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 mb-6">
                      <div className="p-1 bg-emerald-100 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-emerald-700 text-sm flex-1 font-medium">
                        {success}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Type Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-blue-800">
                            Team Member
                          </div>
                          <div className="text-sm text-blue-600">
                            Can be assigned to tasks and projects
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                            placeholder-slate-400 transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                            hover:border-slate-400 bg-white text-slate-900
                            disabled:bg-slate-50 disabled:cursor-not-allowed"
                          placeholder="Enter full name"
                          required
                          disabled={submitting}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Email Address *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                            placeholder-slate-400 transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                            hover:border-slate-400 bg-white text-slate-900
                            disabled:bg-slate-50 disabled:cursor-not-allowed"
                          placeholder="Enter email address"
                          required
                          disabled={submitting}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <Mail className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                              transition-all duration-200
                              focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                              hover:border-slate-400 bg-white text-slate-900
                              disabled:bg-slate-50 disabled:cursor-not-allowed"
                            placeholder="Enter password"
                            required
                            disabled={submitting}
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Lock className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                              transition-all duration-200
                              focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                              hover:border-slate-400 bg-white text-slate-900
                              disabled:bg-slate-50 disabled:cursor-not-allowed"
                            placeholder="Confirm password"
                            required
                            disabled={submitting}
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Lock className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 p-6 bg-white flex-shrink-0">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                disabled={submitting}
                className="px-6 py-2.5 text-slate-600 hover:text-slate-800 font-medium disabled:opacity-50 transition-colors hover:bg-slate-100 rounded-lg"
              >
                {activeTab === "existing" ? "Close" : "Cancel"}
              </button>
              {activeTab === "new" && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
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
                      <UserPlus className="w-4 h-4" />
                      <span>Create Team Member</span>
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
          setDeleteConfirm({ isOpen: false, userId: null, userName: "" })
        }
        onConfirm={confirmDeleteUser}
        title="Delete Team Member"
        message={`Are you sure you want to delete "${deleteConfirm.userName}"? This action cannot be undone.`}
        confirmText="Delete Team Member"
        variant="danger"
      />
    </>
  );
};

export default TeamManagementModal;

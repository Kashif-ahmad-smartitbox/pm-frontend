"use client";

import React, { useState, useEffect } from "react";
import {
  getUsers,
  createManagers,
  createTeam,
  deleteUser,
} from "@/lib/api/users";
import {
  X,
  UserPlus,
  Building,
  Users,
  Mail,
  Lock,
  User,
  Trash2,
  MoreVertical,
  Edit,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [userType, setUserType] = useState<"team_member" | "project_manager">(
    "team_member"
  );
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

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
      setUsers(data.users);
    } catch (err) {
      setError("Failed to load users");
      console.error("Error loading users:", err);
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
    setSuccess(null);

    try {
      // Validate form data
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

      if (userType === "project_manager") {
        await createManagers(payload);
      } else {
        await createTeam(payload);
      }

      setSuccess(
        `${
          userType === "project_manager" ? "Project Manager" : "Team Member"
        } created successfully!`
      );
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      onUserCreated();

      // Switch to existing users tab after successful creation
      setTimeout(() => {
        setActiveTab("existing");
        fetchUsers();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${userName}? This action cannot be undone.`
      )
    ) {
      setMenuOpen(null);
      return;
    }

    setDeletingUser(userId);
    setError(null);
    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user._id !== userId));
      setSuccess("User deleted successfully!");
      setMenuOpen(null);

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeletingUser(null);
    }
  };

  const toggleMenu = (userId: string) => {
    setMenuOpen(menuOpen === userId ? null : userId);
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
    setDeletingUser(null);
    onClose();
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      project_manager: {
        label: "Project Manager",
        color: "bg-purple-100 text-purple-800 border border-purple-200",
        icon: Building,
      },
      team_member: {
        label: "Team Member",
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: Users,
      },
      admin: {
        label: "Admin",
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: User,
      },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || {
      label: role,
      color: "bg-slate-100 text-slate-800 border border-slate-200",
      icon: User,
    };

    const IconComponent = config.icon;

    return (
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${config.color} flex items-center gap-1.5`}
      >
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/60 overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-slate-400/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">User Management</h2>
                <p className="text-white/80 text-sm mt-1 flex items-center gap-2">
                  <span>Manage team members and project managers</span>
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

        {/* Tabs */}
        <div className="border-b border-slate-200/60 bg-white/50 flex-shrink-0">
          <div className="flex">
            <button
              onClick={() => setActiveTab("existing")}
              className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                activeTab === "existing"
                  ? "border-cyan-500 text-cyan-600 bg-cyan-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <User className="w-4 h-4" />
                Existing Users ({users.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                activeTab === "new"
                  ? "border-cyan-500 text-cyan-600 bg-cyan-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <UserPlus className="w-4 h-4" />
                Add New User
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {activeTab === "existing" ? (
              // Existing Users Tab
              <div>
                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start space-x-3 mb-6 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="p-1 bg-red-100 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-red-700 text-sm flex-1 font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {success && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 mb-6 animate-in fade-in slide-in-from-top-1 duration-300">
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
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Users className="w-6 h-6 text-cyan-600 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-700 font-medium">
                        Loading users
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
                        No users found
                      </h3>
                      <p className="text-slate-600">
                        Get started by adding team members or project managers
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("new")}
                      className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add First User
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-cyan-300 transition-all duration-300 group relative"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
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
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                                disabled={deletingUser === user._id}
                              >
                                {deletingUser === user._id ? (
                                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <MoreVertical className="w-4 h-4" />
                                )}
                              </button>

                              {menuOpen === user._id && (
                                <div className="absolute right-0 top-12 bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-300/30 z-10 min-w-36 overflow-hidden">
                                  <button
                                    onClick={() => {
                                      // Edit functionality can be added here
                                      setMenuOpen(null);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit User
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Add New User Tab
              <div>
                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start space-x-3 mb-6 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="p-1 bg-red-100 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-red-700 text-sm flex-1 font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {success && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 mb-6 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="p-1 bg-emerald-100 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-emerald-700 text-sm flex-1 font-medium">
                      {success}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User Type Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-cyan-600" />
                      User Type *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setUserType("team_member")}
                        className={`p-4 border-2 rounded-2xl text-left transition-all duration-300 group ${
                          userType === "team_member"
                            ? "border-cyan-500 bg-cyan-50/50 shadow-md"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl transition-all duration-300 ${
                              userType === "team_member"
                                ? "bg-cyan-500 text-white group-hover:scale-110"
                                : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                            }`}
                          >
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">
                              Team Member
                            </div>
                            <div className="text-sm text-slate-600">
                              Can be assigned to tasks
                            </div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("project_manager")}
                        className={`p-4 border-2 rounded-2xl text-left transition-all duration-300 group ${
                          userType === "project_manager"
                            ? "border-purple-500 bg-purple-50/50 shadow-md"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl transition-all duration-300 ${
                              userType === "project_manager"
                                ? "bg-purple-500 text-white group-hover:scale-110"
                                : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                            }`}
                          >
                            <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">
                              Project Manager
                            </div>
                            <div className="text-sm text-slate-600">
                              Can manage projects
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-cyan-600" />
                      Full Name *
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 pl-12 border border-slate-300 rounded-2xl 
                          placeholder-slate-400 shadow-sm transition-all duration-300
                          focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                          hover:border-slate-400 bg-white/50 text-slate-900
                          disabled:bg-slate-50 disabled:cursor-not-allowed
                          group-hover:shadow-md"
                        placeholder="Enter full name"
                        required
                        disabled={submitting}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                        <User className="w-4 h-4 text-cyan-600" />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-600" />
                      Email Address *
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 pl-12 border border-slate-300 rounded-2xl 
                          placeholder-slate-400 shadow-sm transition-all duration-300
                          focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                          hover:border-slate-400 bg-white/50 text-slate-900
                          disabled:bg-slate-50 disabled:cursor-not-allowed
                          group-hover:shadow-md"
                        placeholder="Enter email address"
                        required
                        disabled={submitting}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                        <Mail className="w-4 h-4 text-cyan-600" />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-cyan-600" />
                        Password *
                      </label>
                      <div className="relative group">
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3.5 pl-12 border border-slate-300 rounded-2xl 
                            shadow-sm transition-all duration-300
                            focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                            hover:border-slate-400 bg-white/50 text-slate-900
                            disabled:bg-slate-50 disabled:cursor-not-allowed
                            group-hover:shadow-md"
                          placeholder="Enter password"
                          required
                          disabled={submitting}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                          <Lock className="w-4 h-4 text-cyan-600" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-cyan-600" />
                        Confirm Password *
                      </label>
                      <div className="relative group">
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3.5 pl-12 border border-slate-300 rounded-2xl 
                            shadow-sm transition-all duration-300
                            focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                            hover:border-slate-400 bg-white/50 text-slate-900
                            disabled:bg-slate-50 disabled:cursor-not-allowed
                            group-hover:shadow-md"
                          placeholder="Confirm password"
                          required
                          disabled={submitting}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                          <Lock className="w-4 h-4 text-cyan-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t border-slate-200/60 p-6 bg-white/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="px-6 py-3 text-slate-600 hover:text-slate-800 font-semibold disabled:opacity-50 transition-all duration-200 hover:bg-slate-100 rounded-xl"
            >
              {activeTab === "existing" ? "Close" : "Cancel"}
            </button>
            {activeTab === "new" && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 rounded-2xl font-semibold shadow-lg shadow-cyan-500/25
                  bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700
                  transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                  disabled:transform-none disabled:opacity-70 disabled:cursor-not-allowed
                  flex items-center justify-center space-x-3 text-white relative overflow-hidden group"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-semibold">Creating User...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span className="font-semibold">Create User</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;

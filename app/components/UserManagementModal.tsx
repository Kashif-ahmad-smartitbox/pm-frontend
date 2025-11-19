"use client";

import React, { useState, useEffect } from "react";
import {
  getUsers,
  createManagers,
  createTeam,
  deleteUser,
  updateUser,
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
  Save,
  ArrowLeft,
  ShoppingCart,
  Warehouse,
  ClipboardList,
  Briefcase,
  Calculator,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  color?: string;
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
  const [userType, setUserType] = useState<string>("team_member");
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

  // User type options with icons
  const userTypeOptions = [
    {
      value: "purchase_office",
      label: "Purchase Office",
      icon: ShoppingCart,
      description: "Manages procurement and purchasing",
    },
    {
      value: "site_store_incharge",
      label: "Site Store Incharge",
      icon: Warehouse,
      description: "Manages site inventory and stores",
    },
    {
      value: "project_manager",
      label: "Project Manager",
      icon: ClipboardList,
      description: "Manages projects and teams",
    },
    {
      value: "field_team_executive",
      label: "Field Team Executive",
      icon: Briefcase,
      description: "Field operations and execution",
    },
    {
      value: "accounts_officer",
      label: "Accounts Officer",
      icon: Calculator,
      description: "Handles financial accounts",
    },
    {
      value: "team_member",
      label: "Team Member",
      icon: Users,
      description: "General team member role",
    },
  ];

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
      // Initialize edit form data for each user
      const editData: typeof editFormData = {};
      data.users.forEach((user: User) => {
        editData[user._id] = {
          name: user.name,
          email: user.email,
          password: "",
          confirmPassword: "",
        };
      });
      setEditFormData(editData);
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
    if (name === "userType") {
      setUserType(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
        role: userType,
      };

      // Use appropriate API based on role
      if (userType === "project_manager") {
        await createManagers(payload);
      } else {
        await createTeam(payload);
      }

      const selectedRole =
        userTypeOptions.find((opt) => opt.value === userType)?.label || "User";
      setSuccess(`${selectedRole} created successfully!`);
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
      setError(err instanceof Error ? err.message : "Failed to create user");
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
      setSuccess("User updated successfully!");
      setEditingUser(null);
      fetchUsers();

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
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
      setSuccess("User deleted successfully!");

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
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
    setUserType("team_member");
    setError(null);
    setSuccess(null);
    setActiveTab("existing");
    setMenuOpen(null);
    setEditingUser(null);
    onClose();
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: {
      [key: string]: { label: string; color: string; icon: any };
    } = {
      purchase_office: {
        label: "Purchase Office",
        color: "bg-purple-50 text-purple-700",
        icon: ShoppingCart,
      },
      site_store_incharge: {
        label: "Site Store Incharge",
        color: "bg-orange-50 text-orange-700",
        icon: Warehouse,
      },
      project_manager: {
        label: "Project Manager",
        color: "bg-[#E0FFFA] text-[#0E3554]",
        icon: ClipboardList,
      },
      field_team_executive: {
        label: "Field Team Executive",
        color: "bg-blue-50 text-blue-700",
        icon: Briefcase,
      },
      accounts_officer: {
        label: "Accounts Officer",
        color: "bg-green-50 text-green-700",
        icon: Calculator,
      },
      team_member: {
        label: "Team Member",
        color: "bg-[#E1F3F0] text-[#1CC2B1]",
        icon: Users,
      },
      admin: {
        label: "Admin",
        color: "bg-[#FFF4DD] text-[#E6A93A]",
        icon: User,
      },
    };

    const config = roleConfig[role] || {
      label: role,
      color: "bg-slate-50 text-slate-700",
      icon: User,
    };

    const IconComponent = config.icon;

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${config.color} flex items-center gap-1`}
      >
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Function to get user avatar with color
  const getUserAvatar = (user: User) => {
    const initials = user.name.charAt(0).toUpperCase();

    // Use the color from user data if available, otherwise fall back to default
    const backgroundColor = user.color || "#EFFFFA";
    const textColor = user.color ? getContrastColor(user.color) : "#0E3554";

    return (
      <div
        className="w-8 h-8 rounded flex items-center justify-center font-semibold text-xs"
        style={{
          backgroundColor: backgroundColor,
          color: textColor,
        }}
      >
        {initials}
      </div>
    );
  };

  // Helper function to determine text color based on background color
  const getContrastColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black or white based on luminance
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-sm border border-[#D9F3EE] overflow-hidden w-full max-w-2xl max-h-[85vh] flex flex-col">
          {/* Header - Compact */}
          <div className="bg-white border-b border-[#D9F3EE] p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#EFFFFA] rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#0E3554]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0E3554]">
                    User Management
                  </h2>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Manage team members and roles
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

          {/* Tabs - Compact */}
          <div className="border-b border-[#D9F3EE] bg-white flex-shrink-0">
            <div className="flex">
              <button
                onClick={() => setActiveTab("existing")}
                className={`flex-1 px-4 py-3 text-xs font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === "existing"
                    ? "border-[#0E3554] text-[#0E3554] bg-[#EFFFFA]"
                    : "border-transparent text-slate-500 hover:text-[#0E3554] hover:bg-[#EFFFFA]"
                }`}
              >
                <div className="flex items-center gap-1.5 justify-center">
                  <User className="w-3.5 h-3.5" />
                  Users ({users.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("new")}
                className={`flex-1 px-4 py-3 text-xs font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === "new"
                    ? "border-[#0E3554] text-[#0E3554] bg-[#EFFFFA]"
                    : "border-transparent text-slate-500 hover:text-[#0E3554] hover:bg-[#EFFFFA]"
                }`}
              >
                <div className="flex items-center gap-1.5 justify-center">
                  <UserPlus className="w-3.5 h-3.5" />
                  Add User
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4">
              {activeTab === "existing" ? (
                // Existing Users Tab
                <div>
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm mb-4">
                      <div className="p-1 bg-red-100 rounded">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      </div>
                      <p className="text-red-700 flex-1 font-medium">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-3 rounded-lg bg-[#E1F3F0] border border-[#1CC2B1] flex items-start gap-2 text-sm mb-4">
                      <div className="p-1 bg-[#1CC2B1] rounded">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-[#1CC2B1] flex-1 font-medium">
                        {success}
                      </p>
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center py-8 space-y-3">
                      <div className="w-8 h-8 border-2 border-[#D9F3EE] border-t-[#1CC2B1] rounded-full animate-spin mx-auto"></div>
                      <div className="space-y-1">
                        <p className="text-[#0E3554] font-medium text-sm">
                          Loading users
                        </p>
                        <p className="text-slate-500 text-xs">
                          Getting user information...
                        </p>
                      </div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 space-y-3">
                      <div className="w-12 h-12 bg-[#EFFFFA] rounded-lg flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-[#0E3554]">
                          No users found
                        </h3>
                        <p className="text-slate-600 text-sm">
                          Add team members with different roles
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("new")}
                        className="px-4 py-2 text-sm bg-[#0E3554] text-white rounded font-medium hover:bg-[#0A2A42] transition-colors flex items-center gap-1.5 mx-auto"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add First User
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map((user) => (
                        <div
                          key={user._id}
                          className="bg-white border border-[#D9F3EE] rounded-lg p-3 hover:border-[#1CC2B1] transition-all duration-200 group relative"
                        >
                          {editingUser === user._id ? (
                            // Edit Mode
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-[#0E3554] text-sm">
                                  Edit User
                                </h4>
                                <div className="flex items-center gap-2">
                                  {getRoleBadge(user.role)}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-medium text-[#0E3554]">
                                    Name *
                                  </label>
                                  <input
                                    type="text"
                                    name="name"
                                    value={editFormData[user._id]?.name || ""}
                                    onChange={(e) =>
                                      handleEditInputChange(user._id, e)
                                    }
                                    className="w-full px-3 py-2 text-sm border border-[#D9F3EE] rounded focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1] text-[#0E3554]"
                                    placeholder="Enter name"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-medium text-[#0E3554]">
                                    Email *
                                  </label>
                                  <input
                                    type="email"
                                    name="email"
                                    value={editFormData[user._id]?.email || ""}
                                    onChange={(e) =>
                                      handleEditInputChange(user._id, e)
                                    }
                                    className="w-full px-3 py-2 text-sm border border-[#D9F3EE] rounded focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1] text-[#0E3554]"
                                    placeholder="Enter email"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-medium text-[#0E3554]">
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
                                    className="w-full px-3 py-2 text-sm border border-[#D9F3EE] rounded focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1] text-[#0E3554]"
                                    placeholder="Leave blank to keep current"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-medium text-[#0E3554]">
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
                                    className="w-full px-3 py-2 text-sm border border-[#D9F3EE] rounded focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1] text-[#0E3554]"
                                    placeholder="Confirm new password"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-3 border-t border-[#D9F3EE]">
                                <button
                                  onClick={cancelEditing}
                                  disabled={submitting}
                                  className="px-3 py-1.5 text-xs text-[#0E3554] hover:text-[#1CC2B1] font-medium disabled:opacity-50 transition-colors hover:bg-[#EFFFFA] rounded flex items-center gap-1.5"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleEditUser(user._id)}
                                  disabled={submitting}
                                  className="px-3 py-1.5 text-xs bg-[#0E3554] text-white rounded font-medium hover:bg-[#0A2A42] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  {submitting ? "Saving..." : "Save"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {getUserAvatar(user)}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-[#0E3554] text-sm truncate">
                                    {user.name}
                                  </h4>
                                  <p className="text-slate-600 text-xs truncate">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getRoleBadge(user.role)}

                                <div className="relative">
                                  <button
                                    onClick={() => toggleMenu(user._id)}
                                    className="p-1.5 text-slate-400 hover:text-[#0E3554] rounded hover:bg-[#EFFFFA] transition-colors"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>

                                  {menuOpen === user._id && (
                                    <div className="absolute right-0 top-8 bg-white border border-[#D9F3EE] rounded-lg shadow-lg z-10 min-w-32 overflow-hidden">
                                      <button
                                        onClick={() => startEditing(user._id)}
                                        className="w-full px-3 py-2 text-left text-xs text-[#0E3554] hover:bg-[#EFFFFA] flex items-center gap-1.5 transition-colors"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteUser(user._id, user.name)
                                        }
                                        className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
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
                // Add New User Tab
                <div>
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm mb-4">
                      <div className="p-1 bg-red-100 rounded">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      </div>
                      <p className="text-red-700 flex-1 font-medium">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-3 rounded-lg bg-[#E1F3F0] border border-[#1CC2B1] flex items-start gap-2 text-sm mb-4">
                      <div className="p-1 bg-[#1CC2B1] rounded">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-[#1CC2B1] flex-1 font-medium">
                        {success}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Type Selection */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#0E3554]">
                        User Role *
                      </label>
                      <div className="relative">
                        <select
                          name="userType"
                          value={userType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                            transition-all duration-200
                            focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                            hover:border-[#0E3554] bg-white text-[#0E3554]
                            disabled:bg-[#EFFFFA] disabled:cursor-not-allowed appearance-none"
                          required
                          disabled={submitting}
                        >
                          {userTypeOptions.map((option) => {
                            const IconComponent = option.icon;
                            return (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            );
                          })}
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 transform rotate-45"></div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        {
                          userTypeOptions.find((opt) => opt.value === userType)
                            ?.description
                        }
                      </p>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#0E3554]">
                        Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                            placeholder-slate-400 transition-all duration-200
                            focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                            hover:border-[#0E3554] bg-white text-[#0E3554]
                            disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
                          placeholder="Enter full name"
                          required
                          disabled={submitting}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#0E3554]">
                        Email Address *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                            placeholder-slate-400 transition-all duration-200
                            focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                            hover:border-[#0E3554] bg-white text-[#0E3554]
                            disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
                          placeholder="Enter email address"
                          required
                          disabled={submitting}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[#0E3554]">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                              transition-all duration-200
                              focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                              hover:border-[#0E3554] bg-white text-[#0E3554]
                              disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
                            placeholder="Enter password"
                            required
                            disabled={submitting}
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[#0E3554]">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 pl-10 text-sm border border-[#D9F3EE] rounded-lg 
                              transition-all duration-200
                              focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                              hover:border-[#0E3554] bg-white text-[#0E3554]
                              disabled:bg-[#EFFFFA] disabled:cursor-not-allowed"
                            placeholder="Confirm password"
                            required
                            disabled={submitting}
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
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
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create User</span>
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
        title="Delete User"
        message={`Are you sure you want to delete "${deleteConfirm.userName}"? This action cannot be undone.`}
        confirmText="Delete User"
        variant="danger"
      />
    </>
  );
};

export default UserManagementModal;

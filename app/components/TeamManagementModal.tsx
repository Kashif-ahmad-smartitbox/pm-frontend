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
  Palette,
  RefreshCw,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  color?: string;
}

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

// Color palette for user avatars
const COLOR_PALETTE = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
  "#D7BDE2",
  "#F9E79F",
  "#A9DFBF",
  "#F5B7B1",
  "#AED6F1",
  "#E8DAEF",
];

// Helper function to generate unique color based on email
const generateUniqueColor = (
  email: string,
  existingColors: string[]
): string => {
  // Simple hash function to generate consistent color from email
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use hash to pick from predefined palette
  const colorIndex = Math.abs(hash) % COLOR_PALETTE.length;
  let selectedColor = COLOR_PALETTE[colorIndex];

  // If color is already used, find the next available one
  let attempts = 0;
  while (
    existingColors.includes(selectedColor) &&
    attempts < COLOR_PALETTE.length
  ) {
    const nextIndex = (colorIndex + attempts + 1) % COLOR_PALETTE.length;
    selectedColor = COLOR_PALETTE[nextIndex];
    attempts++;
  }

  return selectedColor;
};

// Helper function to get contrast color for text
const getContrastColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

// Color Picker Component
const ColorPicker: React.FC<{
  selectedColor: string;
  onColorChange: (color: string) => void;
  usedColors: string[];
}> = ({ selectedColor, onColorChange, usedColors }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setShowPicker(false);
  };

  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    // Ensure the color is not already used
    let attempts = 0;
    while (usedColors.includes(color) && attempts < 10) {
      color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      attempts++;
    }

    handleColorSelect(color);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center gap-2 px-3 py-2 border border-[#D9F3EE] rounded-lg hover:border-[#1CC2B1] transition-colors"
      >
        <div
          className="w-6 h-6 rounded border border-slate-200"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-sm text-[#0E3554] font-medium">
          {selectedColor}
        </span>
        <Palette className="w-4 h-4 text-slate-400" />
      </button>

      {showPicker && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-[#D9F3EE] rounded-lg shadow-lg p-4 z-50 min-w-64">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-[#0E3554]">
              Choose Color
            </h4>
            <button
              onClick={generateRandomColor}
              className="p-1 text-slate-400 hover:text-[#1CC2B1] transition-colors"
              title="Generate random color"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Predefined Color Palette */}
          <div className="grid grid-cols-5 gap-2 mb-3">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  selectedColor === color
                    ? "border-[#0E3554] scale-110"
                    : "border-slate-200 hover:scale-105"
                } ${usedColors.includes(color) ? "opacity-50" : ""}`}
                style={{ backgroundColor: color }}
                title={
                  usedColors.includes(color) ? "Color already used" : color
                }
                disabled={usedColors.includes(color)}
              />
            ))}
          </div>

          {/* Custom Color Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#0E3554]">
              Custom Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-10 h-10 rounded border border-[#D9F3EE] cursor-pointer"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => onColorChange(e.target.value)}
                placeholder="#000000"
                className="flex-1 px-3 py-2 text-sm border border-[#D9F3EE] rounded focus:outline-none focus:ring-1 focus:ring-[#1CC2B1]"
                pattern="^#[0-9A-Fa-f]{6}$"
                maxLength={7}
              />
            </div>
          </div>

          {/* Used Colors Warning */}
          {usedColors.length > 0 && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
              <p>Some colors are already used by other users</p>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close picker */}
      {showPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPicker(false)}
        />
      )}
    </div>
  );
};

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
    color: COLOR_PALETTE[0], // Default color
  });
  const [editFormData, setEditFormData] = useState<{
    [key: string]: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      color: string;
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

  // Get used colors from existing users
  const usedColors = users
    .map((user) => user.color)
    .filter(Boolean) as string[];

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
          color: user.color || COLOR_PALETTE[0],
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

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      color,
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

  const handleEditColorChange = (userId: string, color: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        color,
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

      // Validate color format
      if (!/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
        setError(
          "Invalid color format. Please use a valid hex color (#RRGGBB)"
        );
        return;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        color: formData.color,
      };

      await createTeam(payload);

      setSuccess("Team Member created successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        color: COLOR_PALETTE[0], // Reset to default color
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

      // Validate color format
      if (!/^#[0-9A-Fa-f]{6}$/.test(userData.color)) {
        setError(
          "Invalid color format. Please use a valid hex color (#RRGGBB)"
        );
        return;
      }

      const payload: any = {
        name: userData.name.trim(),
        email: userData.email.trim(),
        color: userData.color,
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
            color: user.color || COLOR_PALETTE[0],
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
      color: COLOR_PALETTE[0],
    });
    setError(null);
    setSuccess(null);
    setActiveTab("existing");
    setMenuOpen(null);
    setEditingUser(null);
    onClose();
  };

  // Auto-generate color when email changes
  useEffect(() => {
    if (formData.email && activeTab === "new") {
      const generatedColor = generateUniqueColor(formData.email, usedColors);
      setFormData((prev) => ({
        ...prev,
        color: generatedColor,
      }));
    }
  }, [formData.email, activeTab, usedColors]);

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      team_member: {
        label: "Team Member",
        color: "bg-[#E0FFFA] text-[#0E3554]",
        icon: Users,
      },
      admin: {
        label: "Admin",
        color: "bg-[#E1F3F0] text-[#1CC2B1]",
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
    const backgroundColor = user.color || COLOR_PALETTE[0];
    const textColor = getContrastColor(backgroundColor);

    return (
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs border border-slate-200"
        style={{
          backgroundColor,
          color: textColor,
        }}
      >
        {initials}
      </div>
    );
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
                    Team Management
                  </h2>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Manage team members and access
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
                  Team Members ({users.length})
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
                  Add Member
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4">
              {activeTab === "existing" ? (
                // Existing Team Members Tab
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
                          Loading team members
                        </p>
                        <p className="text-slate-500 text-xs">
                          Getting team information...
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
                          No team members
                        </h3>
                        <p className="text-slate-600 text-sm">
                          Add team members to your projects
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("new")}
                        className="px-4 py-2 text-sm bg-[#0E3554] text-white rounded font-medium hover:bg-[#0A2A42] transition-colors flex items-center gap-1.5 mx-auto"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add First Member
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
                                  Edit Team Member
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

                              {/* Color Picker in Edit Mode */}
                              <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-[#0E3554]">
                                  Avatar Color
                                </label>
                                <ColorPicker
                                  selectedColor={
                                    editFormData[user._id]?.color ||
                                    COLOR_PALETTE[0]
                                  }
                                  onColorChange={(color) =>
                                    handleEditColorChange(user._id, color)
                                  }
                                  usedColors={usedColors.filter(
                                    (color) => color !== user.color
                                  )}
                                />
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
                // Add New Team Member Tab
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
                    {/* User Type Information */}
                    <div className="bg-[#E0FFFA] border border-[#D9F3EE] rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#E1F3F0] rounded">
                          <Users className="w-4 h-4 text-[#0E3554]" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#0E3554] text-sm">
                            Team Member
                          </div>
                          <div className="text-xs text-[#0E3554]">
                            Can be assigned to tasks and projects
                          </div>
                        </div>
                      </div>
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

                    {/* Color Picker */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#0E3554]">
                        Avatar Color
                      </label>
                      <ColorPicker
                        selectedColor={formData.color}
                        onColorChange={handleColorChange}
                        usedColors={usedColors}
                      />
                      <p className="text-xs text-slate-500">
                        Color will be used for user's avatar and identification.
                        Automatically generated based on email.
                      </p>
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
                      <span>Create Member</span>
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

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Search,
  UserPlus,
  Check,
  User,
  Loader2,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  UserMinus,
  AlertCircle,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { User as UserType } from "./TaskNotesModal";
import { getTeam } from "@/lib/api/users";
import { updateTask } from "@/lib/api/tasks";

interface AddUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsersAdded: (users: UserType[], removedUsers?: UserType[]) => void;
  onTaskUpdated?: () => void;
  taskId: string;
  currentAssignees: UserType[];
  currentUser: UserType;
}

const AddUsersModal: React.FC<AddUsersModalProps> = ({
  isOpen,
  onClose,
  onUsersAdded,
  onTaskUpdated,
  taskId,
  currentAssignees,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [removedUsers, setRemovedUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingUsers, setAddingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "selected" | "removed">(
    "all"
  );

  // Filter users based on search query and view mode
  const filteredUsers = useMemo(() => {
    let usersToFilter: UserType[] = [];

    switch (viewMode) {
      case "selected":
        usersToFilter = selectedUsers;
        break;
      case "removed":
        usersToFilter = removedUsers;
        break;
      case "all":
      default:
        usersToFilter = allUsers;
        break;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return usersToFilter.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    return usersToFilter;
  }, [allUsers, selectedUsers, removedUsers, searchQuery, viewMode]);

  // Fetch all users (both assigned and available)
  const fetchAllUsers = useCallback(async () => {
    if (!isOpen) return;

    setLoading(true);
    try {
      const response = await getTeam();
      const users = response?.members || response || [];

      // Merge with current assignees to ensure all users are shown
      const allUsersList = [...users];
      const existingUserIds = new Set(users.map((u: UserType) => u._id));

      // Add any current assignees that might not be in the team list
      currentAssignees.forEach((assignee) => {
        if (!existingUserIds.has(assignee._id)) {
          allUsersList.push(assignee);
        }
      });

      setAllUsers(allUsersList);
      // Initialize selected users with current assignees
      setSelectedUsers(currentAssignees);
      setRemovedUsers([]);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please check your connection.");
      setAllUsers([]);
      setSelectedUsers([]);
      setRemovedUsers([]);
    } finally {
      setLoading(false);
    }
  }, [isOpen, currentAssignees]);

  // Initialize modal
  useEffect(() => {
    if (isOpen) {
      fetchAllUsers();
      setSearchQuery("");
      setViewMode("all");
    }
  }, [isOpen, fetchAllUsers]);

  // Toggle user selection - add to selected
  const addUserToSelection = (user: UserType) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u._id === user._id);
      if (isSelected) return prev;

      // Remove from removed list if it was previously removed
      setRemovedUsers((prevRemoved) =>
        prevRemoved.filter((u) => u._id !== user._id)
      );
      return [...prev, user];
    });
  };

  // Remove user from selection (mark for removal)
  const removeUserFromSelection = (user: UserType) => {
    const isCurrentAssignee = currentAssignees.some((u) => u._id === user._id);

    setSelectedUsers((prev) => prev.filter((u) => u._id !== user._id));

    // If user was originally assigned, add to removed list
    if (isCurrentAssignee) {
      setRemovedUsers((prev) => {
        const alreadyRemoved = prev.some((u) => u._id === user._id);
        if (alreadyRemoved) return prev;
        return [...prev, user];
      });
    }
  };

  // Toggle user selection (handles both add and remove)
  const toggleUserSelection = (user: UserType) => {
    const isSelected = selectedUsers.some((u) => u._id === user._id);

    if (isSelected) {
      removeUserFromSelection(user);
    } else {
      addUserToSelection(user);
    }
  };

  // Check if user is currently selected
  const isUserSelected = (userId: string) => {
    return selectedUsers.some((user) => user._id === userId);
  };

  // Check if user was originally assigned and is now removed
  const isUserRemoved = (userId: string) => {
    return removedUsers.some((user) => user._id === userId);
  };

  // Check if user is currently assigned (in current assignees and not removed)
  const isUserCurrentlyAssigned = (userId: string) => {
    const wasAssigned = currentAssignees.some((u) => u._id === userId);
    const isRemoved = removedUsers.some((u) => u._id === userId);
    return wasAssigned && !isRemoved;
  };

  const handleUpdateTaskUsers = async () => {
    setAddingUsers(true);
    setError(null);

    try {
      // Get all selected user IDs
      const selectedUserIds = selectedUsers.map((user) => user._id);
      const removedUserIds = removedUsers.map((user) => user._id);

      // Make API call to update task
      const response = await updateTask(taskId, {
        assigneeIds: selectedUserIds,
        removedAssigneeIds: removedUserIds,
      });

      if (response) {
        onUsersAdded(selectedUsers, removedUsers);

        if (response.task && onTaskUpdated) {
          onTaskUpdated();
        } else if (onTaskUpdated) {
          try {
            onTaskUpdated();
          } catch (fetchError) {
            console.error("Failed to fetch updated task:", fetchError);
          }
        }

        onClose();
      } else {
        throw new Error(response.message || "Failed to update task users");
      }
    } catch (err: any) {
      console.error("Failed to update users:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update users. Please try again."
      );
    } finally {
      setAddingUsers(false);
    }
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role badge styling
  const getUserRoleBadge = (role?: string) => {
    if (!role) return null;

    const roleConfig: Record<
      string,
      { color: string; label: string; icon: any }
    > = {
      admin: {
        color: "bg-red-50 text-red-700 border-red-200",
        label: "Admin",
        icon: User,
      },
      project_manager: {
        color: "bg-[#E0FFFA] text-[#0E3554] border-[#D9F3EE]",
        label: "Project Manager",
        icon: User,
      },
      purchase_office: {
        color: "bg-purple-50 text-purple-700 border-purple-200",
        label: "Purchase Office",
        icon: User,
      },
      site_store_incharge: {
        color: "bg-orange-50 text-orange-700 border-orange-200",
        label: "Site Store Incharge",
        icon: User,
      },
      field_team_executive: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Field Executive",
        icon: User,
      },
      accounts_officer: {
        color: "bg-green-50 text-green-700 border-green-200",
        label: "Accounts Officer",
        icon: User,
      },
      team_member: {
        color: "bg-[#E1F3F0] text-[#1CC2B1] border-[#D9F3EE]",
        label: "Team Member",
        icon: Users,
      },
    };

    const config = roleConfig[role] || {
      color: "bg-slate-50 text-slate-700 border-slate-200",
      label: role,
      icon: User,
    };

    const IconComponent = config.icon;

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${config.color} border flex items-center gap-1`}
      >
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Reset selection
  const handleClearSelection = () => {
    setSelectedUsers(currentAssignees); // Reset to original assignees
    setRemovedUsers([]);
    setViewMode("all");
  };

  // Get selection summary
  const getSelectionSummary = () => {
    const addedCount = selectedUsers.filter(
      (user) => !currentAssignees.some((u) => u._id === user._id)
    ).length;

    const removedCount = removedUsers.length;
    const keptCount = selectedUsers.filter((user) =>
      currentAssignees.some((u) => u._id === user._id)
    ).length;

    return { addedCount, removedCount, keptCount, total: selectedUsers.length };
  };

  const handleClose = () => {
    setSearchQuery("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const { addedCount, removedCount, keptCount, total } = getSelectionSummary();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-xl shadow-sm border border-[#D9F3EE] w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[#D9F3EE] p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#EFFFFA] rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-[#0E3554]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0E3554]">
                  Manage Assignees
                </h2>
                <p className="text-slate-600 text-xs mt-0.5">
                  Add or remove users from this task
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-[#0E3554] hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
              disabled={addingUsers}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="bg-linear-to-r from-[#EFFFFA] to-[#E1F3F0] border-b border-[#D9F3EE] p-4 shrink-0">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-white rounded-lg p-2 border border-[#D9F3EE] text-center">
              <div className="text-lg font-bold text-[#0E3554]">
                {keptCount}
              </div>
              <div className="text-xs text-slate-600">Kept</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-[#D9F3EE] text-center">
              <div className="text-lg font-bold text-blue-600">
                {addedCount}
              </div>
              <div className="text-xs text-slate-600">Added</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-[#D9F3EE] text-center">
              <div className="text-lg font-bold text-red-600">
                {removedCount}
              </div>
              <div className="text-xs text-slate-600">Removed</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-[#0E3554] font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {total} total assignees
              {addedCount > 0 && (
                <span className="text-blue-600 ml-2">+{addedCount}</span>
              )}
              {removedCount > 0 && (
                <span className="text-red-600 ml-1">-{removedCount}</span>
              )}
            </div>
            <button
              onClick={handleClearSelection}
              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors"
            >
              <XCircle className="w-3 h-3" />
              Reset Changes
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="border-b border-[#D9F3EE] p-4 shrink-0 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-[#D9F3EE] rounded-lg 
                placeholder-slate-400 transition-all duration-200
                focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                hover:border-[#0E3554] bg-white text-[#0E3554]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-medium text-[#0E3554]">View:</span>
            <div className="flex bg-slate-100 rounded-lg p-1 flex-1">
              <button
                onClick={() => setViewMode("all")}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all ${
                  viewMode === "all"
                    ? "bg-white text-[#0E3554] shadow-sm"
                    : "text-slate-600 hover:text-[#0E3554]"
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setViewMode("selected")}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all ${
                  viewMode === "selected"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-blue-600"
                }`}
                disabled={selectedUsers.length === 0}
              >
                Selected ({selectedUsers.length})
              </button>
              <button
                onClick={() => setViewMode("removed")}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all ${
                  viewMode === "removed"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-slate-600 hover:text-red-600"
                }`}
                disabled={removedUsers.length === 0}
              >
                Removed ({removedUsers.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm mb-4">
              <div className="p-1 bg-red-100 rounded">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              </div>
              <p className="text-red-700 flex-1 font-medium">{error}</p>
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
                  Getting everything ready...
                </p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 bg-[#EFFFFA] rounded-lg flex items-center justify-center mx-auto">
                <User className="w-6 h-6 text-slate-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#0E3554]">
                  {searchQuery
                    ? "No matching users found"
                    : "No users available"}
                </h3>
                <p className="text-slate-600 text-sm">
                  {searchQuery
                    ? "Try a different search term"
                    : viewMode === "removed"
                    ? "No users removed yet"
                    : viewMode === "selected"
                    ? "No users selected"
                    : "No users available"}
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1.5 text-sm text-[#0E3554] hover:text-[#1CC2B1] font-medium hover:bg-[#EFFFFA] rounded transition-colors flex items-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => {
                const isSelected = isUserSelected(user._id);
                const isCurrentUser = user._id === currentUser._id;
                const isOriginallyAssigned = currentAssignees.some(
                  (u) => u._id === user._id
                );
                const isRemoved = isUserRemoved(user._id);
                const isCurrentlyAssigned = isUserCurrentlyAssigned(user._id);

                return (
                  <div
                    key={user._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isSelected && !isRemoved
                        ? "bg-blue-50 border-blue-200"
                        : isRemoved
                        ? "bg-red-50 border-red-200"
                        : isCurrentlyAssigned
                        ? "bg-[#E1F3F0] border-[#D9F3EE]"
                        : "bg-white border-[#D9F3EE] hover:border-[#1CC2B1]"
                    }`}
                    onClick={() => toggleUserSelection(user)}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                          isRemoved ? "opacity-60" : ""
                        }`}
                        style={{
                          backgroundColor: user.color || "#1CC2B1",
                        }}
                      >
                        {getInitials(user.name)}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className={`font-semibold text-sm truncate ${
                            isRemoved
                              ? "text-gray-500 line-through"
                              : "text-[#0E3554]"
                          }`}
                        >
                          {user.name}
                          {isCurrentUser && (
                            <span className="ml-1 text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </p>
                      </div>
                      <p
                        className={`text-xs truncate mb-1 ${
                          isRemoved ? "text-gray-400" : "text-slate-600"
                        }`}
                      >
                        {user.email}
                      </p>

                      <div className="flex items-center gap-2">
                        {getUserRoleBadge(user.role)}

                        {/* Status Badge */}
                        <span
                          className={`text-xs px-2 py-0.5 rounded border ${
                            isRemoved
                              ? "bg-red-100 text-red-700 border-red-200"
                              : isCurrentlyAssigned
                              ? "bg-[#E1F3F0] text-[#1CC2B1] border-[#D9F3EE]"
                              : isSelected
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {isRemoved
                            ? "Will be removed"
                            : isCurrentlyAssigned
                            ? "Currently assigned"
                            : isSelected
                            ? "Will be added"
                            : isOriginallyAssigned
                            ? "Click to remove"
                            : "Click to add"}
                        </span>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    <div className="shrink-0">
                      <div
                        className={`w-6 h-6 rounded border flex items-center justify-center ${
                          isRemoved
                            ? "bg-red-100 border-red-300"
                            : isSelected
                            ? "bg-blue-600 border-blue-700"
                            : "bg-white border-[#D9F3EE]"
                        }`}
                      >
                        {isRemoved ? (
                          <UserMinus className="w-3.5 h-3.5 text-red-600" />
                        ) : isSelected ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <div className="w-2 h-2 rounded bg-gray-300" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#D9F3EE] p-4 bg-white shrink-0">
          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              disabled={addingUsers}
              className="px-4 py-2 text-sm text-[#0E3554] hover:text-[#1CC2B1] font-medium disabled:opacity-50 transition-colors hover:bg-[#EFFFFA] rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateTaskUsers}
              disabled={
                (addedCount === 0 && removedCount === 0) ||
                addingUsers ||
                loading
              }
              className="px-4 py-2 text-sm rounded font-medium
                bg-[#0E3554] hover:bg-[#0A2A42]
                transition-all duration-200
                disabled:opacity-70 disabled:cursor-not-allowed
                flex items-center justify-center gap-1.5 text-white"
            >
              {addingUsers ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5" />
                  <span>Update Assignees</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUsersModal;

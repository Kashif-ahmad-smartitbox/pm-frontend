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
} from "lucide-react";
import { User as UserType } from "./TaskNotesModal";
import { getTeam } from "@/lib/api/users";
import { updateTask } from "@/lib/api/tasks";

interface AddUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsersAdded: (users: UserType[], removedUsers?: UserType[]) => void;
  taskId: string;
  currentAssignees: UserType[];
  currentUser: UserType;
}

const AddUsersModal: React.FC<AddUsersModalProps> = ({
  isOpen,
  onClose,
  onUsersAdded,
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

  // Handle adding/updating users to task
  const handleUpdateTaskUsers = async () => {
    setAddingUsers(true);
    setError(null);

    try {
      // Get all selected user IDs
      const selectedUserIds = selectedUsers.map((user) => user._id);
      const removedUserIds = removedUsers.map((user) => user._id);

      const response = await updateTask(taskId, {
        assigneeIds: selectedUserIds,
        removedAssigneeIds: removedUserIds,
      });

      if (response.success) {
        onUsersAdded(selectedUsers, removedUsers);
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

    const roleConfig: Record<string, { color: string; label: string }> = {
      admin: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Admin",
      },
      project_manager: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Project Manager",
      },
      team_member: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Team Member",
      },
    };

    const config = roleConfig[role] || {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      label: role,
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${config.color}`}>
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

    return { addedCount, removedCount, keptCount };
  };

  if (!isOpen) return null;

  const { addedCount, removedCount, keptCount } = getSelectionSummary();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                Manage Task Assignees
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Add or remove users from this task
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-xl transition-all hover:rotate-90 duration-300"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Selection Summary */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-y border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">
                Current Selection
              </span>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              Reset Changes
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-600">
                {keptCount}
              </div>
              <div className="text-xs text-gray-600">Kept</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-200">
              <div className="text-lg font-bold text-blue-600">
                {addedCount}
              </div>
              <div className="text-xs text-gray-600">Added</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-red-200">
              <div className="text-lg font-bold text-red-600">
                {removedCount}
              </div>
              <div className="text-xs text-gray-600">Removed</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">View:</span>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("all")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === "all"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setViewMode("selected")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === "selected"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                disabled={selectedUsers.length === 0}
              >
                Selected ({selectedUsers.length})
              </button>
              <button
                onClick={() => setViewMode("removed")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === "removed"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                disabled={removedUsers.length === 0}
              >
                Removed ({removedUsers.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
              <p className="text-gray-600 font-medium">
                Loading team members...
              </p>
              <p className="text-sm text-gray-400 mt-1">Please wait</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium mb-3">{error}</p>
              <button
                onClick={fetchAllUsers}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
              >
                Retry Loading
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">
                {searchQuery ? "No matching users found" : "No users available"}
              </p>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "Try a different search term"
                  : viewMode === "removed"
                  ? "No users removed yet"
                  : viewMode === "selected"
                  ? "No users selected"
                  : "No users available"}
              </p>
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
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-sm group ${
                      isSelected && !isRemoved
                        ? "bg-blue-50 border-blue-200 shadow-sm"
                        : isRemoved
                        ? "bg-red-50/70 border-red-200"
                        : isCurrentlyAssigned
                        ? "bg-green-50/70 border-green-200"
                        : "bg-white border-gray-200 hover:border-blue-200"
                    }`}
                    onClick={() => toggleUserSelection(user)}
                  >
                    {/* Avatar with Status Indicator */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-105 ${
                          isRemoved ? "opacity-60" : ""
                        }`}
                        style={{
                          backgroundColor: user.color || "#6366f1",
                          backgroundImage: user.color
                            ? `linear-gradient(135deg, ${user.color}99, ${user.color})`
                            : "linear-gradient(135deg, #818cf8, #4f46e5)",
                        }}
                      >
                        {getInitials(user.name)}
                      </div>

                      {/* Status Indicators */}
                      {isRemoved ? (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <UserMinus className="w-3 h-3 text-red-600" />
                        </div>
                      ) : isCurrentlyAssigned ? (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                      ) : isSelected ? (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse-subtle">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-blue-300 transition-colors"></div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className={`font-semibold truncate ${
                            isRemoved
                              ? "text-gray-500 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {user.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </p>
                        {getUserRoleBadge(user.role)}
                      </div>
                      <p
                        className={`text-sm truncate mb-1 ${
                          isRemoved ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {user.email}
                      </p>

                      {/* Status Description */}
                      <div className="flex items-center gap-2">
                        {isRemoved ? (
                          <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                            <UserMinus className="w-3 h-3" />
                            Will be removed from task
                          </p>
                        ) : isCurrentlyAssigned ? (
                          <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Currently assigned to task
                          </p>
                        ) : isSelected ? (
                          <p className="text-xs font-medium text-blue-600 flex items-center gap-1">
                            <UserPlus className="w-3 h-3" />
                            Will be added to task
                          </p>
                        ) : isOriginallyAssigned ? (
                          <p className="text-xs font-medium text-amber-600 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Click to remove from task
                          </p>
                        ) : (
                          <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                            <UserPlus className="w-3 h-3" />
                            Click to add to task
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUserSelection(user);
                      }}
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isRemoved
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : isSelected
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : isOriginallyAssigned
                          ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                      }`}
                      aria-label={
                        isRemoved
                          ? "Restore user"
                          : isSelected
                          ? "Remove user"
                          : "Add user"
                      }
                    >
                      {isRemoved ? (
                        <UserPlus className="w-4 h-4" />
                      ) : isSelected ? (
                        <UserMinus className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-white/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {selectedUsers.length} total assignees
              </span>
              {addedCount > 0 && (
                <span className="ml-3 text-blue-600">+{addedCount} added</span>
              )}
              {removedCount > 0 && (
                <span className="ml-3 text-red-600">
                  -{removedCount} removed
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTaskUsers}
                disabled={
                  (addedCount === 0 && removedCount === 0) || addingUsers
                }
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm flex items-center gap-2"
              >
                {addingUsers ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Update Assignees
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUsersModal;

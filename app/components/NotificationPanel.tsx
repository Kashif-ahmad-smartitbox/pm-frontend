import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  CheckCheck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api/notification";

interface Notification {
  _id: string;
  recipient: string;
  actor?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    color?: string;
  } | null;
  verb: string;
  contextType: "project" | "task" | "user" | "system";
  contextId?: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationPanelProps {
  onClose?: () => void;
  pageSize?: number;
  onTaskClick?: (taskId: string, projectId?: string, taskName?: string) => void;
}

const NOTIFICATION_CONFIG = {
  project: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  task: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  user: {
    icon: AlertCircle,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  system: {
    icon: Bell,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
} as const;

function NotificationPanel({ onClose, pageSize = 50, onTaskClick }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const deriveActorLabel = (n: Notification) => {
    // Prefer populated actor -> fallback to data.actorName -> final fallback "System"
    const actorName =
      n.actor?.name || n.data?.actorName || (n.verb ? "System" : "System");
    const actorEmail = n.actor?.email || n.data?.actorEmail || null;
    const actorRole = n.actor?.role || n.data?.actorRole || null;
    return { actorName, actorEmail, actorRole };
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read;
    return true;
  });

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (opts?: { showRefresh?: boolean; page?: number }) => {
      try {
        if (opts?.showRefresh) setRefreshing(true);
        else setLoading(true);

        const p = opts?.page ?? page;
        const response = await getNotifications({ page: p, limit: pageSize });
        // Expecting { notifications: Notification[], total, page, limit, totalPages }
        setNotifications(response.notifications || []);
        setUnreadCount(
          (response.notifications || []).filter((n: Notification) => !n.read)
            .length
        );
        setPage(response.page || p);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, pageSize]
  );

  // Mark as read (optimistic UI)
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await markNotificationRead(notificationId);
      // Optionally re-fetch single notification or ignore if API is reliable
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Revert (best-effort)
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

      await markAllNotificationsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      // Re-fetch to recover state
      fetchNotifications();
    }
  };

  // Close panel
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Fetch on mount
  useEffect(() => {
    fetchNotifications({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pagination handlers (simple)
  const loadNextPage = () => {
    if (page < totalPages) {
      fetchNotifications({ page: page + 1 });
    }
  };
  const loadPrevPage = () => {
    if (page > 1) {
      fetchNotifications({ page: page - 1 });
    }
  };

  // Get notification icon
  const getNotificationIcon = (notification: Notification) => {
    const config =
      NOTIFICATION_CONFIG[notification.contextType] ||
      NOTIFICATION_CONFIG.system;
    const IconComponent = config.icon;

    return (
      <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
        <IconComponent className="w-4 h-4" />
      </div>
    );
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-sm transition-all duration-300"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-80 bg-white shadow-xl border-l border-gray-200 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0E3554] rounded-lg">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0E3554]">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-600">{unreadCount} unread</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-1.5 text-gray-500 hover:text-[#1CC2B1] hover:bg-gray-100 rounded transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => fetchNotifications({ showRefresh: true })}
              disabled={refreshing}
              className="p-1.5 text-gray-500 hover:text-[#1CC2B1] hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded transition-colors ${
                filter === "all"
                  ? "bg-[#0E3554] text-white"
                  : "text-gray-600 hover:text-[#0E3554]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded transition-colors ${
                filter === "unread"
                  ? "bg-[#0E3554] text-white"
                  : "text-gray-600 hover:text-[#0E3554]"
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 h-[calc(100vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center space-y-2">
                <div className="w-6 h-6 border-2 border-[#D9F3EE] border-t-[#1CC2B1] rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-gray-500">Loading...</p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center space-y-2">
                <Bell className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm text-gray-500">
                  {filter === "unread"
                    ? "No unread notifications"
                    : "No notifications"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto h-full">
              <div className="p-3 space-y-2">
                {filteredNotifications.map((notification) => {
                  const { actorName, actorEmail, actorRole } =
                    deriveActorLabel(notification);
                  // If a user was created and data contains name/email/role, surface that clearly
                  const createdUserTitle =
                    notification.contextType === "user" &&
                    notification.data?.name
                      ? `${notification.data.name} (${
                          notification.data.role || "user"
                        })`
                      : null;

                  return (
                    <div
                      key={notification._id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        notification.read
                          ? "bg-white border-gray-200 hover:bg-gray-50"
                          : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                      }`}
                      onClick={() =>
                        !notification.read && handleMarkAsRead(notification._id)
                      }
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification)}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm text-gray-800 leading-tight">
                              <span className="font-medium text-[#0E3554]">
                                {actorName}
                                {actorRole ? (
                                  <span className="ml-2 text-[11px] text-gray-500 capitalize">
                                    • {actorRole}
                                  </span>
                                ) : null}
                              </span>{" "}
                              <span className="text-gray-600">
                                {notification.verb}
                              </span>
                            </p>

                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1"></div>
                            )}
                          </div>

                          {/* Task Name - Clickable */}
                          {notification.contextType === "task" && (notification.data?.taskTitle || notification.data?.taskName) && (
                            <div className="mb-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onTaskClick && notification.contextId) {
                                    onTaskClick(notification.contextId, notification.data.projectId, notification.data.taskTitle || notification.data.taskName);
                                  }
                                }}
                                className="flex items-center gap-1 text-xs text-[#1CC2B1] hover:text-[#0E3554] font-medium transition-colors"
                              >
                                <span className="truncate max-w-[200px]">📋 {notification.data.taskTitle || notification.data.taskName}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </button>
                              {/* Show project name instead of verb message for task notifications */}
                              {notification.data?.projectName && (
                                <p className="text-xs text-gray-600 mb-2 leading-tight line-clamp-2">
                                  Project: <span className="font-medium text-gray-800">{notification.data.projectName}</span>
                                </p>
                              )}
                            </div>
                          )}

                          {/* friendly message - Skip for task notifications if project name is shown */}
                          {notification.contextType !== "task" && (
                            <>
                              {notification.data?.message ? (
                                <p className="text-xs text-gray-600 mb-2 leading-tight line-clamp-2">
                                  {notification.data.message}
                                </p>
                              ) : createdUserTitle ? (
                                <p className="text-xs text-gray-600 mb-2 leading-tight line-clamp-2">
                                  {actorName} created {createdUserTitle}
                                </p>
                              ) : (
                                // fallback display of verb + context
                                <p className="text-xs text-gray-600 mb-2 leading-tight line-clamp-2">
                                  {notification.verb} {notification.contextType}
                                </p>
                              )}
                            </>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-gray-500 capitalize">
                                {notification.contextType}
                              </span>
                              {actorEmail && (
                                <span
                                  className="text-[11px] text-gray-400 truncate max-w-40"
                                  title={actorEmail}
                                >
                                  {actorEmail}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Simple pagination controls if multiple pages exist */}
              <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-white">
                <div className="text-xs text-gray-500">
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadPrevPage}
                    disabled={page <= 1}
                    className="px-2 py-1 text-xs bg-white border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={loadNextPage}
                    disabled={page >= totalPages}
                    className="px-2 py-1 text-xs bg-white border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationPanel;

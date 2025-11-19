import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  CheckCheck,
  RefreshCw,
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
  };
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
}

// Type-safe configuration
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

function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read;
    return true;
  });

  // Fetch notifications
  const fetchNotifications = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getNotifications({ page: 1, limit: 50 });
      setNotifications(response.notifications);
      setUnreadCount(response.notifications.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
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
  }, [isOpen]);

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

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
        {/* Clean Header */}
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
              onClick={() => fetchNotifications(true)}
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
                {filteredNotifications.map((notification) => (
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
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm text-gray-800 leading-tight">
                            {notification.actor && (
                              <span className="font-medium text-[#0E3554]">
                                {notification.actor.name}
                              </span>
                            )}{" "}
                            <span className="text-gray-600">
                              {notification.verb}
                            </span>
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>

                        {notification.data.message && (
                          <p className="text-xs text-gray-600 mb-2 leading-tight line-clamp-2">
                            {notification.data.message}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-500 capitalize">
                            {notification.contextType}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationPanel;

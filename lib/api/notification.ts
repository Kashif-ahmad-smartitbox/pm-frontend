import { request } from "./client";

export interface Notification {
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

export interface NotificationsResponse {
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  notifications: Notification[];
}

export interface MarkAllReadResponse {
  message: string;
  modifiedCount: number;
}

/**
 * Get notifications for the current user
 * @param params - Query parameters
 * @param params.page - Page number (default: 1)
 * @param params.limit - Number of items per page (default: 20)
 * @param params.read - Filter by read status (true/false)
 */
export function getNotifications(params: {
  page?: number;
  limit?: number;
  read?: boolean;
}): Promise<NotificationsResponse> {
  const urlParams = new URLSearchParams({
    page: (params.page || 1).toString(),
    limit: (params.limit || 20).toString(),
  });

  if (params.read !== undefined) {
    urlParams.append("read", params.read.toString());
  }

  return request(`/api/notifications?${urlParams.toString()}`);
}

/**
 * Mark a single notification as read
 * @param id - Notification ID
 */
export function markNotificationRead(
  id: string
): Promise<{ message: string; notification: Notification }> {
  return request(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
}

/**
 * Mark all notifications as read for the current user
 */
export function markAllNotificationsRead(): Promise<MarkAllReadResponse> {
  return request("/api/notifications/read-all", {
    method: "PATCH",
  });
}

/**
 * Utility function to create notifications (for admin use or server-side)
 * Note: This would typically be used on the server-side, but included for completeness
 */
export interface CreateNotificationParams {
  recipients: string[];
  actor?: string | null;
  verb: string;
  contextType: "project" | "task" | "user" | "system";
  contextId?: string | null;
  data?: Record<string, any>;
}

export function createNotification(
  data: CreateNotificationParams
): Promise<any> {
  return request("/api/notifications", {
    method: "POST",
    body: data,
  });
}

export default {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
};

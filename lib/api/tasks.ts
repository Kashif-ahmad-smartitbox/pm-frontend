import { request } from "./client";

/**
 * -----------------------------
 *  GET TASKS FOR A PROJECT
 * -----------------------------
 */
export function getTasks(projectId: string) {
  return request(`/api/projects/${projectId}/tasks`);
}

/**
 * -----------------------------
 *  GET ALL TASKS (ADMIN / PM)
 * -----------------------------
 * Supports:
 *   page, limit, search, status, priority, assignee, projectId
 */
export const getAllTasks = async (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    projectId?: string;
  } = {}
): Promise<{
  count: number;
  tasks: any[];
  stats?: any;
  page?: number;
  limit?: number;
  totalPages?: number;
}> => {
  const query = new URLSearchParams();

  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));
  if (params.search) query.append("search", params.search);
  if (params.status) query.append("status", params.status);
  if (params.priority) query.append("priority", params.priority);
  if (params.assignee) query.append("assignee", params.assignee);
  if (params.projectId) query.append("projectId", params.projectId);

  const queryString = query.toString() ? `?${query.toString()}` : "";

  return request(`/api/tasks${queryString}`);
};

/**
 * -----------------------------
 *  GET SINGLE TASK
 * -----------------------------
 */
export function getTask(taskId: string) {
  return request(`/api/tasks/${taskId}`);
}

/**
 * -----------------------------
 *  CREATE TASK
 * -----------------------------
 */
export function createTask(data: any) {
  return request(`/api/tasks`, {
    method: "POST",
    body: data,
  });
}

/**
 * ---------------------------------------------------
 *  CREATE NOTE (Supports Text, Files, Location)
 * ---------------------------------------------------
 * For multipart upload:
 *   data MUST be FormData()
 * Example:
 *   const fd = new FormData();
 *   fd.append("text", "Hello");
 *   fd.append("files", file);
 *   fd.append("location", JSON.stringify({lat:12.9,lng:77.5}));
 *   createNote(taskId, fd)
 */
export function createNote(taskId: string, data: FormData) {
  return request(`/api/tasks/${taskId}/notes`, {
    method: "POST",
    isFormData: true,
    body: data,
  });
}

export function getNotes(taskId: string) {
  return request(`/api/tasks/${taskId}/notes`);
}

/**
 * -----------------------------
 *  UPDATE TASK
 * -----------------------------
 */
export function updateTask(taskId: string, data: any) {
  return request(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: data,
  });
}

/**
 * -----------------------------
 *  DELETE TASK
 * -----------------------------
 */
export function deleteTask(taskId: string) {
  return request(`/api/tasks/${taskId}`, { method: "DELETE" });
}

/**
 * ---------------------------------------------------
 *  GET MY TASKS (TEAM MEMBER)
 * ---------------------------------------------------
 * Supports pagination + search
 */
export function getTaskMe(
  page: number = 1,
  limit: number = 9,
  search: string = "",
  status?: string,
  priority?: string,
  projectId?: string
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) params.append("search", search);
  if (status) params.append("status", status);
  if (priority) params.append("priority", priority);
  if (projectId) params.append("projectId", projectId);

  return request(`/api/tasks/me?${params.toString()}`);
}

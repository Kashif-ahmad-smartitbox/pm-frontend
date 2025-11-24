import { request } from "./client";

export function getTasks(projectId: string) {
  return request(`/api/projects/${projectId}/tasks`);
}

export const getAllTasks = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  assignee?: string;
}): Promise<{
  count: number;
  tasks: any[];
  page?: number;
  limit?: number;
  totalPages?: number;
}> => {
  const queryParams = new URLSearchParams();

  return request(`/api/tasks${queryParams}`);
};

export function getTask(taskId: string) {
  return request(`/api/tasks/${taskId}`);
}

export function createTask(data: any) {
  return request(`/api/tasks`, {
    method: "POST",
    body: data,
  });
}

export function createNote(taskId: string, text: any) {
  return request(`/api/tasks/${taskId}/notes`, {
    method: "POST",
    body: { text },
  });
}

export function updateTask(taskId: string, data: any) {
  return request(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteTask(taskId: string) {
  return request(`/api/tasks/${taskId}`, { method: "DELETE" });
}

export function getTaskMe(
  page: number = 1,
  limit: number = 9,
  search: string = ""
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  return request(`/api/tasks/me?${params.toString()}`);
}

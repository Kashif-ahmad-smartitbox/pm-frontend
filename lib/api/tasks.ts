import { request } from "./client";

export function getTasks(projectId: string) {
  return request(`/api/projects/${projectId}/tasks`);
}

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
    method: "PUT",
    body: data,
  });
}

export function deleteTask(taskId: string) {
  return request(`/api/tasks/${taskId}`, { method: "DELETE" });
}

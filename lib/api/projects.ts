import { request } from "./client";

export function getProjects() {
  return request("/api/projects");
}

export function getProjectData(id: string) {
  return request(`/api/projects/${id}/data`);
}

export function getProjectById(id: string) {
  return request(`/api/projects/${id}`);
}

export function createProject(data: any) {
  return request("/api/projects", {
    method: "POST",
    body: data,
  });
}

export function updateProject(id: string, data: any) {
  return request(`/api/projects/${id}`, {
    method: "PUT",
    body: data,
  });
}

export function deleteProject(id: string) {
  return request(`/api/projects/${id}`, {
    method: "DELETE",
  });
}

import { request } from "./client";

// GET all project types
export function getProjectTypes() {
  return request("/api/project-types");
}

// CREATE new project type
export function createProjectType(data: any) {
  return request("/api/project-types", {
    method: "POST",
    body: data,
  });
}

// UPDATE project type
export function updateProjectType(id: string, data: any) {
  return request(`/api/project-types/${id}`, {
    method: "PATCH",
    body: data,
  });
}

// DELETE project type
export function deleteProjectType(id: string) {
  return request(`/api/project-types/${id}`, {
    method: "DELETE",
  });
}

// GET single project type
export function getProjectTypeById(id: string) {
  return request(`/api/project-types/${id}`);
}

import { request } from "./client";

export interface ProjectsResponse {
  projects: any[];
  counts: {
    total: number;
    planned: number;
    active: number;
    completed: number;
  };
  page: number;
  limit: number;
  totalPages: number;
}

export function getProjects(
  page: number = 1,
  limit: number = 9,
  search: string = ""
): Promise<ProjectsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  return request(`/api/projects?${params.toString()}`);
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

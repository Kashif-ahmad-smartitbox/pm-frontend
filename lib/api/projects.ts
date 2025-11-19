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

export function getProjects(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}): Promise<ProjectsResponse> {
  const urlParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  if (params.search) {
    urlParams.append("search", params.search);
  }

  if (params.status && params.status !== "all") {
    urlParams.append("status", params.status);
  }

  return request(`/api/projects?${urlParams.toString()}`);
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

import { request } from "./client";

export function getUsers() {
  return request("/api/users/except-me");
}

export function getProjectManagers() {
  return request("/api/users/project-managers");
}

export function createManagers(data: any) {
  return request("/api/users/project-managers", {
    method: "POST",
    body: data,
  });
}

export function getTeam() {
  return request("/api/users/team");
}

export function createTeam(data: any) {
  return request("/api/users/team-members", {
    method: "POST",
    body: data,
  });
}

export function deleteUser(userId: string) {
  return request(`/api/users/${userId}`, { method: "DELETE" });
}

export function updateUser(id: string, data: any) {
  return request(`/api/users/${id}`, {
    method: "PATCH",
    body: data,
  });
}

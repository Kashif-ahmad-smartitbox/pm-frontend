export type ProjectStatus = "planned" | "active" | "completed" | "overdue";

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  color?: string;
}

export interface ProjectType {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Project {
  _id: string;
  projectName: string;
  location: string;
  projectManager: User;
  projectType: ProjectType;
  projectOverdue?: boolean;
  startDate: string;
  endDate: string;
  createdBy: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

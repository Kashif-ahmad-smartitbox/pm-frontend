import { request } from "./client";

export interface ReportNote {
  _id: string;
  text: string;
  attachments: any[];
  location: any | null;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  isDeleted?: boolean;
  author: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface ReportTask {
  _id: string;
  title: string;
  description: string;
  project: string;
  assignees: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  priority: string;
  dueDate?: string;
  notes: ReportNote[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ReportProject {
  _id: string;
  projectName: string;
  location: string;
  projectManager: {
    _id: string;
    name: string;
    email: string;
  };
  projectType: {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
  startDate?: string;
  endDate?: string;
  createdBy: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  taskStats: {
    total: number;
    todo: number;
    in_progress: number;
    done: number;
    overdue: number;
  };
  projectOverdue: boolean;
  tasks: ReportTask[];
}

export interface CombinedProjectsReportResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  tasksLimitPerProject: number;
  projects: ReportProject[];
}

export function getCombinedProjectsReport(params: {
  page: number;
  limit: number;
  tasksLimitPerProject?: number;
  projectStatus?: string;
  projectSearch?: string;
  projectManagerId?: string;
  taskStatus?: string;
  taskPriority?: string;
  taskAssigneeId?: string;
  taskSearch?: string;
  projectFrom?: string;
  projectTo?: string;
}): Promise<CombinedProjectsReportResponse> {
  const q = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  const push = (key: string, val?: string | number) => {
    if (val !== undefined && val !== null && val !== "") {
      q.append(key, String(val));
    }
  };

  push("tasksLimit", params.tasksLimitPerProject);
  push("projectStatus", params.projectStatus);
  push("projectSearch", params.projectSearch);
  push("projectManagerId", params.projectManagerId);
  push("taskStatus", params.taskStatus);
  push("taskPriority", params.taskPriority);
  push("taskAssigneeId", params.taskAssigneeId);
  push("taskSearch", params.taskSearch);
  push("projectFrom", params.projectFrom);
  push("projectTo", params.projectTo);

  return request(`/api/reports/combined?${q.toString()}`);
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type ApprovalStatus = "none" | "pending" | "approved";

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export interface Note {
  _id: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: string;
  assignees: User[];
  createdBy: User;
  status: TaskStatus;
  approvalStatus?: ApprovalStatus;
  dueDate: string;
  priority: TaskPriority;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TaskWithProjectDetails extends Omit<Task, "project"> {
  project: {
    _id: string;
    projectName: string;
    location: string;
  };
}

export type ProjectStatus = "planned" | "active" | "completed";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
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
  startDate: string;
  endDate: string;
  createdBy: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
  dueDate: string;
  priority: TaskPriority;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProjectData {
  project: Project;
  taskStats: {
    total: number;
    byStatus: {
      todo: number;
      in_progress: number;
      done: number;
    };
    byPriority: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    overdue: number;
  };
  tasks: Task[];
  assignees: User[];
  recentNotes: Array<{
    taskId: string;
    taskTitle: string;
    noteId: string;
    text: string;
    createdAt: string;
    author: User;
  }>;
}

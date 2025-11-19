import {
  Calendar,
  Edit,
  FileText,
  MessageCircle,
  Trash2,
  User,
  Users,
} from "lucide-react";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

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
  dueDate: string;
  priority: TaskPriority;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const TaskCard2 = ({
  task,
  onTaskClick,
  onEditTask,
  onDeleteTask,
}: {
  task: Task;
  onTaskClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}) => (
  <div className="bg-white rounded-xl p-3 border border-[#E1F3F0] hover:border-[#1CC2B1] hover:shadow-md transition-all duration-300 group">
    {/* Header with Status */}
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <div className="w-6 h-6 bg-[#E0FFFA] rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-3.5 h-3.5 text-[#1CC2B1]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#0E3554] truncate mb-0.5 group-hover:text-[#1CC2B1] transition-colors">
            {task.title}
          </h3>
        </div>
      </div>
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          task.status === "todo"
            ? "bg-slate-100 text-slate-700"
            : task.status === "in_progress"
            ? "bg-[#E0FFFA] text-[#0E3554]"
            : "bg-[#E1F3F0] text-[#1CC2B1]"
        }`}
      >
        {task.status === "todo"
          ? "To Do"
          : task.status === "in_progress"
          ? "In Progress"
          : "Done"}
      </span>
    </div>

    {/* Description */}
    <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-2">
      {task.description}
    </p>

    {/* Creator Info */}
    {task.createdBy && (
      <div className="flex items-center gap-2 mb-2 text-xs">
        <div className="w-5 h-5 bg-[#0E3554] rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-2.5 h-2.5 text-white" />
        </div>
        <span className="text-slate-700 font-medium">
          {typeof task.createdBy === "object" ? task.createdBy.name : "Unknown"}
        </span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-500 capitalize">
          {typeof task.createdBy === "object"
            ? task.createdBy.role === "admin"
              ? "Administrator"
              : task.createdBy.role === "project_manager"
              ? "Project Manager"
              : task.createdBy.role === "team_member"
              ? "Team Member"
              : task.createdBy.role || "Team Member"
            : "Unknown"}
        </span>
      </div>
    )}

    {/* Metadata Row */}
    <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>
            {new Date(task.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{task.assignees?.length || 0}</span>
        </div>
      </div>
      <div
        className={`px-2 py-1 rounded text-xs font-medium capitalize ${
          task.priority === "low"
            ? "bg-[#E1F3F0] text-[#1CC2B1]"
            : task.priority === "medium"
            ? "bg-[#FFF4DD] text-[#E6A93A]"
            : task.priority === "high"
            ? "bg-orange-50 text-orange-700"
            : "bg-red-50 text-red-700"
        }`}
      >
        {task.priority}
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200">
      <button
        onClick={() => onTaskClick(task)}
        className="flex-1 px-2 py-1.5 text-slate-700 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-50 text-xs flex items-center justify-center gap-1"
      >
        <MessageCircle className="w-3 h-3" />
        Chat
      </button>
      <button
        onClick={() => onEditTask(task)}
        className="flex-1 px-2 py-1.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg font-medium hover:bg-blue-100 text-xs flex items-center justify-center gap-1"
      >
        <Edit className="w-3 h-3" />
        Edit
      </button>
      <button
        onClick={() => onDeleteTask(task)}
        className="flex-1 px-2 py-1.5 text-red-700 bg-red-50 border border-red-200 rounded-lg font-medium hover:bg-red-100 text-xs flex items-center justify-center gap-1"
      >
        <Trash2 className="w-3 h-3" />
        Delete
      </button>
    </div>
  </div>
);

export default TaskCard2;

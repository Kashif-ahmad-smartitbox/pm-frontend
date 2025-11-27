import {
  Calendar,
  Edit,
  FileText,
  MessageCircle,
  Trash2,
  User,
  Users,
  Clock,
  AlertTriangle,
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

// Helper function to check if task was created within last 24 hours
const isNewTask = (createdAt: string): boolean => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInHours =
    (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
  return diffInHours <= 24;
};

// Helper function to check if task is overdue
const isTaskOverdue = (task: Task): boolean => {
  if (task.status === "done") return false;
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  return dueDate < today;
};

// Format date to relative time or specific format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

// Format due date with smart year display
const formatDueDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const currentYear = now.getFullYear();
  const dateYear = date.getFullYear();

  // If the date is in the current year, don't show the year
  if (dateYear === currentYear) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // For other years, show with 2-digit year format
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
};

// Format date with full year for detailed display
const formatDateWithYear = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

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
}) => {
  const isNew = task.createdAt && isNewTask(task.createdAt);
  const overdue = isTaskOverdue(task);

  return (
    <div
      className={`bg-white rounded-xl p-3 border transition-all duration-300 group ${
        overdue
          ? "border-red-200 bg-red-50/50 hover:border-red-300 hover:bg-red-50/70"
          : "border-[#E1F3F0] hover:border-[#1CC2B1] hover:shadow-md"
      }`}
    >
      {/* Header with Status */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
              overdue
                ? "bg-red-100 text-red-600"
                : "bg-[#E0FFFA] text-[#1CC2B1]"
            }`}
          >
            {overdue ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className={`text-sm font-semibold truncate mb-0.5 transition-colors ${
                overdue
                  ? "text-red-900 group-hover:text-red-700"
                  : "text-[#0E3554] group-hover:text-[#1CC2B1]"
              }`}
            >
              {task.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* New Badge - Next to status */}
          {isNew && (
            <div className="bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-0.5">
              <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
              NEW
            </div>
          )}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
              overdue
                ? "bg-red-100 text-red-700 border border-red-200"
                : task.status === "todo"
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
      </div>

      {/* Overdue Badge */}
      {overdue && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200">
            <AlertTriangle className="w-3 h-3" />
            Overdue
          </span>
        </div>
      )}

      {/* Created Date */}
      <div
        className={`flex items-center gap-1 text-xs mb-2 ${
          overdue ? "text-red-700" : "text-slate-500"
        }`}
      >
        <Clock className="w-3 h-3" />
        <span>Created: </span>
        <span
          className={`font-medium ${
            overdue ? "text-red-800" : "text-slate-700"
          }`}
        >
          {task.createdAt ? formatDate(task.createdAt) : "N/A"}
        </span>
      </div>

      {/* Description */}
      <p
        className={`text-xs leading-relaxed line-clamp-2 mb-2 ${
          overdue ? "text-red-800" : "text-slate-600"
        }`}
      >
        {task.description}
      </p>

      {/* Creator Info */}
      {task.createdBy && (
        <div
          className={`flex items-center gap-2 mb-2 text-xs ${
            overdue ? "text-red-700" : "text-slate-600"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              overdue ? "bg-red-600" : "bg-[#0E3554]"
            }`}
          >
            <User className="w-2.5 h-2.5 text-white" />
          </div>
          <span
            className={`font-medium ${
              overdue ? "text-red-800" : "text-slate-700"
            }`}
          >
            {typeof task.createdBy === "object"
              ? task.createdBy.name
              : "Unknown"}
          </span>
          <span className={overdue ? "text-red-500" : "text-slate-500"}>•</span>
          <span className={overdue ? "text-red-600" : "text-slate-500"}>
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
      <div
        className={`flex items-center justify-between text-xs mb-3 ${
          overdue ? "text-red-700" : "text-slate-600"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1 ${
              overdue ? "text-red-800 font-medium" : ""
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>
              {task.dueDate ? formatDueDate(task.dueDate) : "No due date"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{task.assignees?.length || 0}</span>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded text-xs font-medium capitalize ${
            overdue
              ? "bg-red-100 text-red-800 border border-red-200"
              : task.priority === "low"
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

      {/* Due Date Details - Shows full date with year */}
      <div
        className={`mb-2 text-[10px] ${
          overdue ? "text-red-600" : "text-slate-500"
        }`}
      >
        <span className="font-medium">Due date: </span>
        <span>
          {task.dueDate ? formatDateWithYear(task.dueDate) : "Not set"}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200">
        <button
          onClick={() => onTaskClick(task)}
          className={`flex-1 px-2 py-1.5 rounded-lg font-medium text-xs flex items-center justify-center gap-1 transition-colors ${
            overdue
              ? "text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300"
              : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
          }`}
        >
          <MessageCircle className="w-3 h-3" />
          Chat
        </button>
        <button
          onClick={() => onEditTask(task)}
          className={`flex-1 px-2 py-1.5 rounded-lg font-medium text-xs flex items-center justify-center gap-1 transition-colors ${
            overdue
              ? "text-red-700 bg-red-100 border border-red-300 hover:bg-red-200"
              : "text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100"
          }`}
        >
          <Edit className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={() => onDeleteTask(task)}
          className={`flex-1 px-2 py-1.5 rounded-lg font-medium text-xs flex items-center justify-center gap-1 transition-colors ${
            overdue
              ? "text-white bg-red-600 border border-red-700 hover:bg-red-700"
              : "text-red-700 bg-red-50 border border-red-200 hover:bg-red-100"
          }`}
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard2;

import React from "react";
import {
  Clock,
  User,
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Circle,
  PlayCircle,
  Edit,
} from "lucide-react";
import { Task, TaskStatus, TaskPriority } from "./TaskCard2";

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  onEditTask,
  onDeleteTask,
}) => {
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return <Circle className="w-3.5 h-3.5 text-gray-400" />;
      case "in_progress":
        return <PlayCircle className="w-3.5 h-3.5 text-blue-500" />;
      case "done":
        return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      default:
        return <Circle className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "done":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const isOverdue = (task: Task) => {
    if (task.status === "done") return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today;
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="bg-white rounded-lg border border-[#E1F3F0] p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer"
          onClick={() => onTaskClick(task)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(task.status)}
                <h3 className="font-medium text-[#0E3554] truncate">
                  {task.title}
                </h3>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {task.description}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Priority Badge */}
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>

                {/* Status Badge */}
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status.replace("_", " ")}
                </span>

                {/* Due Date */}
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-3.5 h-3.5" />
                  <span
                    className={
                      isOverdue(task) ? "text-red-600 font-medium" : ""
                    }
                  >
                    {formatDate(task.dueDate)}
                    {isOverdue(task) && " (Overdue)"}
                  </span>
                </div>

                {/* Assignees */}
                {task.assignees.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <User className="w-3.5 h-3.5" />
                    <span>{task.assignees.length} assigned</span>
                  </div>
                )}

                {/* Notes Count */}
                {task.notes.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{task.notes.length} notes</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTask(task);
                }}
                className="p-1.5 text-gray-400 hover:text-[#0E3554] hover:bg-gray-100 rounded-md transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;

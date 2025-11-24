"use client";

import React from "react";
import {
  FileText,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  Play,
  CheckCircle2,
  Eye,
  Clock,
} from "lucide-react";
import { TaskWithProjectDetails } from "@/types/task";
import TaskStatusBadge from "./TaskStatusBadge";
import PriorityBadge from "./PriorityBadge";

interface TaskCardProps {
  task: TaskWithProjectDetails;
  onTaskClick: (task: any) => void;
  onStatusChange: (
    taskId: string,
    newStatus: "todo" | "in_progress" | "done",
    taskTitle: string
  ) => void;
}

// Helper function to check if task was created within last 24 hours
const isNewTask = (createdAt: string): boolean => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInHours =
    (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
  return diffInHours <= 24;
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
    });
  }
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onTaskClick,
  onStatusChange,
}) => {
  const convertTaskForModal = (task: TaskWithProjectDetails) => ({
    ...task,
    project: task.project._id,
  });

  const isOverdue =
    new Date(task.dueDate) < new Date() && task.status !== "done";

  const isNew = task.createdAt && isNewTask(task.createdAt);

  const StatusButton = ({ currentStatus, taskId, taskTitle }: any) => {
    if (currentStatus === "todo") {
      return (
        <button
          onClick={() => onStatusChange(taskId, "in_progress", taskTitle)}
          className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-[#0E3554] text-white rounded-lg font-medium hover:bg-[#092A40] transition-all duration-200 text-xs shadow-sm"
        >
          <Play className="w-3 h-3" />
          <span>Start</span>
        </button>
      );
    }

    if (currentStatus === "in_progress") {
      return (
        <button
          onClick={() => onStatusChange(taskId, "done", taskTitle)}
          className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-[#1CC2B1] text-white rounded-lg font-medium hover:bg-[#19AFA1] transition-all duration-200 text-xs shadow-sm"
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Complete</span>
        </button>
      );
    }

    return (
      <div className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-[#E5F7F4] text-[#1CC2B1] rounded-lg font-semibold text-xs shadow-sm">
        <CheckCircle2 className="w-3 h-3" />
        <span>Done</span>
      </div>
    );
  };

  const showChatButton = task.status !== "todo";

  return (
    <div className="bg-white rounded-xl p-4 border border-[#E4F4F1] hover:border-[#1CC2B1] hover:shadow-md transition-all duration-200 group flex flex-col gap-3">
      {/* Project Name TOP - Fixed overflow */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center max-w-full bg-[#F3FCF9] text-[#0E3554] text-[11px] px-2 py-1 rounded-md font-semibold leading-tight">
            <span className="truncate">{task.project.projectName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* New Badge - Next to status */}
          {isNew && (
            <div className="bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-0.5 shrink-0">
              <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
              NEW
            </div>
          )}
          <div className="flex items-center gap-1 shrink-0">
            <TaskStatusBadge status={task.status} compact />
            <PriorityBadge priority={task.priority} compact />
          </div>
        </div>
      </div>

      {/* Created Date */}
      <div className="flex items-center gap-1 text-xs text-slate-500 -mt-2">
        <Clock className="w-3 h-3" />
        <span>Created at: </span>
        <span className="font-medium text-slate-700">
          {task.createdAt ? formatDate(task.createdAt) : "N/A"}
        </span>
      </div>

      {/* TITLE + DESCRIPTION in ONE line with TOOLTIP */}
      <div className="relative w-full group/title">
        <div className="text-sm font-semibold text-[#0E3554] truncate cursor-default">
          {task.title} —{" "}
          <span className="text-xs text-slate-600">{task.description}</span>
        </div>

        {/* Tooltip */}
        <div className="absolute z-20 hidden group-hover/title:block bg-black text-white text-xs px-3 py-2 rounded-md shadow-lg w-max max-w-xs top-full mt-1">
          <span className="font-semibold">{task.title}</span>
          <br />
          <span>{task.description}</span>
        </div>
      </div>

      {/* Icon + Visual */}
      <div className="flex items-start gap-3">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
            ${
              task.status === "done"
                ? "bg-[#E1F3F0] text-[#1CC2B1]"
                : task.status === "in_progress"
                ? "bg-[#E7FFFB] text-[#0E3554]"
                : "bg-[#F4FFFC] text-[#0E3554]"
            }`}
        >
          <FileText className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* META */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Due</span>
          <span
            className={`font-medium ${
              isOverdue ? "text-red-600" : "text-[#0E3554]"
            }`}
          >
            {new Date(task.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500">
          <Users className="w-3.5 h-3.5" />
          <span>By</span>
          <span className="font-medium text-[#0E3554] truncate">
            {task.createdBy.name.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* NOTES + LOCATION */}
      <div className="flex justify-between items-center text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3 h-3" />
          <span>{task.notes ? task.notes.length : 0} notes</span>
        </div>

        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{task.project.location}</span>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-2 pt-2 border-t border-[#E4F4F1]">
        {showChatButton && (
          <button
            onClick={() => onTaskClick(convertTaskForModal(task))}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-[#F4FFFC] text-[#0E3554] rounded-lg font-medium hover:bg-[#1CC2B1] hover:text-white transition-all text-xs shadow-sm"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Chat</span>
          </button>
        )}

        <div className={`${showChatButton ? "flex-1" : "w-full"}`}>
          <StatusButton
            currentStatus={task.status}
            taskId={task._id}
            taskTitle={task.title}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

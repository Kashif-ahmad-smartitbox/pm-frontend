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
      {/* Project Name TOP */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center max-w-[75%]">
          <span className="inline-block bg-[#F3FCF9] text-[#0E3554] text-[11px] px-2 py-1 rounded-md font-semibold leading-tight truncate">
            {task.project.projectName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <TaskStatusBadge status={task.status} compact />
          <PriorityBadge priority={task.priority} compact />
        </div>
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

        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />
          <span className="truncate max-w-24">{task.project.location}</span>
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

import { useState, useEffect, useRef } from "react";
import { createNote } from "@/lib/api/tasks";
import {
  X,
  MessageSquare,
  User,
  Calendar,
  Send,
  Users,
  RefreshCw,
} from "lucide-react";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high" | "critical";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  color?: string;
}

interface Note {
  _id: string;
  author: User;
  text: string;
  createdAt: string;
}

interface Task {
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

const TaskNotesModal = ({
  task,
  isOpen,
  onClose,
  onNoteAdded,
  onRefresh,
  currentUser,
}: {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onNoteAdded: (newNote: Note) => void;
  onRefresh: () => void;
  currentUser: User;
}) => {
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new notes are added
  useEffect(() => {
    scrollToBottom();
  }, [task.notes]);

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      const addedNote = await createNote(task._id, newNote);
      onNoteAdded(addedNote);
      setNewNote("");
      // Refocus textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setAddingNote(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddNote();
    }
  };

  const getAuthorInitial = (author: User | undefined) => {
    if (!author || !author.name) return "?";
    return author.name.charAt(0).toUpperCase();
  };

  const getAuthorName = (author: User | undefined) => {
    if (!author || !author.name) return "Unknown User";
    return author.name;
  };

  const getUserAvatar = (author: User | undefined) => {
    const initials = getAuthorInitial(author);
    const backgroundColor = author?.color || "#EFFFFA";
    const textColor = author?.color
      ? getContrastColor(author.color)
      : "#0E3554";

    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 border border-white shadow-xs"
        style={{
          backgroundColor: backgroundColor,
          color: textColor,
        }}
      >
        {initials}
      </div>
    );
  };

  const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  const isCurrentUser = (author: User | undefined) => {
    return author?._id === currentUser?._id;
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-sm border border-[#D9F3EE] overflow-hidden w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header - Ultra Compact */}
        <div className="bg-white border-b border-[#D9F3EE] p-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-7 h-7 bg-[#EFFFFA] rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-[#0E3554]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#0E3554] truncate">
                  {task.title}
                </h2>
                <p className="text-slate-500 text-xs truncate">
                  {task.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-[#0E3554] hover:bg-slate-100 rounded transition-colors"
                title="Refresh messages"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button> */}
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-[#0E3554] hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Task Info - Ultra Compact */}
        <div className="border-b border-[#D9F3EE] p-2 bg-[#EFFFFA] flex-shrink-0">
          <div className="flex flex-wrap items-center gap-1 text-xs text-slate-600">
            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-[#D9F3EE]">
              <User className="w-3 h-3" />
              <span>{getAuthorName(task.createdBy)}</span>
            </span>
            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-[#D9F3EE]">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </span>
            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-[#D9F3EE]">
              <Users className="w-3 h-3" />
              <span>{task.assignees?.length || 0}</span>
            </span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Header - Compact */}
          <div className="border-b border-[#D9F3EE] p-3 bg-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#0E3554]">
                  Discussion
                </h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {task.notes?.length || 0}
                </span>
              </div>
              {/* <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-xs text-slate-500 hover:text-[#0E3554] flex items-center gap-1 transition-colors px-2 py-1 hover:bg-slate-50 rounded"
              >
                <RefreshCw
                  className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button> */}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
            {!task.notes || task.notes.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto border border-[#D9F3EE]">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[#0E3554] font-medium text-sm">
                    No messages yet
                  </p>
                  <p className="text-slate-500 text-xs">
                    Start the conversation
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {task.notes.map((note, index) => {
                  const isCurrentUserMessage = isCurrentUser(note.author);
                  const showHeader =
                    index === 0 ||
                    task.notes[index - 1].author._id !== note.author._id ||
                    new Date(note.createdAt).getTime() -
                      new Date(task.notes[index - 1].createdAt).getTime() >
                      300000; // 5 minutes

                  return (
                    <div
                      key={note._id}
                      className={`flex gap-2 group ${
                        isCurrentUserMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Avatar - Only show for others */}
                      {!isCurrentUserMessage && (
                        <div className="flex-shrink-0 mt-0.5">
                          {getUserAvatar(note.author)}
                        </div>
                      )}

                      {/* Message Content */}
                      <div
                        className={`flex flex-col ${
                          isCurrentUserMessage ? "items-end" : "items-start"
                        } max-w-[85%]`}
                      >
                        {/* Message Header */}
                        {showHeader && !isCurrentUserMessage && (
                          <div className="flex items-center gap-1.5 mb-0.5 px-1">
                            <span className="font-medium text-[#0E3554] text-xs">
                              {getAuthorName(note.author)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatMessageTime(note.createdAt)}
                            </span>
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div className="flex gap-2 items-start">
                          <div
                            className={`relative rounded-xl p-2.5 ${
                              isCurrentUserMessage
                                ? "bg-[#0E3554] text-white rounded-br-sm"
                                : "bg-white border border-[#D9F3EE] rounded-bl-sm"
                            } group-hover:shadow-xs transition-all duration-150`}
                          >
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">
                              {note.text}
                            </p>
                          </div>

                          {/* Timestamp for current user */}
                          {isCurrentUserMessage && (
                            <span className="text-[10px] text-slate-400 mt-0.5 flex-shrink-0">
                              {formatMessageTime(note.createdAt)}
                            </span>
                          )}
                        </div>

                        {/* Header for current user */}
                        {showHeader && isCurrentUserMessage && (
                          <div className="flex items-center gap-1.5 mb-0.5 px-1 mt-0.5">
                            <span className="font-medium text-[#0E3554] text-xs">
                              You
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Avatar for current user */}
                      {isCurrentUserMessage && (
                        <div className="flex-shrink-0 mt-0.5">
                          {getUserAvatar(note.author)}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Message Input - Compact */}
        <div className="border-t border-[#D9F3EE] p-3 bg-white flex-shrink-0">
          <div className="space-y-2">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message... (Ctrl+Enter to send)"
                className="w-full px-3 py-2 pl-3 pr-10 text-xs border border-[#D9F3EE] rounded-lg 
                  placeholder-slate-400 transition-all duration-150
                  focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                  hover:border-[#0E3554] bg-white text-[#0E3554]
                  disabled:bg-[#EFFFFA] disabled:cursor-not-allowed resize-none"
                rows={2}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || addingNote}
                className="absolute right-2 bottom-2 w-6 h-6 flex items-center justify-center rounded
                  bg-[#0E3554] hover:bg-[#0A2A42] disabled:bg-slate-300 disabled:cursor-not-allowed
                  transition-all duration-150 text-white"
                title="Send message (Ctrl+Enter)"
              >
                {addingNote ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate-400">Ctrl+Enter to send</p>
              <button
                onClick={onClose}
                className="px-2.5 py-1 text-xs text-[#0E3554] hover:text-[#1CC2B1] font-medium transition-colors hover:bg-[#EFFFFA] rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskNotesModal;

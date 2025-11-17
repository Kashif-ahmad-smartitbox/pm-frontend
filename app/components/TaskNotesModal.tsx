import { useState } from "react";
import { createNote } from "@/lib/api/tasks";
import {
  X,
  MessageSquare,
  User,
  Calendar,
  FileText,
  Send,
  Clock,
  Users,
} from "lucide-react";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high" | "critical";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
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
}: {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onNoteAdded: (newNote: Note) => void;
}) => {
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      const addedNote = await createNote(task._id, newNote);
      onNoteAdded(addedNote);
      setNewNote("");
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setAddingNote(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
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

  const getAuthorRole = (author: User | undefined) => {
    if (!author || !author.role) return "Team Member";
    return author.role;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-sm border border-[#D9F3EE] overflow-hidden w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0E3554] to-[#1CC2B1] text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-[#0E3554]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate">
                  {task.title}
                </h2>
                <div className="text-teal-100 text-sm mt-1 flex items-start gap-2">
                  <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="flex-1 min-w-0 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Task Info */}
        <div className="border-b border-[#D9F3EE] p-4 bg-[#EFFFFA] flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-[#D9F3EE]">
              <User className="w-4 h-4" />
              Created by {getAuthorName(task.createdBy)}
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-[#D9F3EE]">
              <Calendar className="w-4 h-4" />
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-[#D9F3EE]">
              <Users className="w-4 h-4" />
              {task.assignees?.length || 0} assignee(s)
            </span>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-[#0E3554] rounded-full"></div>
            <h3 className="text-lg font-bold text-[#0E3554] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#1CC2B1]" />
              Notes ({task.notes?.length || 0})
            </h3>
          </div>

          {!task.notes || task.notes.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-[#EFFFFA] rounded-2xl flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <div className="space-y-2">
                <p className="text-[#0E3554] font-medium">No notes yet</p>
                <p className="text-slate-500 text-sm">
                  Be the first to add a note to this task
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {task.notes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white border border-[#D9F3EE] rounded-xl p-4 hover:border-[#1CC2B1] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#0E3554] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {getAuthorInitial(note.author)}
                      </div>
                      <div>
                        <span className="font-semibold text-[#0E3554] block">
                          {getAuthorName(note.author)}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {getAuthorRole(note.author)}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500 flex items-center gap-1.5 bg-[#EFFFFA] px-2.5 py-1 rounded-lg flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(note.createdAt).toLocaleDateString()} at{" "}
                      {new Date(note.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-[#0E3554] leading-relaxed pl-11">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Note Form */}
        <div className="border-t border-[#D9F3EE] p-6 bg-white flex-shrink-0">
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your note here... (Ctrl+Enter to send)"
                className="w-full px-4 py-3 pl-12 pr-4 border border-[#D9F3EE] rounded-xl 
                  placeholder-slate-400 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                  hover:border-[#0E3554] bg-white text-[#0E3554]
                  disabled:bg-[#EFFFFA] disabled:cursor-not-allowed resize-none"
                rows={3}
              />
              <div className="absolute left-4 top-4">
                <MessageSquare className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-sm text-slate-500 flex items-center gap-2 order-2 sm:order-1">
                <span>Press Ctrl+Enter to send quickly</span>
              </p>
              <div className="flex items-center gap-3 order-1 sm:order-2 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="px-4 sm:px-6 py-2.5 text-[#0E3554] hover:text-[#1CC2B1] font-medium transition-colors hover:bg-[#EFFFFA] rounded-lg flex-1 sm:flex-none text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addingNote}
                  className="px-4 sm:px-6 py-2.5 rounded-lg font-medium
                    bg-[#0E3554] hover:bg-[#0A2A42]
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2 text-white flex-1 sm:flex-none"
                >
                  {addingNote ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Add Note</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskNotesModal;

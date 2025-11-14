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

  // Safe author name extraction with fallback
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/60 overflow-hidden w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-slate-400/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center border border-white/30 flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate">
                  {task.title}
                </h2>
                <div className="text-white/80 text-sm mt-1 flex items-start gap-2">
                  <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="flex-1 min-w-0 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Task Info */}
        <div className="border-b border-slate-200/60 p-4 bg-slate-50/50 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <User className="w-4 h-4" />
              Created by {getAuthorName(task.createdBy)}
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-4 h-4" />
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <Users className="w-4 h-4" />
              {task.assignees?.length || 0} assignee(s)
            </span>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              Notes ({task.notes?.length || 0})
            </h3>
          </div>

          {!task.notes || task.notes.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <div className="space-y-2">
                <p className="text-slate-700 font-medium">No notes yet</p>
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
                  className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-cyan-300 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {getAuthorInitial(note.author)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">
                          {getAuthorName(note.author)}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {getAuthorRole(note.author)}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(note.createdAt).toLocaleDateString()} at{" "}
                      {new Date(note.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed pl-11 group-hover:text-slate-800 transition-colors">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Note Form */}
        <div className="border-t border-slate-200/60 p-6 bg-white/50 backdrop-blur-sm flex-shrink-0">
          <div className="space-y-4">
            <div className="relative group">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your note here... (Ctrl+Enter to send)"
                className="w-full px-4 py-3.5 pl-12 pr-4 border border-slate-300 rounded-2xl 
                  placeholder-slate-400 shadow-sm transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                  hover:border-slate-400 bg-white/50 text-slate-900
                  disabled:bg-slate-50 disabled:cursor-not-allowed
                  group-hover:shadow-md resize-none"
                rows={3}
              />
              <div className="absolute left-4 top-4 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                <MessageSquare className="w-4 h-4 text-cyan-600" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-sm text-slate-500 flex items-center gap-2 order-2 sm:order-1">
                <span>Press Ctrl+Enter to send quickly</span>
              </p>
              <div className="flex items-center gap-3 order-1 sm:order-2 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="px-4 sm:px-6 py-2.5 text-slate-600 hover:text-slate-800 font-semibold transition-all duration-200 hover:bg-slate-100 rounded-xl flex-1 sm:flex-none text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addingNote}
                  className="px-4 sm:px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-cyan-500/25
                    bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700
                    transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                    disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2 text-white relative overflow-hidden group flex-1 sm:flex-none"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  {addingNote ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-semibold">Adding...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span className="font-semibold">Add Note</span>
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

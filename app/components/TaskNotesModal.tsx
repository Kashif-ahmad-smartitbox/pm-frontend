import { useState, useEffect, useRef, useCallback } from "react";
import { createNote, getNotes, deleteNote, updateNote } from "@/lib/api/tasks";
import {
  X,
  MessageSquare,
  Send,
  Navigation,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  File as FileIcon,
  Mic,
  VideoIcon,
  Plus,
  MapPin,
  Edit2,
  Trash2,
  Check,
  X as XIcon,
  Shield,
} from "lucide-react";
import {
  DesktopHeader,
  MobileHeader,
  ActionMenu,
  MediaPreviewModal,
  VideoRecordingModal,
  VoiceRecordingControls,
} from "./chat";

// Types
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type RecordingType = "audio" | "video" | null;
export type RecordingState = "idle" | "recording" | "paused" | "stopped";

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  color?: string | null;
}

export interface Attachment {
  url: string;
  fileName?: string;
  fileType?: string;
  publicId?: string;
  mimeType?: string;
  size?: number;
  resourceType?: string;
}

export interface Note {
  _id: string;
  author: User;
  text: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  attachments?: Attachment[];
  location?: {
    lat: number;
    lng: number;
    address?: string | null;
  } | null;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: any;
  assignees: User[];
  createdBy: User;
  status: TaskStatus;
  dueDate?: string;
  priority?: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export interface LocationState {
  lat?: string;
  lng?: string;
  address?: string;
  isGettingLocation?: boolean;
}

export interface RecordingStateData {
  state: RecordingState;
  type: RecordingType;
  stream: MediaStream | null;
  recorder: MediaRecorder | null;
  chunks: Blob[];
  duration: number;
  url: string | null;
  blob: Blob | null;
}

// Constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const POLLING_INTERVAL = 10000;
export const MAX_RECORDING_DURATION = 3000;

const FILE_ICONS = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  pdf: FileText,
  default: FileIcon,
};

// Custom hooks
const useModal = (isOpen: boolean, onClose: () => void) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);
};

const useAutoResizeTextarea = (value: string) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [value]);

  return textareaRef;
};

const useNotesPolling = (taskId: string | undefined, isOpen: boolean) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!taskId || !isOpen) return;

    try {
      const response = await getNotes(taskId);
      const notesData = (response as any)?.notes ?? [];

      // Filter out deleted notes
      const activeNotes = notesData.filter((note: Note) => !note.isDeleted);
      setNotes(activeNotes);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      setError("Failed to load messages");
    }
  }, [taskId, isOpen]);

  useEffect(() => {
    if (isOpen && taskId) {
      setLoading(true);
      fetchNotes().finally(() => setLoading(false));

      // Start polling
      pollingRef.current = setInterval(fetchNotes, POLLING_INTERVAL);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isOpen, taskId, fetchNotes]);

  const manualRefresh = useCallback(async () => {
    if (!taskId || !isOpen) return;

    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  }, [taskId, isOpen, fetchNotes]);

  return {
    notes,
    loading,
    refreshing,
    error,
    manualRefresh,
    stopPolling: () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    },
    startPolling: () => {
      if (!pollingRef.current && taskId && isOpen) {
        pollingRef.current = setInterval(fetchNotes, POLLING_INTERVAL);
      }
    },
  };
};

const useMediaRecorder = () => {
  const [recording, setRecording] = useState<RecordingStateData>({
    state: "idle",
    type: null,
    stream: null,
    recorder: null,
    chunks: [],
    duration: 0,
    url: null,
    blob: null,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }

    recorderRef.current = null;
    startTimeRef.current = 0;
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
    cleanup();
  }, [cleanup]);

  const startRecording = useCallback(
    async (type: "audio" | "video") => {
      try {
        const constraints =
          type === "video" ? { video: true, audio: true } : { audio: true };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        streamRef.current = stream;
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, {
            type: type === "video" ? "video/mp4" : "audio/wav",
          });
          const url = URL.createObjectURL(blob);

          setRecording((prev) => ({
            ...prev,
            url,
            chunks,
            blob,
            state: "stopped",
          }));
        };

        recorder.start(1000);
        startTimeRef.current = Date.now();

        setRecording({
          state: "recording",
          type,
          stream,
          recorder,
          chunks,
          duration: 0,
          url: null,
          blob: null,
        });

        timerRef.current = setInterval(() => {
          const currentTime = Date.now();
          const elapsed = currentTime - startTimeRef.current;

          setRecording((prev) => {
            if (prev.state === "recording") {
              return { ...prev, duration: elapsed };
            }
            return prev;
          });

          if (elapsed >= MAX_RECORDING_DURATION) {
            stopRecording();
          }
        }, 100);
      } catch (error) {
        console.error("Error starting recording:", error);
        alert(`Could not access ${type} recording. Please check permissions.`);
        cleanup();
      }
    },
    [cleanup, stopRecording]
  );

  const cancelRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
    }

    cleanup();

    if (recording.url) {
      URL.revokeObjectURL(recording.url);
    }

    setRecording({
      state: "idle",
      type: null,
      stream: null,
      recorder: null,
      chunks: [],
      duration: 0,
      url: null,
      blob: null,
    });
  }, [cleanup, recording.url]);

  const getRecordingFile = useCallback(() => {
    if (!recording.blob) {
      return null;
    }

    const fileExtension = recording.type === "video" ? "mp4" : "wav";
    const fileName = `recording-${new Date().toISOString()}.${fileExtension}`;

    return new File([recording.blob], fileName, {
      type: recording.blob.type,
    });
  }, [recording.blob, recording.type]);

  useEffect(() => {
    return () => {
      cleanup();
      if (recording.url) {
        URL.revokeObjectURL(recording.url);
      }
    };
  }, [cleanup, recording.url]);

  return {
    recording,
    startRecording,
    stopRecording,
    cancelRecording,
    getRecordingFile,
  };
};

// Utility functions
export const getFileIcon = (fileType?: string) => {
  if (!fileType) return FILE_ICONS.default;
  if (fileType.startsWith("image/")) return FILE_ICONS.image;
  if (fileType.startsWith("video/")) return FILE_ICONS.video;
  if (fileType.startsWith("audio/")) return FILE_ICONS.audio;
  if (fileType === "application/pdf") return FILE_ICONS.pdf;
  return FILE_ICONS.default;
};

export const isImageFile = (fileType?: string) => {
  return fileType?.startsWith("image/") || false;
};

export const isVideoFile = (fileType?: string) => {
  return fileType?.startsWith("video/") || false;
};

export const isAudioFile = (fileType?: string) => {
  return fileType?.startsWith("audio/") || false;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileTypeDisplay = (fileType?: string): string => {
  if (!fileType) return "File";
  if (fileType.startsWith("image/")) return "Image";
  if (fileType.startsWith("video/")) return "Video";
  if (fileType.startsWith("audio/")) return "Audio";
  if (fileType === "application/pdf") return "PDF";
  return fileType.split("/")[1] || fileType;
};

export const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    new Date(now.setDate(now.getDate() - 1)).toDateString() ===
    date.toDateString();

  if (isToday) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (isYesterday) {
    return `Yesterday at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

export const formatDuration = (milliseconds: number): string => {
  if (isNaN(milliseconds) || milliseconds < 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const getAuthorInitial = (author?: User) => {
  if (!author?.name) return "?";
  return author.name.charAt(0).toUpperCase();
};

export const getContrastColor = (hexColor?: string | null) => {
  if (!hexColor || !/^#([0-9A-Fa-f]{6})$/.test(hexColor)) return "#0E3554";
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

export const formatDateDivider = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
};

// Helper component for date dividers
const DateDivider: React.FC<{ date: string }> = ({ date }) => {
  const formattedDate = formatDateDivider(date);

  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex-1 h-px bg-gray-300"></div>
      <span className="mx-3 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
        {formattedDate}
      </span>
      <div className="flex-1 h-px bg-gray-300"></div>
    </div>
  );
};

interface MessageActionsProps {
  note: Note;
  isCurrentUserMessage: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  isEditing: boolean;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  note,
  isCurrentUserMessage,
  isAdmin,
  onEdit,
  onDelete,
  isDeleting,
  isEditing,
}) => {
  // ONLY ADMIN CAN DELETE ANY MESSAGE
  // Regular users CANNOT delete ANY messages (not even their own)
  const showEditButton = isCurrentUserMessage && !isEditing;
  const showDeleteButton = isAdmin; // Only admin can delete

  if (!showEditButton && !showDeleteButton) return null;

  return (
    <div className="absolute -top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {showEditButton && (
        <button
          onClick={onEdit}
          className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          title="Edit message"
        >
          <Edit2 className="w-3 h-3 text-gray-700" />
        </button>
      )}
      {showDeleteButton && (
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className={`w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center transition-colors shadow-sm group hover:bg-blue-50 hover:border-blue-300`}
          title="Admin: Delete message"
        >
          {isDeleting ? (
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3 text-blue-600" />
          )}
        </button>
      )}
    </div>
  );
};

// Helper component for attachment preview
interface AttachmentPreviewProps {
  attachment: Attachment;
  isCurrentUserMessage: boolean;
  onPreview: (url: string, fileName?: string, fileType?: string) => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  isCurrentUserMessage,
  onPreview,
}) => {
  const mime = attachment.fileType || attachment.mimeType || "";
  const extension = attachment.fileName?.split(".").pop()?.toLowerCase();
  const resourceType = attachment.resourceType;

  // File type detection
  const isPdf = mime === "application/pdf" || extension === "pdf";
  const audioExtensions = [
    "mp3",
    "wav",
    "aac",
    "m4a",
    "ogg",
    "oga",
    "flac",
    "opus",
  ];
  const isAudio =
    mime.startsWith("audio/") ||
    audioExtensions.includes(extension || "") ||
    resourceType === "audio";
  const isVideo = !isAudio && (isVideoFile(mime) || resourceType === "video");
  const isImage =
    !isPdf &&
    (isImageFile(mime) ||
      resourceType === "image" ||
      ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(
        extension || ""
      ));

  const IconComponent = getFileIcon(mime);
  const displayType =
    getFileTypeDisplay(mime) || (extension ? extension.toUpperCase() : "File");

  // Image preview
  if (isImage) {
    return (
      <div className="rounded-lg overflow-hidden">
        <button
          onClick={() => onPreview(attachment.url, attachment.fileName, mime)}
          className="w-full text-left"
        >
          <div className="relative group">
            <img
              src={attachment.url}
              alt="Image"
              className="w-full h-auto max-h-52 md:max-h-72 object-cover rounded-lg"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
            <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] md:text-xs px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              Tap to view
            </div>
          </div>
        </button>
        {attachment.size && (
          <div className="text-[10px] md:text-xs text-gray-500 mt-0.5 text-center">
            {formatFileSize(attachment.size)}
          </div>
        )}
      </div>
    );
  }

  // Video preview
  if (isVideo) {
    return (
      <div
        className={`rounded-xl border p-2.5 md:p-3 space-y-1.5 transition-all duration-200 ${
          isCurrentUserMessage
            ? "bg-white/70 border-emerald-200"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              isCurrentUserMessage ? "bg-emerald-50" : "bg-indigo-50"
            }`}
          >
            <Video className="w-4 h-4 md:w-5 md:h-5 text-gray-800" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] md:text-sm font-semibold text-gray-900 truncate">
                {displayType || "Video"}
              </span>
              <button
                onClick={() =>
                  onPreview(attachment.url, attachment.fileName, mime)
                }
                className="text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors"
              >
                Open
              </button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {attachment.size && (
                <span className="text-[10px] md:text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </span>
              )}
              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] md:text-xs text-blue-600 hover:text-blue-800 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Open in new tab
              </a>
            </div>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden bg-black">
          <video
            src={attachment.url}
            controls
            className="w-full max-h-40 md:max-h-52 rounded-lg"
          />
        </div>
      </div>
    );
  }

  // Audio preview
  if (isAudio) {
    return (
      <div
        className={`rounded-xl border p-2 md:p-2.5 space-y-1.5 transition-all duration-200 ${
          isCurrentUserMessage
            ? "bg-emerald-50/60 border-emerald-200"
            : "bg-sky-50/70 border-sky-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.03)]">
            <Music className="w-3.5 h-3.5 text-gray-800" />
            <span className="text-[10px] font-semibold text-gray-900">
              Audio
            </span>
          </div>
          {attachment.size && (
            <span className="text-[10px] text-gray-500 truncate">
              {formatFileSize(attachment.size)}
            </span>
          )}
          <button
            onClick={() => onPreview(attachment.url, attachment.fileName, mime)}
            className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-200 text-gray-700 hover:bg-white transition-colors"
          >
            Open
          </button>
        </div>
        <div className="rounded-lg overflow-hidden bg-white/80 px-1.5 py-1">
          <audio src={attachment.url} controls className="w-full" />
        </div>
      </div>
    );
  }

  // Other files (PDF, docs, etc.)
  return (
    <div
      className={`flex items-center gap-2 md:gap-3 p-1.5 md:p-2.5 rounded-xl border transition-all duration-200 ${
        isCurrentUserMessage
          ? "bg-white/70 border-emerald-200"
          : "bg-white/80 border-gray-200"
      }`}
    >
      <div
        className={`p-1.5 rounded-lg shrink-0 ${
          isCurrentUserMessage ? "bg-emerald-50" : "bg-indigo-50"
        }`}
      >
        <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-gray-800" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] md:text-sm font-semibold text-gray-900 truncate">
            {displayType}
          </span>
          <button
            onClick={() => onPreview(attachment.url, attachment.fileName, mime)}
            className="ml-auto text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View
          </button>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {attachment.size && (
            <span className="text-[10px] md:text-xs text-gray-500">
              {formatFileSize(attachment.size)}
            </span>
          )}
          <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] md:text-xs text-blue-600 hover:text-blue-800 font-medium truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {attachment.fileName || "Open in new tab"}
          </a>
        </div>
      </div>
    </div>
  );
};

export const formatUserRole = (role?: string): string => {
  if (!role) return "";

  const roleMap: Record<string, string> = {
    admin: "Administrator",
    team_member: "Team Member",
    project_manager: "Project Manager",
  };

  return (
    roleMap[role.toLowerCase()] || role.charAt(0).toUpperCase() + role.slice(1)
  );
};

interface TaskNotesModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onNoteAdded?: (newNote: Note) => void;
  onNoteUpdated?: (updatedNote: Note) => void;
  onNoteDeleted?: (deletedNoteId: string) => void;
  currentUser: User;
  isAdmin?: boolean;
}

const TaskNotesModal: React.FC<TaskNotesModalProps> = ({
  task,
  isOpen,
  onClose,
  onNoteAdded,
  onNoteUpdated,
  onNoteDeleted,
  currentUser,
  isAdmin = false,
}) => {
  // State
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<LocationState>({});
  const [mediaPreview, setMediaPreview] = useState<{
    isOpen: boolean;
    mediaUrl: string;
    fileName?: string;
    fileType?: string;
  }>({
    isOpen: false,
    mediaUrl: "",
    fileName: "",
    fileType: "",
  });
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showVideoRecording, setShowVideoRecording] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useAutoResizeTextarea(newNote);
  const lastNoteCountRef = useRef<number>(0);
  const isInitialMountRef = useRef(true);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [videoModalKey, setVideoModalKey] = useState(0);

  // Custom hooks
  const {
    notes,
    loading,
    refreshing,
    error,
    manualRefresh,
    stopPolling,
    startPolling,
  } = useNotesPolling(task?._id, isOpen);

  const {
    recording,
    startRecording,
    stopRecording,
    cancelRecording,
    getRecordingFile,
  } = useMediaRecorder();

  useModal(isOpen, onClose);

  // Helper functions
  const isCurrentUser = (author?: User) => author?._id === currentUser?._id;

  const getUserAvatar = (author?: User) => {
    const initials = getAuthorInitial(author);
    const backgroundColor = author?.color || "rgb(239, 255, 250)";
    const textColor = getContrastColor(author?.color ?? undefined);

    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 border-2 border-white shadow-sm"
        style={{
          backgroundColor,
          color: textColor,
        }}
      >
        {initials}
      </div>
    );
  };

  const openLocationInMaps = (lat: number, lng: number) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
  };

  const openMediaPreview = (
    mediaUrl: string,
    fileName?: string,
    fileType?: string
  ) => {
    setMediaPreview({
      isOpen: true,
      mediaUrl,
      fileName,
      fileType,
    });
  };

  const closeMediaPreview = () => {
    setMediaPreview({
      isOpen: false,
      mediaUrl: "",
      fileName: "",
      fileType: "",
    });
  };

  // Group notes by date for dividers
  const groupedNotes = useCallback(() => {
    const groups: { date: string; notes: Note[] }[] = [];

    notes.forEach((note) => {
      const noteDate = new Date(note.createdAt).toDateString();
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup.date === noteDate) {
        lastGroup.notes.push(note);
      } else {
        groups.push({
          date: noteDate,
          notes: [note],
        });
      }
    });

    return groups;
  }, [notes]);

  // Scroll handling
  const scrollToBottom = useCallback(() => {
    if (isNearBottom && !userHasScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowScrollButton(false);
    }
  }, [isNearBottom, userHasScrolled]);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const element = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = element;

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 100;

    setIsNearBottom(nearBottom);
    setShowScrollButton(!nearBottom && distanceFromBottom > 100);

    if (distanceFromBottom > 200) {
      setUserHasScrolled(true);
    }

    if (nearBottom) {
      setUserHasScrolled(false);
    }
  }, []);

  // Auto scroll effect
  useEffect(() => {
    if (isInitialMountRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      isInitialMountRef.current = false;
      return;
    }

    const currentNoteCount = notes.length;
    const hasNewMessages = currentNoteCount > lastNoteCountRef.current;

    if (hasNewMessages) {
      const latestNote = notes[notes.length - 1];
      const isCurrentUserMessage = latestNote?.author?._id === currentUser?._id;

      if (isCurrentUserMessage) {
        scrollToBottom();
      } else if (isNearBottom) {
        scrollToBottom();
      }
    }

    lastNoteCountRef.current = currentNoteCount;
  }, [notes, currentUser, scrollToBottom, isNearBottom]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const element = messagesContainerRef.current;
      element.addEventListener("scroll", handleScroll);
      return () => element.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Recording effects
  useEffect(() => {
    if (
      recording.state === "stopped" &&
      recording.url &&
      recording.type === "audio"
    ) {
      const recordingFile = getRecordingFile();
      if (recordingFile) {
        setSelectedFiles((prev) => [...prev, recordingFile]);
      }
    }
  }, [recording.state, recording.url, recording.type, getRecordingFile]);

  useEffect(() => {
    if (recording.state === "recording") {
      setShowActionMenu(false);
    }
  }, [recording.state]);

  // File handling
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    fileArray.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name} (${formatFileSize(file.size)})`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      alert(
        `The following files exceed ${formatFileSize(
          MAX_FILE_SIZE
        )}:\n${invalidFiles.join("\n")}`
      );
    }

    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 6));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Location handling
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocation((prev) => ({ ...prev, isGettingLocation: true }));

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      const { latitude, longitude } = position.coords;
      let address = "";

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();
        address = data.city || data.locality || data.principalSubdivision || "";
      } catch (error) {
        console.warn("Could not fetch address:", error);
      }

      setLocation({
        lat: latitude.toFixed(6),
        lng: longitude.toFixed(6),
        address,
        isGettingLocation: false,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      alert(
        "Could not get your current location. Please check location permissions."
      );
      setLocation((prev) => ({ ...prev, isGettingLocation: false }));
    }
  }, []);

  const clearLocation = () => setLocation({});

  // Recording handlers
  const handleStartVoiceRecording = () => {
    setShowActionMenu(false);
    startRecording("audio");
  };

  const handleStartVideoRecording = () => {
    setShowActionMenu(false);
    setVideoModalKey((prev) => prev + 1);
    setShowVideoRecording(true);
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleCancelRecording = () => {
    cancelRecording();
  };

  const handleVideoRecordingComplete = (file: File) => {
    setSelectedFiles((prev) => [...prev, file]);
    setShowVideoRecording(false);
  };

  // Note CRUD operations
  const handleAddNote = async () => {
    if (
      !newNote.trim() &&
      selectedFiles.length === 0 &&
      !(location.lat && location.lng)
    ) {
      return;
    }

    if (!task?._id) return;
    setAddingNote(true);

    try {
      const fd = new FormData();
      fd.append("text", newNote.trim());

      selectedFiles.forEach((f) => {
        fd.append("files", f);
      });

      if (location.lat && location.lng) {
        const locPayload = {
          lat: Number(location.lat),
          lng: Number(location.lng),
          address: location.address ?? null,
        };
        fd.append("location", JSON.stringify(locPayload));
      }

      const added = await createNote(task._id, fd);
      const newCreatedNote: Note =
        (added as any)?.note ?? (added as any) ?? null;

      if (onNoteAdded && newCreatedNote) {
        onNoteAdded(newCreatedNote);
      }

      setNewNote("");
      setSelectedFiles([]);
      setLocation({});

      stopPolling();
      await manualRefresh();
      startPolling();

      setUserHasScrolled(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowScrollButton(false);
      }, 100);

      setTimeout(() => {
        textareaRef.current?.focus();
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }, 80);
    } catch (err) {
      console.error("Failed to add note:", err);
      alert("Failed to add note. Please try again.");
    } finally {
      setAddingNote(false);
    }
  };

  const startEditingNote = (note: Note) => {
    const createdAt = new Date(note.createdAt);
    const now = new Date();
    const timeDiff = now.getTime() - createdAt.getTime();
    const twoMinutes = 2 * 60 * 1000;

    if (timeDiff > twoMinutes) {
      alert("You can only edit messages within 2 minutes of posting.");
      return;
    }

    setEditingNoteId(note._id);
    setEditingText(note.text);
    setTimeout(() => {
      editTextareaRef.current?.focus();
      editTextareaRef.current?.select();
    }, 10);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingText("");
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!task?._id || !editingText.trim()) return;

    try {
      const updatedNote = await updateNote(task._id, noteId, {
        text: editingText.trim(),
      });

      if (onNoteUpdated) {
        onNoteUpdated(updatedNote as Note);
      }

      stopPolling();
      await manualRefresh();
      startPolling();

      setEditingNoteId(null);
      setEditingText("");
    } catch (err) {
      console.error("Failed to update note:", err);
      alert("Failed to update message. Please try again.");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!task?._id) return;

    const isAdminDelete = isAdmin && deletingNoteId !== noteId;
    const confirmMessage = isAdminDelete
      ? "Are you sure you want to delete this message? (Admin action)"
      : "Are you sure you want to delete this message?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeletingNoteId(noteId);

    try {
      await deleteNote(task._id, noteId);

      if (onNoteDeleted) {
        onNoteDeleted(noteId);
      }

      stopPolling();
      await manualRefresh();
      startPolling();
    } catch (err) {
      console.error("Failed to delete note:", err);
      alert("Failed to delete message. Please try again.");
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
    setIsNearBottom(true);
    setUserHasScrolled(false);
  };

  const handleManualRefresh = async () => {
    stopPolling();
    await manualRefresh();
    startPolling();
  };

  if (!isOpen) return null;

  const notesCount = notes?.length ?? 0;

  return (
    <>
      {/* Main Modal - Full Screen */}
      <div className="fixed inset-0 bg-white flex flex-col z-50 safe-area">
        {/* Responsive Header */}
        <div className="md:hidden">
          <MobileHeader
            task={task}
            onClose={onClose}
            onRefresh={handleManualRefresh}
            loading={refreshing}
            notesCount={notesCount}
          />
        </div>
        <div className="hidden md:block">
          <DesktopHeader
            task={task}
            onClose={onClose}
            onRefresh={handleManualRefresh}
            loading={refreshing}
            notesCount={notesCount}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50/50">
          {/* Error Display */}
          {error && (
            <div className="flex items-center justify-between p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
              <span className="text-xs md:text-sm">{error}</span>
              <button
                onClick={handleManualRefresh}
                className="text-red-800 font-medium underline text-xs md:text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* Initial Loading State */}
          {loading && !refreshing && notes.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#0E3554] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Loading messages...</p>
              </div>
            </div>
          )}

          {/* Messages Container */}
          {(!loading || notes.length > 0) && (
            <div
              ref={messagesContainerRef}
              className="flex-1 p-3 md:p-6 overflow-y-auto safe-area-bottom relative"
            >
              {!notes || notes.length === 0 ? (
                <div className="text-center py-8 md:py-16 space-y-4 md:space-y-6">
                  <div className="w-12 h-12 md:w-20 md:h-20 bg-white rounded-xl md:rounded-2xl flex items-center justify-center mx-auto border border-gray-200 shadow-sm">
                    <MessageSquare className="w-6 h-6 md:w-10 md:h-10 text-gray-400" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <p className="text-gray-900 font-semibold text-base md:text-xl">
                      No messages yet
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm max-w-md mx-auto leading-relaxed px-4">
                      Start the conversation by sending the first message.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-8">
                  {groupedNotes().map((group, groupIndex) => (
                    <div key={group.date}>
                      {groupIndex > 0 && (
                        <DateDivider date={group.notes[0].createdAt} />
                      )}
                      {group.notes.map((note, index) => {
                        const isCurrentUserMessage = isCurrentUser(note.author);
                        const isDeleted = note.isDeleted;
                        const prev = group.notes[index - 1];
                        const showHeader =
                          index === 0 ||
                          !prev ||
                          prev.author._id !== note.author._id ||
                          new Date(note.createdAt).getTime() -
                            new Date(prev.createdAt).getTime() >
                            300000;

                        if (isDeleted) {
                          return (
                            <div key={note._id} className="flex justify-center">
                              <div className="px-4 py-2 bg-gray-100 rounded-full text-xs text-gray-500 italic">
                                Message deleted
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={note._id}
                            className={`flex gap-2 md:gap-3 group ${
                              isCurrentUserMessage
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {!isCurrentUserMessage && (
                              <div className="shrink-0 self-start">
                                {getUserAvatar(note.author)}
                              </div>
                            )}

                            <div
                              className={`flex flex-col ${
                                isCurrentUserMessage
                                  ? "items-end"
                                  : "items-start"
                              } max-w-[85%] md:max-w-[75%]`}
                            >
                              {showHeader && !isCurrentUserMessage && (
                                <div className="flex flex-col mb-1 px-1">
                                  <div className="flex items-center gap-1 md:gap-2">
                                    <span className="font-semibold text-gray-900 text-xs md:text-sm">
                                      {note.author?.name ?? "Unknown"}
                                    </span>
                                    {note.author?.role && (
                                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                                        {formatUserRole(note.author.role)}
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-400 hidden md:inline">
                                      {formatMessageTime(note.createdAt)}
                                    </span>
                                  </div>
                                  {/* For mobile: show timestamp below if needed */}
                                  <span className="text-xs text-gray-400 md:hidden mt-0.5">
                                    {formatMessageTime(note.createdAt)}
                                  </span>
                                </div>
                              )}

                              <div className="flex gap-1 md:gap-2 items-start w-full">
                                {isCurrentUserMessage && (
                                  <span className="text-xs text-gray-400 mt-1 md:mt-2 shrink-0 min-w-[45px] md:min-w-[60px] text-right hidden md:block">
                                    {formatMessageTime(note.createdAt)}
                                  </span>
                                )}

                                <div
                                  className={`relative rounded-xl md:rounded-2xl p-3 md:p-4 transition-all duration-200 flex-1 mb-1 group ${
                                    isCurrentUserMessage
                                      ? "bg-[#86c785] text-white rounded-br-md"
                                      : "bg-[#fbf5ad] border border-gray-200 rounded-bl-md"
                                  }`}
                                >
                                  {/* Edit Mode */}
                                  {editingNoteId === note._id ? (
                                    <div className="space-y-2">
                                      <textarea
                                        ref={editTextareaRef}
                                        value={editingText}
                                        onChange={(e) =>
                                          setEditingText(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            !e.shiftKey
                                          ) {
                                            e.preventDefault();
                                            handleUpdateNote(note._id);
                                          }
                                          if (e.key === "Escape") {
                                            cancelEditingNote();
                                          }
                                        }}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E3554] text-gray-900 bg-white resize-none"
                                        rows={3}
                                        autoFocus
                                      />
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">
                                          You can edit within 2 minutes of
                                          posting
                                        </span>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={cancelEditingNote}
                                            className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                                          >
                                            <XIcon className="w-3 h-3" />
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleUpdateNote(note._id)
                                            }
                                            disabled={!editingText.trim()}
                                            className="px-3 py-1 text-sm bg-[#0E3554] text-white rounded-lg hover:bg-[#0A2A42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                          >
                                            <Check className="w-3 h-3" />
                                            Update
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      {note.text && (
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2 md:mb-3 wrap-break-word">
                                          {note.text}
                                        </p>
                                      )}

                                      {note.attachments &&
                                        note.attachments.length > 0 && (
                                          <div className="space-y-2 md:space-y-3">
                                            {note.attachments.map(
                                              (attachment, i) => (
                                                <AttachmentPreview
                                                  key={i}
                                                  attachment={attachment}
                                                  isCurrentUserMessage={
                                                    isCurrentUserMessage
                                                  }
                                                  onPreview={openMediaPreview}
                                                />
                                              )
                                            )}
                                          </div>
                                        )}

                                      {/* Location */}
                                      {note.location && (
                                        <div className="mt-2 pt-2 border-t border-white/20">
                                          <button
                                            onClick={() =>
                                              openLocationInMaps(
                                                note.location!.lat,
                                                note.location!.lng
                                              )
                                            }
                                            className="flex items-center gap-1 md:gap-2 text-xs hover:opacity-80 transition-opacity w-full text-left"
                                          >
                                            <MapPin className="w-3 h-3 shrink-0" />
                                            <span className="truncate flex-1 text-xs">
                                              {note.location.address ||
                                                `Location: ${note.location.lat.toFixed(
                                                  4
                                                )}, ${note.location.lng.toFixed(
                                                  4
                                                )}`}
                                            </span>
                                            <Navigation className="w-3 h-3 shrink-0" />
                                          </button>
                                        </div>
                                      )}

                                      <MessageActions
                                        note={note}
                                        isCurrentUserMessage={
                                          isCurrentUserMessage
                                        }
                                        isAdmin={isAdmin}
                                        onEdit={() => startEditingNote(note)}
                                        onDelete={() =>
                                          handleDeleteNote(note._id)
                                        }
                                        isDeleting={deletingNoteId === note._id}
                                        isEditing={editingNoteId === note._id}
                                      />
                                    </>
                                  )}
                                </div>

                                {!isCurrentUserMessage && (
                                  <span className="text-xs text-gray-400 mt-1 md:mt-2 shrink-0 min-w-[45px] md:min-w-[60px] hidden md:block">
                                    {formatMessageTime(note.createdAt)}
                                  </span>
                                )}
                              </div>

                              {/* Mobile timestamp below message */}
                              <span className="text-xs text-gray-400 mt-1 px-1 md:hidden">
                                {formatMessageTime(note.createdAt)}
                              </span>
                            </div>

                            {isCurrentUserMessage && (
                              <div className="shrink-0 self-start">
                                {getUserAvatar(note.author)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Scroll to bottom button */}
              {showScrollButton && (
                <button
                  onClick={handleScrollToBottom}
                  className="sticky bottom-4 left-1/2 transform -translate-x-1/2 bg-[#0E3554] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#0A2A42] transition-colors flex items-center gap-2 text-sm z-10"
                >
                  <Navigation className="w-4 h-4 rotate-90" />
                  Scroll to latest
                </button>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-3 md:p-4 bg-white shrink-0 safe-area-bottom">
          <div className="space-y-2 md:space-y-3">
            {/* Voice Recording Controls */}
            {recording.state === "recording" && recording.type === "audio" && (
              <VoiceRecordingControls
                recording={recording}
                onStop={handleStopRecording}
                onCancel={handleCancelRecording}
              />
            )}

            {/* Location Input */}
            {(location.lat || location.isGettingLocation) && (
              <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs md:text-sm text-blue-900 font-medium truncate">
                    {location.address || "Current location"}
                  </div>
                  <div className="text-xs text-blue-700 truncate">
                    {location.lat}, {location.lng}
                  </div>
                </div>
                <button
                  onClick={clearLocation}
                  className="text-blue-600 hover:text-blue-800 p-0.5 md:p-1 rounded transition-colors"
                  title="Remove location"
                >
                  <X className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            )}

            {/* File Attachments */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200">
                {selectedFiles.map((file, index) => {
                  const IconComponent = getFileIcon(file.type);
                  const isImage = isImageFile(file.type);
                  const isVideo = isVideoFile(file.type);
                  const isAudio = isAudioFile(file.type);

                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-1 bg-white px-2 py-1.5 md:px-3 md:py-2 rounded-lg border border-gray-300 text-xs md:text-sm max-w-[220px] md:max-w-[260px] transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-1 md:gap-2">
                        {isImage ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-5 h-5 md:w-6 md:h-6 rounded object-cover"
                          />
                        ) : isVideo ? (
                          <VideoIcon className="w-3 h-3 md:w-4 md:h-4 text-gray-500 shrink-0" />
                        ) : isAudio ? (
                          <Mic className="w-3 h-3 md:w-4 md:h-4 text-gray-500 shrink-0" />
                        ) : (
                          <IconComponent className="w-3 h-3 md:w-4 md:h-4 text-gray-500 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-900 truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeSelectedFile(index)}
                          className="text-gray-400 hover:text-red-500 p-0.5 md:p-1 rounded transition-colors shrink-0"
                        >
                          <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </button>
                      </div>

                      {(isVideo || isAudio) && (
                        <div className="mt-1 rounded overflow-hidden">
                          {isVideo ? (
                            <video
                              src={URL.createObjectURL(file)}
                              controls
                              className="w-full max-h-40 rounded bg-black"
                            />
                          ) : (
                            <audio
                              src={URL.createObjectURL(file)}
                              controls
                              className="w-full"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Input Row */}
            <div className="flex items-end gap-2 md:gap-3 w-full">
              {/* Action Menu Button */}
              <div className="relative shrink-0 self-center">
                <button
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  disabled={recording.state === "recording"}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:border-gray-400 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="More actions"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                </button>

                <ActionMenu
                  isOpen={showActionMenu}
                  onClose={() => setShowActionMenu(false)}
                  onStartVoiceRecording={handleStartVoiceRecording}
                  onStartVideoRecording={handleStartVideoRecording}
                  onAttachFiles={() => fileInputRef.current?.click()}
                  onShareLocation={getCurrentLocation}
                />
              </div>

              <textarea
                ref={textareaRef}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
                placeholder="Type your message... (Enter to send)"
                className="flex-1 px-3 py-2.5 md:px-4 md:py-3 text-sm border border-gray-300 rounded-xl placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#0E3554] focus:border-transparent hover:border-gray-400 bg-white text-gray-900 disabled:bg-gray-100 resize-none"
                rows={1}
                style={{
                  minHeight: "40px",
                  maxHeight: "100px",
                  lineHeight: "1.5",
                }}
              />

              <button
                onClick={handleAddNote}
                disabled={
                  addingNote ||
                  (!newNote.trim() &&
                    selectedFiles.length === 0 &&
                    !(location.lat && location.lng))
                }
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-[#0E3554] hover:bg-[#0A2A42] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 text-white shadow-sm self-center"
                title="Send message"
              >
                {addingNote ? (
                  <div className="w-3 h-3 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFilesChange}
                accept="*/*"
              />
            </div>

            {/* Helper Text */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-3 text-xs text-gray-500 pt-1">
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <span className="text-xs">
                  Enter to send • Shift+Enter for new line
                </span>
                {selectedFiles.length > 0 && (
                  <span className="text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-xs">
                    {selectedFiles.length} file
                    {selectedFiles.length > 1 ? "s" : ""} attached
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <VideoRecordingModal
        key={videoModalKey}
        isOpen={showVideoRecording}
        onClose={() => setShowVideoRecording(false)}
        onRecordingComplete={handleVideoRecordingComplete}
      />

      <MediaPreviewModal
        mediaUrl={mediaPreview.mediaUrl}
        fileName={mediaPreview.fileName}
        fileType={mediaPreview.fileType}
        isOpen={mediaPreview.isOpen}
        onClose={closeMediaPreview}
      />
    </>
  );
};

export default TaskNotesModal;

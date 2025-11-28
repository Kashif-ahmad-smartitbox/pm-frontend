import { useState, useEffect, useRef, useCallback } from "react";
import { createNote, getNotes } from "@/lib/api/tasks";
import {
  X,
  MessageSquare,
  Send,
  User,
  Paperclip,
  MapPin,
  RefreshCw,
  Download,
  Navigation,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  File,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Types (keeping the same types as before)
type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high" | "critical";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  color?: string | null;
}

interface Attachment {
  url: string;
  fileName?: string;
  fileType?: string;
  publicId?: string;
  mimeType?: string;
  size?: number;
  resourceType?: string;
}

interface Note {
  _id: string;
  author: User;
  text: string;
  createdAt: string;
  attachments?: Attachment[];
  location?: {
    lat: number;
    lng: number;
    address?: string | null;
  } | null;
}

interface Task {
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

interface LocationState {
  lat?: string;
  lng?: string;
  address?: string;
  isGettingLocation?: boolean;
}

interface ImagePreviewState {
  isOpen: boolean;
  imageUrl: string;
  fileName?: string;
}

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const POLLING_INTERVAL = 10000;
const FILE_ICONS = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  pdf: FileText,
  default: File,
};

// Custom hooks (keeping the same custom hooks)
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
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!taskId || !isOpen) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getNotes(taskId);
      const notesData = (response as any)?.notes ?? [];
      setNotes(notesData);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [taskId, isOpen]);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchNotes();
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
    await fetchNotes();
  }, [fetchNotes]);

  return { notes, loading, error, manualRefresh };
};

// Utility functions (keeping the same utility functions)
const getFileIcon = (fileType?: string) => {
  if (!fileType) return FILE_ICONS.default;
  if (fileType.startsWith("image/")) return FILE_ICONS.image;
  if (fileType.startsWith("video/")) return FILE_ICONS.video;
  if (fileType.startsWith("audio/")) return FILE_ICONS.audio;
  if (fileType === "application/pdf") return FILE_ICONS.pdf;
  return FILE_ICONS.default;
};

const isImageFile = (fileType?: string) => {
  return fileType?.startsWith("image/") || false;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileTypeDisplay = (fileType?: string): string => {
  if (!fileType) return "File";
  if (fileType.startsWith("image/")) return "Image";
  if (fileType.startsWith("video/")) return "Video";
  if (fileType.startsWith("audio/")) return "Audio";
  if (fileType === "application/pdf") return "PDF";
  return fileType.split("/")[1] || fileType;
};

const formatMessageTime = (dateString: string) => {
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

// Image Preview Component (updated colors)
const ImagePreviewModal = ({
  imageUrl,
  fileName,
  isOpen,
  onClose,
}: {
  imageUrl: string;
  fileName?: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === " ") {
          e.preventDefault();
          setIsZoomed(!isZoomed);
        }
      };
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [isOpen, isZoomed, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex flex-col">
        <div className="flex items-center justify-between p-4 bg-[#0E3554] text-white rounded-t-xl">
          <h3 className="text-lg font-semibold truncate flex-1 mr-4">
            {fileName || "Image Preview"}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={isZoomed ? "Fit to screen" : "Zoom to actual size"}
            >
              {isZoomed ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-black">
          <img
            src={imageUrl}
            alt={fileName || "Preview"}
            className={`${
              isZoomed
                ? "object-scale-down cursor-zoom-out"
                : "object-contain cursor-zoom-in"
            } transition-all duration-200 max-w-full max-h-full`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-[#0E3554] text-white rounded-b-xl">
          <a
            href={imageUrl}
            download={fileName}
            className="flex items-center gap-2 px-4 py-2 bg-[#1CC2B1] hover:bg-[#19AF9F] rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Chat Image Preview Component (updated colors)
const ChatImagePreview = ({
  imageUrl,
  fileName,
  onPreview,
  className = "",
}: {
  imageUrl: string;
  fileName?: string;
  onPreview: (url: string, fileName?: string) => void;
  className?: string;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`relative group cursor-pointer ${className}`}>
      <div className="relative rounded-lg overflow-hidden bg-[#EFFFFA]">
        <img
          src={imageUrl}
          alt={fileName || "Image"}
          className={`w-full h-32 object-cover transition-opacity duration-200 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onClick={() => onPreview(imageUrl, fileName)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#D9F3EE] border-t-[#1CC2B1] rounded-full animate-spin" />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-lg" />
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <Maximize2 className="w-3 h-3" />
          Preview
        </div>
      </div>
    </div>
  );
};

// Enhanced Attachment Component (updated colors)
const AttachmentPreview = ({
  attachment,
  noteAuthor,
  onImagePreview,
  isCurrentUserMessage,
}: {
  attachment: Attachment;
  noteAuthor?: User;
  onImagePreview: (url: string, fileName?: string) => void;
  isCurrentUserMessage: boolean;
}) => {
  const IconComponent = getFileIcon(attachment.fileType);
  const isImage = isImageFile(attachment.fileType);

  if (isImage) {
    return (
      <ChatImagePreview
        imageUrl={attachment.url}
        fileName={attachment.fileName}
        onPreview={onImagePreview}
        className="mt-2"
      />
    );
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-md mt-2 ${
        isCurrentUserMessage
          ? "bg-[#E0FFFA] border-[#1CC2B1] hover:border-[#0E3554]"
          : "bg-[#EFFFFA] border-[#D9F3EE] hover:border-[#1CC2B1]"
      }`}
    >
      <div className="flex-shrink-0">
        <IconComponent className="w-8 h-8 text-[#0E3554]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-[#0E3554] hover:text-[#1CC2B1] truncate flex items-center gap-1 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {attachment.fileName || "Attachment"}
          </a>
          <Download className="w-3 h-3 text-[#1CC2B1]" />
        </div>
        <div className="flex items-center gap-3 text-xs text-[#0E3554]">
          <span className="capitalize">
            {getFileTypeDisplay(attachment.fileType)}
          </span>
          {attachment.size && (
            <>
              <span>•</span>
              <span>{formatFileSize(attachment.size)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Mobile Responsive Header (updated design)
const MobileHeader = ({
  task,
  onClose,
  onRefresh,
  loading,
  notesCount,
}: {
  task: Task;
  onClose: () => void;
  onRefresh: () => void;
  loading: boolean;
  notesCount: number;
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white border-b border-[#D9F3EE] p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-[#0E3554] hover:text-red-600 hover:bg-[#EFFFFA] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#0E3554] truncate">
              {task?.title}
            </h2>
            <p className="text-[#1CC2B1] text-sm truncate">
              {notesCount} message{notesCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`p-2 text-[#0E3554] hover:text-[#1CC2B1] hover:bg-[#EFFFFA] rounded-xl transition-all ${
              loading ? "animate-spin" : ""
            }`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-[#0E3554] hover:text-[#1CC2B1] hover:bg-[#EFFFFA] rounded-xl transition-all"
          >
            {showDetails ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-[#D9F3EE]">
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1 bg-[#EFFFFA] px-2 py-1 rounded border border-[#D9F3EE]">
              <User className="w-3 h-3 text-[#1CC2B1]" />
              <span className="text-[#0E3554]">{task?.createdBy?.name}</span>
            </div>
            <div className="flex items-center gap-1 bg-[#EFFFFA] px-2 py-1 rounded border border-[#D9F3EE]">
              <span className="text-[#0E3554]">
                {task?.assignees?.length} members
              </span>
            </div>
            <div className="flex items-center gap-1 bg-[#EFFFFA] px-2 py-1 rounded border border-[#D9F3EE]">
              <div
                className={`w-2 h-2 rounded-full ${
                  task?.status === "done"
                    ? "bg-[#1CC2B1]"
                    : task?.status === "in_progress"
                    ? "bg-[#E6A93A]"
                    : "bg-[#0E3554]"
                }`}
              />
              <span className="capitalize text-[#0E3554]">
                {task?.status?.replace("_", " ")}
              </span>
            </div>
            {task?.priority && (
              <div className="flex items-center gap-1 bg-[#EFFFFA] px-2 py-1 rounded border border-[#D9F3EE]">
                <div
                  className={`w-2 h-2 rounded-full ${
                    task?.priority === "critical"
                      ? "bg-red-500"
                      : task?.priority === "high"
                      ? "bg-orange-500"
                      : task?.priority === "medium"
                      ? "bg-[#E6A93A]"
                      : "bg-[#1CC2B1]"
                  }`}
                />
                <span className="capitalize text-[#0E3554]">
                  {task.priority}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Desktop Header (updated design)
const DesktopHeader = ({
  task,
  onClose,
  onRefresh,
  loading,
  notesCount,
}: {
  task: Task;
  onClose: () => void;
  onRefresh: () => void;
  loading: boolean;
  notesCount: number;
}) => (
  <div className="bg-white border-b border-[#D9F3EE] p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#EFFFFA] rounded-xl flex items-center justify-center border border-[#D9F3EE]">
          <MessageSquare className="w-6 h-6 text-[#1CC2B1]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#0E3554] truncate flex items-center gap-2">
            {task?.title}
            <span className="text-xs font-normal bg-[#E1F3F0] text-[#1CC2B1] px-2 py-1 rounded-full">
              {notesCount} message{notesCount !== 1 ? "s" : ""}
            </span>
          </h2>
          <p className="text-[#0E3554] text-sm truncate mt-1 max-w-2xl">
            {task?.description || "No description provided"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`p-3 text-[#0E3554] hover:text-[#1CC2B1] hover:bg-[#EFFFFA] rounded-xl transition-all ${
            loading ? "animate-spin" : ""
          }`}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center text-[#0E3554] hover:text-red-600 hover:bg-[#EFFFFA] rounded-xl transition-colors border border-transparent hover:border-[#D9F3EE]"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>

    <div className="flex items-center gap-3 text-sm text-[#0E3554] flex-wrap mt-4">
      <div className="flex items-center gap-2 bg-[#EFFFFA] px-3 py-2 rounded-lg border border-[#D9F3EE]">
        <User className="w-4 h-4 text-[#1CC2B1]" />
        <span className="font-medium text-[#0E3554]">
          {task?.createdBy?.name}
        </span>
      </div>
      <div className="flex items-center gap-2 bg-[#EFFFFA] px-3 py-2 rounded-lg border border-[#D9F3EE]">
        <User className="w-4 h-4 text-[#1CC2B1]" />
        <span className="text-[#0E3554]">
          {task?.assignees?.length} team members
        </span>
      </div>
      <div className="flex items-center gap-2 bg-[#EFFFFA] px-3 py-2 rounded-lg border border-[#D9F3EE]">
        <div
          className={`w-2 h-2 rounded-full ${
            task?.status === "done"
              ? "bg-[#1CC2B1]"
              : task?.status === "in_progress"
              ? "bg-[#E6A93A]"
              : "bg-[#0E3554]"
          }`}
        />
        <span className="capitalize text-[#0E3554]">
          {task?.status?.replace("_", " ")}
        </span>
      </div>
      {task?.priority && (
        <div className="flex items-center gap-2 bg-[#EFFFFA] px-3 py-2 rounded-lg border border-[#D9F3EE]">
          <div
            className={`w-2 h-2 rounded-full ${
              task?.priority === "critical"
                ? "bg-red-500"
                : task?.priority === "high"
                ? "bg-orange-500"
                : task?.priority === "medium"
                ? "bg-[#E6A93A]"
                : "bg-[#1CC2B1]"
            }`}
          />
          <span className="capitalize text-[#0E3554]">
            {task.priority} priority
          </span>
        </div>
      )}
    </div>
  </div>
);

// Main Component
const TaskNotesModal = ({
  task,
  isOpen,
  onClose,
  onNoteAdded,
  currentUser,
}: {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onNoteAdded?: (newNote: Note) => void;
  currentUser: User;
}) => {
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<LocationState>({});
  const [imagePreview, setImagePreview] = useState<ImagePreviewState>({
    isOpen: false,
    imageUrl: "",
    fileName: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useAutoResizeTextarea(newNote);

  const { notes, loading, error, manualRefresh } = useNotesPolling(
    task?._id,
    isOpen
  );

  // Custom hooks
  useModal(isOpen, onClose);

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [notes]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Event handlers (keeping the same event handlers)
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

      // Reset form
      setNewNote("");
      setSelectedFiles([]);
      setLocation({});

      await manualRefresh();

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

  const openImagePreview = (imageUrl: string, fileName?: string) => {
    setImagePreview({
      isOpen: true,
      imageUrl,
      fileName,
    });
  };

  const closeImagePreview = () => {
    setImagePreview({
      isOpen: false,
      imageUrl: "",
      fileName: "",
    });
  };

  const isCurrentUser = (author?: User) => author?._id === currentUser?._id;

  const getAuthorInitial = (author?: User) => {
    if (!author?.name) return "?";
    return author.name.charAt(0).toUpperCase();
  };

  const getContrastColor = (hexColor?: string | null) => {
    if (!hexColor || !/^#([0-9A-Fa-f]{6})$/.test(hexColor)) return "#0E3554";
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  const getUserAvatar = (author?: User) => {
    const initials = getAuthorInitial(author);
    const backgroundColor = author?.color || "#EFFFFA";
    const textColor = getContrastColor(author?.color ?? undefined);

    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 border-2 border-white shadow-sm"
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

  if (!isOpen) return null;

  const isMobile = window.innerWidth < 768;
  const notesCount = notes?.length ?? 0;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 z-50">
        <div
          ref={modalRef}
          className={`bg-white rounded-none md:rounded-xl shadow-sm border border-[#D9F3EE] overflow-hidden w-full h-full md:max-w-4xl md:h-[90vh] flex flex-col transform transition-all duration-200 ${
            isMobile
              ? "animate-in slide-in-from-bottom-full"
              : "animate-in slide-in-from-bottom-4"
          }`}
        >
          {/* Responsive Header */}
          {isMobile ? (
            <MobileHeader
              task={task}
              onClose={onClose}
              onRefresh={manualRefresh}
              loading={loading}
              notesCount={notesCount}
            />
          ) : (
            <DesktopHeader
              task={task}
              onClose={onClose}
              onRefresh={manualRefresh}
              loading={loading}
              notesCount={notesCount}
            />
          )}

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Error Display */}
            {error && (
              <div className="flex items-center justify-between p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
                <span>{error}</span>
                <button
                  onClick={manualRefresh}
                  className="text-red-800 font-medium underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-white">
              {!notes || notes.length === 0 ? (
                <div className="text-center py-8 md:py-16 space-y-4 md:space-y-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[#EFFFFA] rounded-2xl flex items-center justify-center mx-auto border border-[#D9F3EE]">
                    <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-[#1CC2B1]" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <p className="text-[#0E3554] font-bold text-lg md:text-xl">
                      No messages yet
                    </p>
                    <p className="text-[#0E3554] text-sm max-w-md mx-auto leading-relaxed px-4">
                      Start the conversation by sending the first message.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {notes.map((note, index) => {
                    const isCurrentUserMessage = isCurrentUser(note.author);
                    const prev = notes[index - 1];
                    const showHeader =
                      index === 0 ||
                      !prev ||
                      prev.author._id !== note.author._id ||
                      new Date(note.createdAt).getTime() -
                        new Date(prev.createdAt).getTime() >
                        300000;

                    return (
                      <div
                        key={note._id}
                        className={`flex gap-3 group ${
                          isCurrentUserMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isCurrentUserMessage && (
                          <div className="flex-shrink-0">
                            {getUserAvatar(note.author)}
                          </div>
                        )}

                        <div
                          className={`flex flex-col ${
                            isCurrentUserMessage ? "items-end" : "items-start"
                          } max-w-[85%] md:max-w-[75%]`}
                        >
                          {showHeader && !isCurrentUserMessage && (
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="font-semibold text-[#0E3554] text-sm">
                                {note.author?.name ?? "Unknown"}
                              </span>
                              <span className="text-xs text-[#1CC2B1]">
                                {formatMessageTime(note.createdAt)}
                              </span>
                            </div>
                          )}

                          <div className="flex gap-2 items-start w-full">
                            {isCurrentUserMessage && (
                              <span className="text-xs text-[#1CC2B1] mt-2 flex-shrink-0 min-w-[50px] md:min-w-[60px] text-right">
                                {formatMessageTime(note.createdAt)}
                              </span>
                            )}

                            <div
                              className={`relative rounded-2xl p-3 md:p-4 transition-all duration-200 group-hover:shadow-sm flex-1 ${
                                isCurrentUserMessage
                                  ? "bg-[#0E3554] text-white rounded-br-md border border-[#0A2A42]"
                                  : "bg-[#EFFFFA] border border-[#D9F3EE] rounded-bl-md"
                              }`}
                            >
                              {note.text && (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2 md:mb-3">
                                  {note.text}
                                </p>
                              )}

                              {/* Attachments */}
                              {note.attachments &&
                                note.attachments.length > 0 && (
                                  <div className="space-y-2 md:space-y-3">
                                    {note.attachments.map((attachment, i) => (
                                      <AttachmentPreview
                                        key={i}
                                        attachment={attachment}
                                        noteAuthor={note.author}
                                        onImagePreview={openImagePreview}
                                        isCurrentUserMessage={
                                          isCurrentUserMessage
                                        }
                                      />
                                    ))}
                                  </div>
                                )}

                              {/* Location */}
                              {note.location && (
                                <div
                                  className={`mt-2 md:mt-3 pt-2 md:pt-3 ${
                                    isCurrentUserMessage
                                      ? "border-t border-white/20"
                                      : "border-t border-[#D9F3EE]"
                                  }`}
                                >
                                  <button
                                    onClick={() =>
                                      openLocationInMaps(
                                        note.location!.lat,
                                        note.location!.lng
                                      )
                                    }
                                    className={`flex items-center gap-2 text-xs hover:opacity-80 transition-opacity w-full text-left ${
                                      isCurrentUserMessage
                                        ? "text-white/90"
                                        : "text-[#0E3554]"
                                    }`}
                                  >
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate flex-1">
                                      {note.location.address ||
                                        `Location: ${note.location.lat.toFixed(
                                          4
                                        )}, ${note.location.lng.toFixed(4)}`}
                                    </span>
                                    <Navigation className="w-3 h-3 flex-shrink-0" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {!isCurrentUserMessage && (
                              <span className="text-xs text-[#1CC2B1] mt-2 flex-shrink-0 min-w-[50px] md:min-w-[60px]">
                                {formatMessageTime(note.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        {isCurrentUserMessage && (
                          <div className="flex-shrink-0">
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

          {/* Input Area */}
          <div className="border-t border-[#D9F3EE] p-4 bg-white flex-shrink-0">
            <div className="space-y-3 md:space-y-4">
              {/* Location Input */}
              {(location.lat || location.isGettingLocation) && (
                <div className="flex items-center gap-2 md:gap-3 p-3 bg-[#EFFFFA] rounded-lg md:rounded-xl border border-[#1CC2B1] animate-in slide-in-from-top-2 duration-200">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-[#1CC2B1] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#0E3554] font-semibold truncate">
                      {location.address || "Current location"}
                    </div>
                    <div className="text-xs text-[#1CC2B1] font-mono truncate">
                      {location.lat}, {location.lng}
                    </div>
                  </div>
                  <button
                    onClick={clearLocation}
                    className="text-[#1CC2B1] hover:text-[#0E3554] p-1 md:p-2 rounded-lg transition-colors hover:bg-[#E0FFFA]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* File Attachments */}
              {selectedFiles.length > 0 && (
                <div className="p-3 bg-[#EFFFFA] rounded-lg md:rounded-xl border border-[#D9F3EE] animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Paperclip className="w-4 h-4 text-[#0E3554]" />
                    <span className="text-sm font-semibold text-[#0E3554]">
                      Files ({selectedFiles.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => {
                      const IconComponent = getFileIcon(file.type);
                      const isImage = isImageFile(file.type);

                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-[#D9F3EE] text-sm max-w-[200px] transition-all duration-200 hover:shadow-sm group"
                        >
                          {isImage ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-6 h-6 rounded object-cover"
                            />
                          ) : (
                            <IconComponent className="w-4 h-4 text-[#0E3554] flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#0E3554] truncate">
                              {file.name}
                            </div>
                            <div className="text-xs text-[#1CC2B1]">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                          <button
                            onClick={() => removeSelectedFile(index)}
                            className="text-[#0E3554] hover:text-red-500 p-0.5 rounded transition-colors flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 md:gap-4">
                {/* Text Input */}
                <div className="flex-1 relative">
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
                    className="w-full px-3 md:px-4 py-3 pr-12 md:pr-14 text-sm border border-[#D9F3EE] rounded-xl placeholder-[#0E3554] transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#1CC2B1] focus:border-transparent hover:border-[#1CC2B1] bg-white text-[#0E3554] disabled:bg-[#EFFFFA] resize-none"
                    rows={1}
                    style={{ minHeight: "48px", maxHeight: "120px" }}
                  />

                  <button
                    onClick={handleAddNote}
                    disabled={
                      addingNote ||
                      (!newNote.trim() &&
                        selectedFiles.length === 0 &&
                        !(location.lat && location.lng))
                    }
                    className="absolute right-2 bottom-2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl bg-[#0E3554] hover:bg-[#0A2A42] disabled:bg-[#D9F3EE] disabled:cursor-not-allowed transition-all duration-200 text-white"
                    title="Send message"
                  >
                    {addingNote ? (
                      <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3 h-3 md:w-4 md:h-4" />
                    )}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 md:gap-2">
                  <label className="flex items-center gap-2 text-[#0E3554] cursor-pointer">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFilesChange}
                      accept="*/*"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-[#D9F3EE] rounded-xl hover:bg-[#EFFFFA] transition-all duration-200 hover:border-[#1CC2B1] bg-white"
                      title="Attach files"
                    >
                      <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </label>

                  <button
                    onClick={getCurrentLocation}
                    disabled={location.isGettingLocation}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-[#D9F3EE] rounded-xl hover:bg-[#EFFFFA] transition-all duration-200 disabled:opacity-50 hover:border-[#1CC2B1] bg-white"
                    title="Share location"
                  >
                    {location.isGettingLocation ? (
                      <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-[#0E3554] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Helper Text */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 text-xs text-[#0E3554] pt-2">
                <div className="flex items-center gap-4">
                  <span>Enter to send • Shift+Enter for new line</span>
                  {selectedFiles.length > 0 && (
                    <span className="text-[#1CC2B1] font-medium">
                      {selectedFiles.length} file
                      {selectedFiles.length > 1 ? "s" : ""} attached
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={manualRefresh}
                    disabled={loading}
                    className="px-3 py-2 text-sm text-[#0E3554] bg-white border border-[#D9F3EE] rounded-lg hover:bg-[#EFFFFA] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </button>
                  {!isMobile && (
                    <button
                      onClick={onClose}
                      className="px-3 py-2 text-sm text-[#0E3554] hover:text-[#1CC2B1] font-medium transition-colors hover:bg-[#EFFFFA] rounded-lg border border-transparent hover:border-[#D9F3EE]"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        imageUrl={imagePreview.imageUrl}
        fileName={imagePreview.fileName}
        isOpen={imagePreview.isOpen}
        onClose={closeImagePreview}
      />
    </>
  );
};

export default TaskNotesModal;

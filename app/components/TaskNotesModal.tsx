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
  Navigation,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  File as FileIcon,
  Mic,
  VideoIcon,
  Plus,
} from "lucide-react";
import {
  DesktopHeader,
  MobileHeader,
  ActionMenu,
  MediaPreviewModal,
  VideoRecordingModal,
  VoiceRecordingControls,
} from "./chat";

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
export const MAX_RECORDING_DURATION = 300000; // 5 minutes

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

  // Cleanup function - FIXED: No dependencies
  const cleanup = useCallback(() => {
    console.log("Cleaning up recording...");
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
  }, []); // No dependencies

  // Stop recording - FIXED: No dependencies on recording state
  const stopRecording = useCallback(() => {
    console.log("Stopping recording...");
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
    cleanup();
  }, [cleanup]);

  // Start recording - COMPLETELY REWRITTEN
  const startRecording = useCallback(
    async (type: "audio" | "video") => {
      try {
        console.log("Starting recording...");
        const constraints =
          type === "video" ? { video: true, audio: true } : { audio: true };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        // Store references
        streamRef.current = stream;
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          console.log("Recording stopped, creating blob...");
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

        // Start the recorder
        recorder.start(1000);
        console.log("Recorder started");

        // Set start time
        startTimeRef.current = Date.now();

        // Set recording state first
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

        // Start timer for duration - FIXED: Use refs instead of state
        timerRef.current = setInterval(() => {
          const currentTime = Date.now();
          const elapsed = currentTime - startTimeRef.current;

          console.log("Duration update:", {
            currentTime,
            startTime: startTimeRef.current,
            elapsed,
            formatted: formatDuration(elapsed),
          });

          // Update duration in state - this should trigger re-render
          setRecording((prev) => {
            if (prev.state === "recording") {
              return { ...prev, duration: elapsed };
            }
            return prev;
          });

          // Auto-stop after max duration
          if (elapsed >= MAX_RECORDING_DURATION) {
            console.log("Max duration reached, stopping recording");
            stopRecording();
          }
        }, 100);
      } catch (error) {
        console.error("Error starting recording:", error);
        alert(`Could not access ${type} recording. Please check permissions.`);
        cleanup();
      }
    },
    [cleanup, stopRecording] // Add stopRecording to dependencies
  );

  // Cancel recording - FIXED
  const cancelRecording = useCallback(() => {
    console.log("Canceling recording...");
    if (recorderRef.current) {
      recorderRef.current.stop();
    }

    // Clean up everything
    cleanup();

    if (recording.url) {
      URL.revokeObjectURL(recording.url);
    }

    // Completely reset state
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

  // Get recording file
  const getRecordingFile = useCallback(() => {
    if (!recording.blob) {
      console.log("No recording blob available");
      return null;
    }

    const fileExtension = recording.type === "video" ? "mp4" : "wav";
    const fileName = `recording-${new Date().toISOString()}.${fileExtension}`;

    console.log("Creating recording file:", fileName);
    return new File([recording.blob], fileName, {
      type: recording.blob.type,
    });
  }, [recording.blob, recording.type]);

  // Effect for cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("useMediaRecorder unmounting");
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
  // Ensure we have a valid number
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

interface TaskNotesModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onNoteAdded?: (newNote: Note) => void;
  currentUser: User;
}

const TaskNotesModal: React.FC<TaskNotesModalProps> = ({
  task,
  isOpen,
  onClose,
  onNoteAdded,
  currentUser,
}) => {
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useAutoResizeTextarea(newNote);

  const [videoModalKey, setVideoModalKey] = useState(0);

  const { notes, loading, error, manualRefresh } = useNotesPolling(
    task?._id,
    isOpen
  );

  const {
    recording,
    startRecording,
    stopRecording,
    cancelRecording,
    getRecordingFile,
  } = useMediaRecorder();

  // Custom hooks
  useModal(isOpen, onClose);

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [notes]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Handle recording completion
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

  // Close action menu when recording starts
  useEffect(() => {
    if (recording.state === "recording") {
      setShowActionMenu(false);
    }
  }, [recording.state]);

  // Event handlers
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

  if (!isOpen) return null;

  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const notesCount = notes?.length ?? 0;

  return (
    <>
      {/* Main Modal - Full Screen */}
      <div className="fixed inset-0 bg-white flex flex-col z-50 safe-area">
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
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50/50">
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
          <div className="flex-1 p-4 md:p-6 overflow-y-auto safe-area-bottom">
            {!notes || notes.length === 0 ? (
              <div className="text-center py-8 md:py-16 space-y-4 md:space-y-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto border border-gray-200 shadow-sm">
                  <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                </div>
                <div className="space-y-2 md:space-y-3">
                  <p className="text-gray-900 font-semibold text-lg md:text-xl">
                    No messages yet
                  </p>
                  <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed px-4">
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
                            <span className="font-semibold text-gray-900 text-sm">
                              {note.author?.name ?? "Unknown"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatMessageTime(note.createdAt)}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2 items-start w-full">
                          {isCurrentUserMessage && (
                            <span className="text-xs text-gray-400 mt-2 flex-shrink-0 min-w-[50px] md:min-w-[60px] text-right">
                              {formatMessageTime(note.createdAt)}
                            </span>
                          )}

                          <div
                            className={`relative rounded-2xl p-3 md:p-4 transition-all duration-200 flex-1 ${
                              isCurrentUserMessage
                                ? "bg-[#86c785] text-white rounded-br-md"
                                : "bg-[#fbf5ad] border border-gray-200 rounded-bl-md"
                            }`}
                          >
                            {note.text && (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2 md:mb-3">
                                {note.text}
                              </p>
                            )}

                            {/* Attachments would go here */}
                            {note.attachments &&
                              note.attachments.length > 0 && (
                                <div className="space-y-2">
                                  {note.attachments.map((attachment, i) => (
                                    <div
                                      key={i}
                                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                                        isCurrentUserMessage
                                          ? "bg-blue-50 border-blue-200"
                                          : "bg-gray-50 border-gray-200"
                                      }`}
                                    >
                                      <FileIcon className="w-5 h-5 text-gray-500" />
                                      <div className="flex-1 min-w-0">
                                        <a
                                          href={attachment.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate flex items-center gap-1"
                                        >
                                          {attachment.fileName || "Attachment"}
                                        </a>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {formatFileSize(attachment.size || 0)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
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
                                  className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity w-full text-left"
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
                            <span className="text-xs text-gray-400 mt-2 flex-shrink-0 min-w-[50px] md:min-w-[60px]">
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

        {/* Input Area - FIXED ALIGNMENT */}
        <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0 safe-area-bottom">
          <div className="space-y-3">
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
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-blue-900 font-medium">
                    {location.address || "Current location"}
                  </div>
                  <div className="text-xs text-blue-700">
                    {location.lat}, {location.lng}
                  </div>
                </div>
                <button
                  onClick={clearLocation}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                  title="Remove location"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* File Attachments */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {selectedFiles.map((file, index) => {
                  const IconComponent = getFileIcon(file.type);
                  const isImage = isImageFile(file.type);
                  const isVideo = isVideoFile(file.type);
                  const isAudio = isAudioFile(file.type);

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 text-sm max-w-[200px] transition-all duration-200 hover:shadow-sm"
                    >
                      {isImage ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-6 h-6 rounded object-cover"
                        />
                      ) : isVideo ? (
                        <VideoIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      ) : isAudio ? (
                        <Mic className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      ) : (
                        <IconComponent className="w-4 h-4 text-gray-500 flex-shrink-0" />
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
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Input Row - PERFECTLY ALIGNED */}
            <div className="flex items-center gap-3 w-full">
              {/* Action Menu Button */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  disabled={recording.state === "recording"}
                  className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:border-gray-400 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="More actions"
                >
                  <Plus className="w-5 h-5 text-gray-700" />
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
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#0E3554] focus:border-transparent hover:border-gray-400 bg-white text-gray-900 disabled:bg-gray-100 resize-none"
                rows={1}
                style={{
                  minHeight: "48px",
                  maxHeight: "120px",
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
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#0E3554] hover:bg-[#0A2A42] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 text-white shadow-sm"
                title="Send message"
              >
                {addingNote ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 text-xs text-gray-500 pt-1">
              <div className="flex items-center gap-4 flex-wrap">
                <span>Enter to send • Shift+Enter for new line</span>
                {selectedFiles.length > 0 && (
                  <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md">
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

      {/* Media Preview Modal */}
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

import { Square, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  formatDuration,
  MAX_RECORDING_DURATION,
  RecordingStateData,
} from "../TaskNotesModal";

const VideoRecordingModal = ({
  isOpen,
  onClose,
  onRecordingComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (file: File) => void;
}) => {
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log("Video recording cleanup");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    recorderRef.current = null;
    startTimeRef.current = 0;
  }, []);

  // Reset recording state when modal closes
  const resetRecordingState = useCallback(() => {
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
  }, []);

  const stopRecording = useCallback(() => {
    console.log("Stopping video recording");
    if (recorderRef.current && recording.state === "recording") {
      recorderRef.current.stop();
      cleanup();
    }
  }, [recording.state, cleanup]);

  const startRecording = useCallback(async () => {
    try {
      console.log("Starting video recording...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Store stream reference
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      // Store recorder reference
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        console.log("Video recording stopped");
        const blob = new Blob(chunks, { type: "video/mp4" });
        const url = URL.createObjectURL(blob);

        setRecording((prev) => ({
          ...prev,
          url,
          chunks,
          blob,
          state: "stopped",
        }));

        // Create file and call completion callback
        const file = new File([blob], `video-${new Date().toISOString()}.mp4`, {
          type: "video/mp4",
        });
        onRecordingComplete(file);

        // Cleanup and close after a short delay
        setTimeout(() => {
          cleanup();
          resetRecordingState();
          onClose();
        }, 100);
      };

      recorder.start(1000);
      startTimeRef.current = Date.now();

      // Start duration timer
      timerRef.current = setInterval(() => {
        const duration = Date.now() - startTimeRef.current;
        setRecording((prev) => ({ ...prev, duration }));

        if (duration >= MAX_RECORDING_DURATION) {
          console.log("Max video duration reached");
          stopRecording();
        }
      }, 100);

      setRecording({
        state: "recording",
        type: "video",
        stream,
        recorder,
        chunks,
        duration: 0,
        url: null,
        blob: null,
      });
    } catch (error) {
      console.error("Error starting video recording:", error);
      alert("Could not access camera. Please check permissions.");
      cleanup();
      resetRecordingState();
      onClose();
    }
  }, [
    cleanup,
    onRecordingComplete,
    onClose,
    resetRecordingState,
    stopRecording,
  ]);

  const cancelRecording = useCallback(() => {
    console.log("Canceling video recording");
    if (recorderRef.current && recording.state === "recording") {
      recorderRef.current.stop();
    }
    cleanup();
    resetRecordingState();
    onClose();
  }, [cleanup, onClose, resetRecordingState]);

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened, state:", recording.state);
      if (recording.state === "idle") {
        startRecording();
      }
    } else {
      // Modal is closing, reset state for next time
      console.log("Modal closing, resetting state");
      cleanup();
      resetRecordingState();
    }
  }, [isOpen, recording.state, startRecording, cleanup, resetRecordingState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("VideoRecordingModal unmounting");
      cleanup();
      if (recording.url) {
        URL.revokeObjectURL(recording.url);
      }
    };
  }, [cleanup, recording.url]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {recording.state === "recording"
              ? "Recording Video..."
              : "Record Video"}
          </h3>
          <button
            onClick={cancelRecording}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative bg-black rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-64 md:h-96 object-cover"
          />
          {recording.state === "recording" && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Recording
            </div>
          )}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white font-mono text-lg bg-black/50 px-3 py-1 rounded-full">
            {formatDuration(recording.duration)}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={cancelRecording}
            className="px-6 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors border border-gray-300 font-semibold"
          >
            {recording.state === "recording" ? "Cancel" : "Close"}
          </button>
          {recording.state === "recording" && (
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-semibold flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop Recording
            </button>
          )}
        </div>

        <p className="text-xs text-center text-gray-500">
          Maximum recording time: 5 minutes
        </p>
      </div>
    </div>
  );
};

export default VideoRecordingModal;

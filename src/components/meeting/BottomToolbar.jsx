import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  Users,
  MessageCircle,
  Settings,
  PhoneOff,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useLocalParticipant } from "@livekit/components-react";

import IconButton from "./ui/IconButton";

function BottomToolbar() {
  const navigate = useNavigate();

  const {
    localParticipant,
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
  } = useLocalParticipant();

  async function toggleMicrophone() {
    try {
      await localParticipant.setMicrophoneEnabled(
        !isMicrophoneEnabled
      );
    } catch (error) {
      console.error("Microphone error:", error);
    }
  }

  async function toggleCamera() {
    try {
      await localParticipant.setCameraEnabled(
        !isCameraEnabled
      );
    } catch (error) {
      console.error("Camera error:", error);
    }
  }

  async function toggleScreenShare() {
    try {
      await localParticipant.setScreenShareEnabled(
        !isScreenShareEnabled
      );
    } catch (error) {
      console.error("Screen share error:", error);
    }
  }

  async function leaveMeeting() {
    try {
      await localParticipant.setCameraEnabled(false);
      await localParticipant.setMicrophoneEnabled(false);

      if (isScreenShareEnabled) {
        await localParticipant.setScreenShareEnabled(false);
      }
    } catch (error) {
      console.error("Leave cleanup error:", error);
    }

    navigate("/home");
  }

  return (
    <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-full border border-zinc-800 bg-zinc-900/90 px-6 py-4 shadow-2xl backdrop-blur-xl">

        {/* Microphone */}
        <div className="flex flex-col items-center gap-1">
          <IconButton onClick={toggleMicrophone}>
            {isMicrophoneEnabled ? (
              <Mic size={20} className="text-white" />
            ) : (
              <MicOff size={20} className="text-red-400" />
            )}
          </IconButton>

          <span className="text-[11px] text-zinc-400">
            Mic
          </span>
        </div>

        {/* Camera */}
        <div className="flex flex-col items-center gap-1">
          <IconButton onClick={toggleCamera}>
            {isCameraEnabled ? (
              <Video size={20} className="text-white" />
            ) : (
              <VideoOff size={20} className="text-red-400" />
            )}
          </IconButton>

          <span className="text-[11px] text-zinc-400">
            Camera
          </span>
        </div>

        {/* Screen Share */}
        <div className="flex flex-col items-center gap-1">
          <IconButton onClick={toggleScreenShare}>
            {isScreenShareEnabled ? (
              <MonitorOff
                size={20}
                className="text-violet-400"
              />
            ) : (
              <MonitorUp size={20} className="text-white" />
            )}
          </IconButton>

          <span className="text-[11px] text-zinc-400">
            {isScreenShareEnabled ? "Stop" : "Share"}
          </span>
        </div>

        {/* Chat */}
        <div className="flex flex-col items-center gap-1">
          <IconButton>
            <MessageCircle size={20} />
          </IconButton>

          <span className="text-[11px] text-zinc-400">
            Chat
          </span>
        </div>

        {/* Participants */}
        <div className="flex flex-col items-center gap-1">
          <IconButton>
            <Users size={20} />
          </IconButton>

          <span className="text-[11px] text-zinc-400">
            People
          </span>
        </div>

        {/* Settings */}
        <div className="flex flex-col items-center gap-1">
          <IconButton>
            <Settings size={20} />
          </IconButton>

          <span className="text-[11px] text-zinc-400">
            Settings
          </span>
        </div>

        <div className="mx-2 h-12 w-px bg-zinc-700" />

        {/* Leave */}
        <button
          onClick={leaveMeeting}
          className="flex items-center gap-3 rounded-full bg-red-600 px-5 py-3 font-semibold text-white transition-all duration-200 hover:bg-red-500"
        >
          <PhoneOff size={20} />
          Leave
        </button>

      </div>
    </div>
  );
}

export default BottomToolbar;
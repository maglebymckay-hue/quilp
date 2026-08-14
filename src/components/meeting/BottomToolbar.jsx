import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  Users,
  MessageCircle,
  Smile,
  Settings,
  PhoneOff,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useLocalParticipant } from "@livekit/components-react";

import IconButton from "./ui/IconButton";

function BottomToolbar({
  chatOpen,
  reactionsOpen,
  peopleOpen,
  unreadChatCount = 0,
  onToggleChat,
  onToggleReactions,
  onTogglePeople,
}) {
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
      if (isScreenShareEnabled) {
        await localParticipant.setScreenShareEnabled(false);
      }

      if (isCameraEnabled) {
        await localParticipant.setCameraEnabled(false);
      }

      if (isMicrophoneEnabled) {
        await localParticipant.setMicrophoneEnabled(false);
      }
    } catch (error) {
      console.error("Leave cleanup error:", error);
    }

    navigate("/home");
  }

  return (
    <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-full border border-zinc-800 bg-zinc-900/90 px-6 py-4 shadow-2xl backdrop-blur-xl">

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

        <div className="flex flex-col items-center gap-1">
          <IconButton onClick={toggleScreenShare}>
            {isScreenShareEnabled ? (
              <MonitorOff
                size={20}
                className="text-violet-400"
              />
            ) : (
              <MonitorUp
                size={20}
                className="text-white"
              />
            )}
          </IconButton>

          <span className="text-[11px] text-zinc-400">
            {isScreenShareEnabled
              ? "Stop"
              : "Share"}
          </span>
        </div>

        <div className="relative flex flex-col items-center gap-1">

          <IconButton onClick={onToggleChat}>
            <MessageCircle
              size={20}
              className={
                chatOpen
                  ? "text-violet-400"
                  : "text-white"
              }
            />
          </IconButton>

          {unreadChatCount > 0 && !chatOpen && (
            <div className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
              {unreadChatCount > 99
                ? "99+"
                : unreadChatCount}
            </div>
          )}

          <span
            className={`text-[11px] ${
              chatOpen
                ? "text-violet-400"
                : "text-zinc-400"
            }`}
          >
            Chat
          </span>

        </div>

        <div className="flex flex-col items-center gap-1">
          <IconButton onClick={onToggleReactions}>
            <Smile
              size={20}
              className={
                reactionsOpen
                  ? "text-violet-400"
                  : "text-white"
              }
            />
          </IconButton>

          <span
            className={`text-[11px] ${
              reactionsOpen
                ? "text-violet-400"
                : "text-zinc-400"
            }`}
          >
            React
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <IconButton onClick={onTogglePeople}>
            <Users
              size={20}
              className={
                peopleOpen
                  ? "text-violet-400"
                  : "text-white"
              }
            />
          </IconButton>

          <span
            className={`text-[11px] ${
              peopleOpen
                ? "text-violet-400"
                : "text-zinc-400"
            }`}
          >
            People
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <IconButton>
            <Settings
              size={20}
              className="text-white"
            />
          </IconButton>

          <span className="text-[11px] text-zinc-400">
            Settings
          </span>
        </div>

        <div className="mx-2 h-12 w-px bg-zinc-700" />

        <button
          onClick={leaveMeeting}
          className="flex items-center gap-3 rounded-full bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500"
        >
          <PhoneOff size={20} />
          Leave
        </button>

      </div>
    </div>
  );
}

export default BottomToolbar;
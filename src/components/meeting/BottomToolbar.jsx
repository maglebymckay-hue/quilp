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
  settingsOpen,
  unreadChatCount = 0,
  onToggleChat,
  onToggleReactions,
  onTogglePeople,
  onToggleSettings,
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
      console.error(
        "Microphone error:",
        error
      );
    }
  }

  async function toggleCamera() {
    try {
      await localParticipant.setCameraEnabled(
        !isCameraEnabled
      );
    } catch (error) {
      console.error(
        "Camera error:",
        error
      );
    }
  }

  async function toggleScreenShare() {
    try {
      await localParticipant.setScreenShareEnabled(
        !isScreenShareEnabled
      );
    } catch (error) {
      console.error(
        "Screen share error:",
        error
      );
    }
  }

  async function leaveMeeting() {
    try {
      if (isScreenShareEnabled) {
        await localParticipant.setScreenShareEnabled(
          false
        );
      }

      if (isCameraEnabled) {
        await localParticipant.setCameraEnabled(
          false
        );
      }

      if (isMicrophoneEnabled) {
        await localParticipant.setMicrophoneEnabled(
          false
        );
      }
    } catch (error) {
      console.error(
        "Leave cleanup error:",
        error
      );
    }

    navigate("/home");
  }

  return (
    <div className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-1rem)] max-w-max -translate-x-1/2 sm:bottom-5 lg:bottom-8">

      <div className="flex max-w-[calc(100vw-1rem)] items-center gap-2 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/95 px-3 py-3 shadow-2xl backdrop-blur-xl sm:gap-3 sm:rounded-full sm:px-5 lg:gap-4 lg:px-6 lg:py-4">

        <div className="flex shrink-0 flex-col items-center gap-1">
          <IconButton onClick={toggleMicrophone}>
            {isMicrophoneEnabled ? (
              <Mic size={20} className="text-white" />
            ) : (
              <MicOff size={20} className="text-red-400" />
            )}
          </IconButton>

          <span className="hidden text-[11px] text-zinc-400 sm:block">
            Mic
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <IconButton onClick={toggleCamera}>
            {isCameraEnabled ? (
              <Video size={20} className="text-white" />
            ) : (
              <VideoOff size={20} className="text-red-400" />
            )}
          </IconButton>

          <span className="hidden text-[11px] text-zinc-400 sm:block">
            Camera
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
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

          <span className="hidden text-[11px] text-zinc-400 sm:block">
            {isScreenShareEnabled ? "Stop" : "Share"}
          </span>
        </div>

        <div className="relative flex shrink-0 flex-col items-center gap-1">

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
            className={`hidden text-[11px] sm:block ${
              chatOpen
                ? "text-violet-400"
                : "text-zinc-400"
            }`}
          >
            Chat
          </span>

        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
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
            className={`hidden text-[11px] sm:block ${
              reactionsOpen
                ? "text-violet-400"
                : "text-zinc-400"
            }`}
          >
            React
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
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
            className={`hidden text-[11px] sm:block ${
              peopleOpen
                ? "text-violet-400"
                : "text-zinc-400"
            }`}
          >
            People
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <IconButton onClick={onToggleSettings}>
            <Settings
              size={20}
              className={
                settingsOpen
                  ? "text-violet-400"
                  : "text-white"
              }
            />
          </IconButton>

          <span
            className={`hidden text-[11px] sm:block ${
              settingsOpen
                ? "text-violet-400"
                : "text-zinc-400"
            }`}
          >
            Settings
          </span>
        </div>

        <div className="mx-1 hidden h-10 w-px shrink-0 bg-zinc-700 sm:block lg:h-12" />

        <button
          onClick={leaveMeeting}
          className="flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-500"
        >
          <PhoneOff size={19} />
          <span className="hidden sm:inline">
            Leave
          </span>
        </button>

      </div>

    </div>
  );
}

export default BottomToolbar;
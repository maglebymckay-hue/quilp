import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
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
    microphone,
    camera,
    screenShare,
  } = useLocalParticipant();

  function leaveMeeting() {
    navigate("/home");
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">

      <div className="flex items-center gap-4 rounded-full border border-zinc-800 bg-zinc-900/90 backdrop-blur-xl px-6 py-4 shadow-2xl">

        {/* Microphone */}

        <div className="flex flex-col items-center gap-1">

          <IconButton onClick={() => microphone.toggle()}>

            {microphone.enabled ? (
              <Mic className="text-white" size={20} />
            ) : (
              <MicOff className="text-red-400" size={20} />
            )}

          </IconButton>

          <span className="text-[11px] text-zinc-400">
            Mic
          </span>

        </div>

        {/* Camera */}

        <div className="flex flex-col items-center gap-1">

          <IconButton onClick={() => camera.toggle()}>

            {camera.enabled ? (
              <Video className="text-white" size={20} />
            ) : (
              <VideoOff className="text-red-400" size={20} />
            )}

          </IconButton>

          <span className="text-[11px] text-zinc-400">
            Camera
          </span>

        </div>

        {/* Screen Share */}

        <div className="flex flex-col items-center gap-1">

          <IconButton onClick={() => screenShare.toggle()}>

            <MonitorUp
              size={20}
              className={
                screenShare.enabled
                  ? "text-green-400"
                  : "text-white"
              }
            />

          </IconButton>

          <span className="text-[11px] text-zinc-400">
            Share
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

        <div className="h-12 w-px bg-zinc-700 mx-2" />

        {/* Leave */}

        <button
          onClick={leaveMeeting}
          className="flex items-center gap-3 rounded-full bg-red-600 hover:bg-red-500 transition-all duration-200 px-5 py-3 font-semibold text-white"
        >
          <PhoneOff size={20} />
          Leave
        </button>

      </div>

    </div>
  );
}

export default BottomToolbar;
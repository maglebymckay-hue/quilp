import {
  ParticipantTile,
  useIsSpeaking,
} from "@livekit/components-react";

import {
  Mic,
  MicOff,
  VideoOff,
} from "lucide-react";

import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";

function VideoTile({ trackRef }) {
  const participant = trackRef.participant;

  const isSpeaking = useIsSpeaking(participant);

  const displayName =
    participant?.name ||
    participant?.identity ||
    "Guest";

  const micEnabled =
    participant?.isMicrophoneEnabled ?? false;

  const cameraEnabled =
    participant?.isCameraEnabled ?? false;

  return (
    <div
      className={`
        relative
        h-full
        w-full
        overflow-hidden
        rounded-3xl
        border
        bg-zinc-900
        transition-all
        duration-300
        ${
          isSpeaking
            ? "scale-[1.01] border-violet-500 ring-2 ring-violet-500 shadow-[0_0_45px_rgba(139,92,246,0.45)]"
            : "border-zinc-800"
        }
      `}
    >
      {cameraEnabled ? (
        <ParticipantTile
          trackRef={trackRef}
          disableSpeakingIndicator
          className="h-full w-full"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-violet-950 to-zinc-950">

          <div
            className={`
              transition-all
              duration-300
              ${
                isSpeaking
                  ? "scale-110 drop-shadow-[0_0_30px_rgba(139,92,246,0.55)]"
                  : ""
              }
            `}
          >
            <Avatar
              name={displayName}
              large
            />
          </div>

          <p className="mt-5 text-lg font-semibold text-white">
            {displayName}
          </p>

          <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
            <VideoOff size={15} />
            Camera off
          </div>

        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4">

        <div>

          <div className="flex items-center gap-2">

            <span className="font-semibold text-white">
              {displayName}
            </span>

            {participant?.isLocal && (
              <Badge>You</Badge>
            )}

          </div>

          <div className="mt-1 h-5">

            {isSpeaking && (
              <div className="flex items-center gap-2 text-xs font-medium text-violet-300">

                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                </span>

                Speaking

              </div>
            )}

          </div>

        </div>

        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            backdrop-blur-md
            transition
            ${
              micEnabled
                ? "bg-black/40"
                : "bg-red-500/20"
            }
          `}
        >
          {micEnabled ? (
            <Mic
              size={17}
              className={
                isSpeaking
                  ? "text-violet-300"
                  : "text-white"
              }
            />
          ) : (
            <MicOff
              size={17}
              className="text-red-400"
            />
          )}
        </div>

      </div>
    </div>
  );
}

export default VideoTile;
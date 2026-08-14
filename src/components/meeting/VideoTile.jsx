import {
  ParticipantTile,
} from "@livekit/components-react";

function VideoTile({ trackRef }) {
  return (
    <div
      className="
        relative
        h-full
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900
        shadow-2xl
        transition-all
        duration-300
        hover:border-violet-500
        hover:scale-[1.02]
      "
    >
      <ParticipantTile
        trackRef={trackRef}
        className="h-full w-full"
      />

      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    </div>
  );
}

export default VideoTile;
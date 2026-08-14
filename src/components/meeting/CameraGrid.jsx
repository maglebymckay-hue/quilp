import {
  GridLayout,
  ParticipantTile,
  useTracks,
} from "@livekit/components-react";

import { Track } from "livekit-client";

function CameraGrid() {
  const tracks = useTracks(
    [
      {
        source: Track.Source.Camera,
        withPlaceholder: true,
      },
      {
        source: Track.Source.ScreenShare,
        withPlaceholder: false,
      },
    ],
    {
      onlySubscribed: false,
    }
  );

  return (
    <div className="h-full w-full bg-zinc-950 p-6">

      <GridLayout
        tracks={tracks}
        className="h-full w-full gap-5"
      >
        <ParticipantTile />
      </GridLayout>

    </div>
  );
}

export default CameraGrid;
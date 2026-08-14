import {
  GridLayout,
  ParticipantTile,
  TrackLoop,
  useTracks,
} from "@livekit/components-react";

import { Track } from "livekit-client";

import VideoTile from "./VideoTile";

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

  const screenShareTracks = tracks.filter(
    (track) =>
      track.publication?.source ===
      Track.Source.ScreenShare
  );

  const cameraTracks = tracks.filter(
    (track) =>
      track.publication?.source ===
        Track.Source.Camera ||
      !track.publication
  );

  const isScreenSharing =
    screenShareTracks.length > 0;

  if (isScreenSharing) {
    return (
      <div className="h-full w-full bg-zinc-950 p-6">

        <div className="flex h-full flex-col gap-4">

          {/* Shared Screen */}

          <div className="min-h-0 flex-1 overflow-hidden rounded-3xl border border-zinc-800 bg-black">

            <TrackLoop tracks={screenShareTracks}>
              <ParticipantTile className="h-full w-full" />
            </TrackLoop>

          </div>

          {/* Camera Strip */}

          <div className="h-36 overflow-hidden">

            <div className="flex h-full gap-4 overflow-x-auto">

              <TrackLoop tracks={cameraTracks}>
                {(trackRef) => (
                  <div className="h-full min-w-[220px] max-w-[260px]">
                    <VideoTile trackRef={trackRef} />
                  </div>
                )}
              </TrackLoop>

            </div>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="h-full w-full bg-zinc-950 p-6">

      <GridLayout
        tracks={cameraTracks}
        className="h-full w-full gap-5"
      >

        <TrackLoop tracks={cameraTracks}>
          {(trackRef) => (
            <VideoTile trackRef={trackRef} />
          )}
        </TrackLoop>

      </GridLayout>

    </div>
  );
}

export default CameraGrid;
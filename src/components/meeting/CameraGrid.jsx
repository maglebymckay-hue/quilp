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
        source:
          Track.Source.ScreenShare,
        withPlaceholder: false,
      },
    ],
    {
      onlySubscribed: false,
    }
  );

  const screenShareTracks =
    tracks.filter(
      (track) =>
        track.publication?.source ===
        Track.Source.ScreenShare
    );

  const cameraTracks =
    tracks.filter(
      (track) =>
        track.publication?.source ===
          Track.Source.Camera ||
        !track.publication
    );

  const isScreenSharing =
    screenShareTracks.length > 0;

  if (isScreenSharing) {
    return (
      <div className="h-full w-full bg-zinc-950 p-2 sm:p-4 lg:p-6">

        <div className="flex h-full flex-col gap-2 sm:gap-4">

          <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-zinc-800 bg-black lg:rounded-3xl">

            <TrackLoop
              tracks={screenShareTracks}
            >
              <ParticipantTile className="h-full w-full" />
            </TrackLoop>

          </div>

          <div className="h-24 overflow-hidden sm:h-28 lg:h-36">

            <div className="flex h-full gap-2 overflow-x-auto sm:gap-3 lg:gap-4">

              <TrackLoop
                tracks={cameraTracks}
              >
                {(trackRef) => (
                  <div className="h-full min-w-[140px] max-w-[180px] sm:min-w-[170px] sm:max-w-[210px] lg:min-w-[220px] lg:max-w-[260px]">
                    <VideoTile
                      trackRef={trackRef}
                    />
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
    <div className="h-full w-full bg-zinc-950 p-2 pb-24 sm:p-4 sm:pb-28 lg:p-6 lg:pb-32">

      <GridLayout
        tracks={cameraTracks}
        className="h-full w-full gap-2 sm:gap-4 lg:gap-5"
      >

        <TrackLoop
          tracks={cameraTracks}
        >
          {(trackRef) => (
            <VideoTile
              trackRef={trackRef}
            />
          )}
        </TrackLoop>

      </GridLayout>

    </div>
  );
}

export default CameraGrid;
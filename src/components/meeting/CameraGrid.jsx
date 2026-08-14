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

  const participantCount =
    cameraTracks.length;

  // Screen sharing / presentation mode
  if (isScreenSharing) {
    return (
      <div className="h-full w-full bg-zinc-950 p-2 sm:p-4 lg:p-6">

        <div className="flex h-full flex-col gap-2 sm:gap-4">

          {/* Shared Screen */}
          <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-zinc-800 bg-black lg:rounded-3xl">

            <TrackLoop
              tracks={screenShareTracks}
            >
              <ParticipantTile className="h-full w-full" />
            </TrackLoop>

          </div>

          {/* Camera Strip */}
          {cameraTracks.length > 0 && (
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
          )}

        </div>

      </div>
    );
  }

  // Empty state
  if (participantCount === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 px-6 pb-28">

        <div className="max-w-md text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-600/15">

            <div className="h-10 w-10 rounded-full bg-violet-600" />

          </div>

          <h2 className="mt-6 text-2xl font-bold text-white">
            Waiting for others to join
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Share the meeting code or invite link and participants will appear here automatically.
          </p>

        </div>

      </div>
    );
  }

  // One participant
  if (participantCount === 1) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 p-3 pb-28 sm:p-5 sm:pb-32 lg:p-8 lg:pb-36">

        <div className="h-full w-full max-h-[720px] max-w-5xl">

          <TrackLoop
            tracks={cameraTracks}
          >
            {(trackRef) => (
              <VideoTile
                trackRef={trackRef}
              />
            )}
          </TrackLoop>

        </div>

      </div>
    );
  }

  // Multiple participants
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
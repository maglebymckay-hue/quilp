import {
  useParticipants,
} from "@livekit/components-react";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  UserX,
  PhoneOff,
  Hand,
} from "lucide-react";

import {
  Track,
} from "livekit-client";

import Avatar from "./ui/Avatar";

import {
  muteParticipant,
  removeParticipant,
  endMeeting,
} from "../../services/hostControlService";

function ParticipantSidebar({
  roomCode,
  hostId,
  currentUser,
  raisedHands = new Set(),
}) {
  const participants =
    useParticipants();

  const viewerIsHost =
    currentUser?.id === hostId;

  async function handleMute(
    participant
  ) {
    try {
      const microphone =
        participant.getTrackPublication(
          Track.Source.Microphone
        );

      if (
        !microphone?.trackSid
      ) {
        alert(
          "This participant does not have a microphone track."
        );

        return;
      }

      await muteParticipant(
        roomCode,
        participant.identity,
        microphone.trackSid
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async function handleRemove(
    participant
  ) {
    const confirmed =
      window.confirm(
        `Remove ${
          participant.name ||
          participant.identity
        } from the meeting?`
      );

    if (!confirmed) return;

    try {
      await removeParticipant(
        roomCode,
        participant.identity
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async function handleEndMeeting() {
    const confirmed =
      window.confirm(
        "End this meeting for everyone?"
      );

    if (!confirmed) return;

    try {
      await endMeeting(
        roomCode
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <aside className="flex h-full w-80 flex-col border-r border-zinc-800 bg-zinc-950">

      {/* Header */}

      <div className="border-b border-zinc-800 p-5">

        <h2 className="text-xl font-bold text-white">
          Participants
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          {participants.length} connected
        </p>

      </div>

      {/* Participants */}

      <div className="flex-1 space-y-3 overflow-y-auto p-4">

        {participants.map(
          (participant) => {
            const name =
              participant.name ||
              participant.identity ||
              "Guest";

            const isHost =
              participant.identity ===
              hostId;

            const isMe =
              participant.identity ===
              currentUser?.id;

            const canModerate =
              viewerIsHost &&
              !isMe;

            const hasRaisedHand =
              raisedHands.has(
                participant.identity
              );

            return (
              <div
                key={
                  participant.identity
                }
                className={`
                  rounded-2xl
                  border
                  bg-zinc-900
                  p-4
                  transition
                  ${
                    hasRaisedHand
                      ? "border-yellow-500/70"
                      : "border-zinc-800"
                  }
                `}
              >

                <div className="flex items-center gap-3">

                  <Avatar
                    name={name}
                  />

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-2">

                      <p className="truncate font-semibold text-white">
                        {name}
                      </p>

                      {isHost && (
                        <span className="text-xs text-zinc-400">
                          Host
                        </span>
                      )}

                      {isMe && (
                        <span className="text-xs text-violet-400">
                          You
                        </span>
                      )}

                    </div>

                    <div className="mt-1 flex items-center gap-3">

                      {participant.isMicrophoneEnabled ? (
                        <Mic
                          size={14}
                          className="text-green-400"
                        />
                      ) : (
                        <MicOff
                          size={14}
                          className="text-red-400"
                        />
                      )}

                      {participant.isCameraEnabled ? (
                        <Video
                          size={14}
                          className="text-green-400"
                        />
                      ) : (
                        <VideoOff
                          size={14}
                          className="text-red-400"
                        />
                      )}

                      {hasRaisedHand && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-yellow-400">
                          <Hand
                            size={14}
                          />
                          Raised
                        </div>
                      )}

                    </div>

                  </div>

                </div>

                {canModerate && (
                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <button
                      onClick={() =>
                        handleMute(
                          participant
                        )
                      }
                      disabled={
                        !participant.isMicrophoneEnabled
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800 px-3 py-2 text-sm text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <MicOff
                        size={15}
                      />
                      Mute
                    </button>

                    <button
                      onClick={() =>
                        handleRemove(
                          participant
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
                    >
                      <UserX
                        size={15}
                      />
                      Remove
                    </button>

                  </div>
                )}

              </div>
            );
          }
        )}

      </div>

      {viewerIsHost && (
        <div className="border-t border-zinc-800 p-4">

          <button
            onClick={
              handleEndMeeting
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-500"
          >
            <PhoneOff
              size={18}
            />
            End Meeting
          </button>

        </div>
      )}

    </aside>
  );
}

export default ParticipantSidebar;
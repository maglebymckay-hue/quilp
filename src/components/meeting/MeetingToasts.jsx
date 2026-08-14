import { useEffect, useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

function MeetingToasts() {
  const room = useRoomContext();

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function addToast(message) {
      const id = `${Date.now()}-${Math.random()}`;

      setToasts((current) => [
        ...current,
        {
          id,
          message,
        },
      ]);

      setTimeout(() => {
        setToasts((current) =>
          current.filter(
            (toast) => toast.id !== id
          )
        );
      }, 3000);
    }

    function handleParticipantConnected(participant) {
      const name =
        participant.name ||
        participant.identity ||
        "Someone";

      addToast(`${name} joined the meeting`);
    }

    function handleParticipantDisconnected(participant) {
      const name =
        participant.name ||
        participant.identity ||
        "Someone";

      addToast(`${name} left the meeting`);
    }

    room.on(
      RoomEvent.ParticipantConnected,
      handleParticipantConnected
    );

    room.on(
      RoomEvent.ParticipantDisconnected,
      handleParticipantDisconnected
    );

    return () => {
      room.off(
        RoomEvent.ParticipantConnected,
        handleParticipantConnected
      );

      room.off(
        RoomEvent.ParticipantDisconnected,
        handleParticipantDisconnected
      );
    };
  }, [room]);

  return (
    <div className="pointer-events-none fixed right-6 top-24 z-[100] flex w-80 flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-2xl border border-zinc-700 bg-zinc-900/95 px-5 py-4 text-sm font-medium text-white shadow-2xl backdrop-blur-xl"
        >
          <span className="mr-2 text-violet-400">
            ●
          </span>

          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default MeetingToasts;
import { useParticipants } from "@livekit/components-react";
import ParticipantCard from "./ParticipantCard";

function ParticipantSidebar() {
  const participants = useParticipants();

  return (
    <aside className="w-80 border-r border-zinc-800 bg-zinc-950 p-5 overflow-y-auto">

      <h2 className="text-xl font-bold text-white mb-5">
        Participants ({participants.length})
      </h2>

      <div className="space-y-3">

        {participants.map((participant) => {

          const displayName =
            participant.name ||
            participant.identity ||
            "Guest";

          return (
            <ParticipantCard
              key={participant.identity}
              name={displayName}
              email={participant.identity}
              isHost={participant.identity === participants[0]?.identity}
              isLocal={participant.isLocal}
            />
          );
        })}

      </div>

    </aside>
  );
}

export default ParticipantSidebar;
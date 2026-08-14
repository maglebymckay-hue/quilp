import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";

function ParticipantCard({
  name = "Guest",
  isHost = false,
  isLocal = false,
  micOn = true,
  cameraOn = true,
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-3 transition-all duration-200 hover:border-violet-500 hover:bg-zinc-800">

      <div className="flex items-center gap-3">

        <Avatar name={name} />

        <div>
          <div className="flex items-center gap-2">

            <h3 className="font-semibold text-white">
              {name}
            </h3>

            {isLocal && (
              <Badge>You</Badge>
            )}

          </div>

          <p className="text-xs text-zinc-400">
            {micOn ? "Mic on" : "Muted"}
            {" • "}
            {cameraOn ? "Camera on" : "Camera off"}
          </p>
        </div>

      </div>

      {isHost && (
        <Badge>Host</Badge>
      )}

    </div>
  );
}

export default ParticipantCard;
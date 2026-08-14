import { useEffect, useState } from "react";
import { Copy, Check, Users, Video } from "lucide-react";
import { useParticipants } from "@livekit/components-react";

function MeetingHeader({ code }) {
  const participants = useParticipants();

  const [copied, setCopied] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function copyInviteLink() {
    try {
      const inviteLink =
        `${window.location.origin}/waiting/${code}`;

      await navigator.clipboard.writeText(inviteLink);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy invite error:", error);
    }
  }

  const hours = String(
    Math.floor(seconds / 3600)
  ).padStart(2, "0");

  const minutes = String(
    Math.floor((seconds % 3600) / 60)
  ).padStart(2, "0");

  const secs = String(
    seconds % 60
  ).padStart(2, "0");

  return (
    <header className="flex h-20 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-8">

      <div className="flex items-center gap-3">

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600">
          <Video
            size={21}
            className="text-white"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">
            Quilp
          </h1>

          <p className="text-xs text-zinc-500">
            Connect instantly.
          </p>
        </div>

      </div>

      <div className="flex items-center gap-6">

        <div className="text-right">
          <p className="text-xs text-zinc-500">
            Duration
          </p>

          <p className="font-semibold text-white">
            {hours}:{minutes}:{secs}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-zinc-500">
            Participants
          </p>

          <div className="flex items-center justify-end gap-2 text-white">
            <Users size={16} />

            <span className="font-semibold">
              {participants.length}
            </span>
          </div>
        </div>

        <button
          onClick={copyInviteLink}
          className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-3 transition hover:border-violet-500"
        >
          <div className="text-left">
            <p className="text-xs text-zinc-500">
              Meeting Code
            </p>

            <p className="font-bold text-white">
              {code}
            </p>
          </div>

          {copied ? (
            <Check
              size={18}
              className="text-green-400"
            />
          ) : (
            <Copy
              size={18}
              className="text-zinc-400"
            />
          )}
        </button>

      </div>

    </header>
  );
}

export default MeetingHeader;
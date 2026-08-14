import { useEffect, useState } from "react";
import { Copy, Check, Users, Video } from "lucide-react";
import { useParticipants } from "@livekit/components-react";

function MeetingHeader({ code }) {
  const participants = useParticipants();

  const [copied, setCopied] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function copyMeetingCode() {
    await navigator.clipboard.writeText(code);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <header className="h-20 border-b border-zinc-800 bg-zinc-950 px-8 flex items-center justify-between">

      {/* Logo */}

      <div className="flex items-center gap-3">

        <div className="h-12 w-12 rounded-2xl bg-violet-600 flex items-center justify-center">

          <Video className="text-white" size={22} />

        </div>

        <div>

          <h1 className="text-2xl font-bold text-white">
            Quilp
          </h1>

          <p className="text-xs text-zinc-500">
            Connect Instantly
          </p>

        </div>

      </div>

      {/* Meeting Info */}

      <div className="flex items-center gap-6">

        <div className="text-right">

          <p className="text-xs text-zinc-500">
            Duration
          </p>

          <p className="text-white font-semibold">
            {hours}:{minutes}:{secs}
          </p>

        </div>

        <div className="text-right">

          <p className="text-xs text-zinc-500">
            Participants
          </p>

          <p className="text-white font-semibold flex items-center justify-end gap-2">
            <Users size={16} />
            {participants.length}
          </p>

        </div>

        <button
          onClick={copyMeetingCode}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 hover:border-violet-500 transition flex items-center gap-3"
        >

          <div className="text-left">

            <p className="text-xs text-zinc-500">
              Meeting Code
            </p>

            <p className="text-white font-bold">
              {code}
            </p>

          </div>

          {copied ? (
            <Check className="text-green-400" size={18} />
          ) : (
            <Copy className="text-zinc-400" size={18} />
          )}

        </button>

      </div>

    </header>
  );
}

export default MeetingHeader;
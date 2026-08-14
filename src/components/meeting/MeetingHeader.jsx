import {
  useEffect,
  useState,
} from "react";

import {
  Copy,
  Check,
  Users,
  Video,
} from "lucide-react";

import {
  useParticipants,
} from "@livekit/components-react";

function MeetingHeader({ code }) {
  const participants =
    useParticipants();

  const [copied, setCopied] =
    useState(false);

  const [seconds, setSeconds] =
    useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(
        (current) => current + 1
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, []);

  async function copyInviteLink() {
    try {
      const inviteLink =
        `${window.location.origin}/waiting/${code}`;

      await navigator.clipboard.writeText(
        inviteLink
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy invite error:",
        error
      );
    }
  }

  const hours = String(
    Math.floor(seconds / 3600)
  ).padStart(2, "0");

  const minutes = String(
    Math.floor(
      (seconds % 3600) / 60
    )
  ).padStart(2, "0");

  const secs = String(
    seconds % 60
  ).padStart(2, "0");

  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950 px-3 py-3 sm:px-5 lg:h-20 lg:px-8">

      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 lg:h-11 lg:w-11 lg:rounded-2xl">
          <Video
            size={20}
            className="text-white"
          />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-white sm:text-xl lg:text-2xl">
            Quilp
          </h1>

          <p className="hidden text-xs text-zinc-500 sm:block">
            Connect instantly.
          </p>
        </div>

      </div>

      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">

        <div className="hidden text-right sm:block">
          <p className="text-[10px] text-zinc-500 lg:text-xs">
            Duration
          </p>

          <p className="text-sm font-semibold text-white lg:text-base">
            {hours}:{minutes}:{secs}
          </p>
        </div>

        <div className="hidden text-right md:block">
          <p className="text-[10px] text-zinc-500 lg:text-xs">
            Participants
          </p>

          <div className="flex items-center justify-end gap-2 text-white">
            <Users size={15} />

            <span className="text-sm font-semibold lg:text-base">
              {participants.length}
            </span>
          </div>
        </div>

        <button
          onClick={copyInviteLink}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 transition hover:border-violet-500 lg:rounded-2xl lg:px-5 lg:py-3"
        >
          <div className="text-left">
            <p className="hidden text-xs text-zinc-500 lg:block">
              Meeting Code
            </p>

            <p className="max-w-[110px] truncate text-xs font-bold text-white sm:text-sm lg:text-base">
              {code}
            </p>
          </div>

          {copied ? (
            <Check
              size={17}
              className="shrink-0 text-green-400"
            />
          ) : (
            <Copy
              size={17}
              className="shrink-0 text-zinc-400"
            />
          )}
        </button>

      </div>

    </header>
  );
}

export default MeetingHeader;
import {
  useEffect,
  useState,
} from "react";

import {
  useDataChannel,
} from "@livekit/components-react";

import {
  Hand,
  Smile,
  X,
} from "lucide-react";

const reactions = [
  "👍",
  "👏",
  "❤️",
  "😂",
  "🎉",
];

function ReactionBar({
  open,
  onClose,
}) {
  const [floatingReactions, setFloatingReactions] =
    useState([]);

  const {
    send,
  } = useDataChannel(
    "quilp-reaction",
    (message) => {
      try {
        const text = new TextDecoder().decode(
          message.payload
        );

        const data = JSON.parse(text);

        showReaction(data);
      } catch (error) {
        console.error(
          "Reaction receive error:",
          error
        );
      }
    }
  );

  function showReaction(data) {
    const id =
      `${Date.now()}-${Math.random()}`;

    setFloatingReactions((current) => [
      ...current,
      {
        ...data,
        id,
      },
    ]);

    setTimeout(() => {
      setFloatingReactions((current) =>
        current.filter(
          (reaction) =>
            reaction.id !== id
        )
      );
    }, 3000);
  }

  async function sendReaction(emoji) {
    const payload = {
      type: "reaction",
      emoji,
    };

    try {
      await send(
        new TextEncoder().encode(
          JSON.stringify(payload)
        ),
        {
          reliable: false,
        }
      );

      showReaction(payload);
    } catch (error) {
      console.error(
        "Send reaction error:",
        error
      );
    }
  }

  async function raiseHand() {
    const payload = {
      type: "hand",
      emoji: "✋",
    };

    try {
      await send(
        new TextEncoder().encode(
          JSON.stringify(payload)
        ),
        {
          reliable: true,
        }
      );

      showReaction(payload);
    } catch (error) {
      console.error(
        "Raise hand error:",
        error
      );
    }
  }

  return (
    <>
      {/* Floating reactions */}

      <div className="pointer-events-none fixed bottom-32 right-8 z-[70] flex flex-col gap-3">

        {floatingReactions.map(
          (reaction) => (
            <div
              key={reaction.id}
              className="animate-bounce rounded-full border border-zinc-700 bg-zinc-900/90 px-5 py-3 text-3xl shadow-2xl backdrop-blur-xl"
            >
              {reaction.emoji}
            </div>
          )
        )}

      </div>

      {/* Reaction menu */}

      {open && (
        <div className="fixed bottom-32 left-1/2 z-[60] -translate-x-1/2">

          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl">

            <div className="mb-3 flex items-center justify-between gap-8">

              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Smile size={17} />
                Reactions
              </div>

              <button
                onClick={onClose}
                className="text-zinc-500 transition hover:text-white"
              >
                <X size={17} />
              </button>

            </div>

            <div className="flex items-center gap-2">

              {reactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() =>
                    sendReaction(emoji)
                  }
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-2xl transition hover:scale-110 hover:bg-zinc-700"
                >
                  {emoji}
                </button>
              ))}

              <div className="mx-2 h-9 w-px bg-zinc-700" />

              <button
                onClick={raiseHand}
                className="flex h-12 items-center gap-2 rounded-xl bg-violet-600 px-4 font-semibold text-white transition hover:bg-violet-500"
              >
                <Hand size={18} />
                Raise
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}

export default ReactionBar;
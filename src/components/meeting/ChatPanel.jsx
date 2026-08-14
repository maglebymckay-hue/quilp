import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Send,
  X,
} from "lucide-react";

import supabase from "../../lib/supabase";

import {
  loadMessages,
  sendMessage,
} from "../../services/chatService";

function ChatPanel({
  meetingId,
  currentUser,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!meetingId) return;

    let channel = null;
    let cancelled = false;

    async function initializeChat() {
      try {
        const existingMessages =
          await loadMessages(meetingId);

        if (cancelled) return;

        setMessages(existingMessages);
      } catch (error) {
        console.error(
          "Load messages error:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }

      channel = supabase
        .channel(`chat-panel-${meetingId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `meeting_id=eq.${meetingId}`,
          },
          (payload) => {
            setMessages((currentMessages) => {
              const exists =
                currentMessages.some(
                  (message) =>
                    message.id === payload.new.id
                );

              if (exists) {
                return currentMessages;
              }

              return [
                ...currentMessages,
                payload.new,
              ];
            });
          }
        )
        .subscribe();
    }

    initializeChat();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [meetingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSendMessage() {
    const cleanedMessage =
      messageText.trim();

    if (
      !cleanedMessage ||
      !currentUser?.id
    ) {
      return;
    }

    try {
      await sendMessage({
        meetingId,
        senderId: currentUser.id,
        message: cleanedMessage,
      });

      setMessageText("");
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      alert(error.message);
    }
  }

  return (
    <aside className="flex h-full w-96 flex-col border-l border-zinc-800 bg-zinc-950">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-5">

        <div>
          <h2 className="text-xl font-bold text-white">
            Chat
          </h2>

          <p className="text-xs text-zinc-500">
            Meeting messages
          </p>
        </div>

        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <X size={19} />
        </button>

      </div>

      {/* Messages */}

      <div className="flex-1 overflow-y-auto p-5">

        {loading && (
          <div className="mt-10 text-center text-sm text-zinc-500">
            Loading messages...
          </div>
        )}

        {!loading &&
          messages.length === 0 && (
            <div className="mt-10 text-center">

              <p className="text-sm font-medium text-zinc-400">
                No messages yet
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                Start the conversation.
              </p>

            </div>
          )}

        <div className="space-y-4">

          {messages.map((message) => {
            const isMe =
              message.sender_id ===
              currentUser?.id;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isMe
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`
                    max-w-[82%]
                    rounded-2xl
                    px-4
                    py-3
                    ${
                      isMe
                        ? "rounded-br-md bg-violet-600 text-white"
                        : "rounded-bl-md bg-zinc-900 text-zinc-100"
                    }
                  `}
                >

                  {isMe && (
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                      You
                    </p>
                  )}

                  <p className="break-words text-sm">
                    {message.message}
                  </p>

                  <p
                    className={`
                      mt-1
                      text-[10px]
                      ${
                        isMe
                          ? "text-violet-200"
                          : "text-zinc-500"
                      }
                    `}
                  >
                    {new Date(
                      message.created_at
                    ).toLocaleTimeString(
                      [],
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )}
                  </p>

                </div>

              </div>
            );
          })}

          <div ref={messagesEndRef} />

        </div>

      </div>

      {/* Message Input */}

      <div className="border-t border-zinc-800 p-4">

        <div className="flex items-end gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 focus-within:border-violet-500">

          <textarea
            value={messageText}
            onChange={(event) =>
              setMessageText(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="max-h-28 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
          />

          <button
            onClick={handleSendMessage}
            disabled={
              !messageText.trim()
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={18} />
          </button>

        </div>

        <p className="mt-2 text-center text-[10px] text-zinc-600">
          Enter to send • Shift + Enter for a new line
        </p>

      </div>

    </aside>
  );
}

export default ChatPanel;
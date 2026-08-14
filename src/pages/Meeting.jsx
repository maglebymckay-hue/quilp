import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  LiveKitRoom,
  RoomAudioRenderer,
} from "@livekit/components-react";

import "@livekit/components-styles";

import supabase from "../lib/supabase";
import { getLiveKitToken } from "../services/livekitService";

import MeetingHeader from "../components/meeting/MeetingHeader";
import ParticipantSidebar from "../components/meeting/ParticipantSidebar";
import CameraGrid from "../components/meeting/CameraGrid";
import BottomToolbar from "../components/meeting/BottomToolbar";
import ChatPanel from "../components/meeting/ChatPanel";
import ReactionBar from "../components/meeting/ReactionBar";
import MeetingToasts from "../components/meeting/MeetingToasts";
import SettingsPanel from "../components/meeting/SettingsPanel";

function Meeting() {
  const { code } = useParams();
  const navigate = useNavigate();

  const searchParams =
    new URLSearchParams(window.location.search);

  const displayName =
    searchParams.get("name") || "Guest";

  const videoEnabled =
    searchParams.get("video") === "true";

  const audioEnabled =
    searchParams.get("audio") === "true";

  const [token, setToken] =
    useState("");

  const [serverUrl, setServerUrl] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [user, setUser] =
    useState(null);

  const [meeting, setMeeting] =
    useState(null);

  const [chatOpen, setChatOpen] =
    useState(false);

  const [
    unreadChatCount,
    setUnreadChatCount,
  ] = useState(0);

  const [
    reactionsOpen,
    setReactionsOpen,
  ] = useState(false);

  const [
    peopleOpen,
    setPeopleOpen,
  ] = useState(true);

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  const [
    raisedHands,
    setRaisedHands,
  ] = useState(() => new Set());

  useEffect(() => {
    initializeMeeting();
  }, []);

  async function initializeMeeting() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "You must be logged in."
        );
      }

      setUser(user);

      const {
        data: meetingData,
        error: meetingError,
      } = await supabase
        .from("meetings")
        .select("*")
        .eq("code", code)
        .single();

      if (
        meetingError ||
        !meetingData
      ) {
        throw new Error(
          "Could not find this meeting."
        );
      }

      if (!meetingData.active) {
        throw new Error(
          "This meeting has ended."
        );
      }

      setMeeting(meetingData);

      const response =
        await getLiveKitToken(
          code,
          user.id,
          displayName
        );

      setToken(response.token);
      setServerUrl(response.url);

    } catch (error) {
      console.error(
        "Meeting initialization error:",
        error
      );

      alert(error.message);
      navigate("/home");

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      !meeting?.id ||
      !user?.id
    ) {
      return;
    }

    const channel = supabase
      .channel(
        `unread-chat-${meeting.id}`
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter:
            `meeting_id=eq.${meeting.id}`,
        },
        (payload) => {
          const message =
            payload.new;

          if (
            message.sender_id ===
            user.id
          ) {
            return;
          }

          if (!chatOpen) {
            setUnreadChatCount(
              (current) =>
                current + 1
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [
    meeting?.id,
    user?.id,
    chatOpen,
  ]);

  function handleDisconnected() {
    navigate("/home");
  }

  function handleHandChange(
    identity,
    raised
  ) {
    setRaisedHands(
      (current) => {
        const next =
          new Set(current);

        if (raised) {
          next.add(identity);
        } else {
          next.delete(identity);
        }

        return next;
      }
    );
  }

  function toggleChat() {
    setChatOpen(
      (current) => {
        const next = !current;

        if (next) {
          setUnreadChatCount(0);
        }

        return next;
      }
    );

    setReactionsOpen(false);
    setSettingsOpen(false);
  }

  function toggleReactions() {
    setReactionsOpen(
      (current) => !current
    );

    setChatOpen(false);
    setSettingsOpen(false);
  }

  function togglePeople() {
    setPeopleOpen(
      (current) => !current
    );
  }

  function toggleSettings() {
    setSettingsOpen(
      (current) => !current
    );

    setChatOpen(false);
    setReactionsOpen(false);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">

        <div className="text-center">

          <div className="mx-auto mb-5 h-12 w-12 animate-pulse rounded-2xl bg-violet-600" />

          <h1 className="text-3xl font-bold text-violet-500">
            Quilp
          </h1>

          <p className="mt-3 text-zinc-400">
            Connecting to meeting...
          </p>

        </div>

      </div>
    );
  }

  if (
    !token ||
    !serverUrl ||
    !meeting ||
    !user
  ) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">

        <h1 className="text-xl font-semibold text-red-400">
          Failed to connect to the meeting.
        </h1>

      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={videoEnabled}
      audio={audioEnabled}
      onDisconnected={
        handleDisconnected
      }
      className="h-screen w-screen bg-zinc-950"
    >
      <RoomAudioRenderer />

      <MeetingToasts />

      <div className="relative flex h-screen overflow-hidden">

        {/* Desktop People Sidebar */}
        {peopleOpen && (
          <div className="hidden lg:block">
            <ParticipantSidebar
              roomCode={code}
              hostId={meeting.host}
              currentUser={user}
              raisedHands={raisedHands}
            />
          </div>
        )}

        {/* Mobile / Tablet People Overlay */}
        {peopleOpen && (
          <div className="absolute inset-y-0 left-0 z-[80] block lg:hidden">

            <ParticipantSidebar
              roomCode={code}
              hostId={meeting.host}
              currentUser={user}
              raisedHands={raisedHands}
            />

          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">

          <MeetingHeader
            code={code}
          />

          <div className="relative flex min-h-0 flex-1">

            <div className="min-w-0 flex-1">
              <CameraGrid />
            </div>

            {/* Desktop Panels */}
            <div className="hidden lg:block">

              {chatOpen && (
                <ChatPanel
                  meetingId={meeting.id}
                  currentUser={user}
                  onClose={() =>
                    setChatOpen(false)
                  }
                />
              )}

              {settingsOpen && (
                <SettingsPanel
                  onClose={() =>
                    setSettingsOpen(false)
                  }
                />
              )}

            </div>

            {/* Mobile / Tablet Panels */}
            {(chatOpen ||
              settingsOpen) && (
              <div className="absolute inset-0 z-[75] flex justify-end bg-black/40 backdrop-blur-sm lg:hidden">

                {chatOpen && (
                  <div className="h-full w-full max-w-sm">

                    <ChatPanel
                      meetingId={meeting.id}
                      currentUser={user}
                      onClose={() =>
                        setChatOpen(false)
                      }
                    />

                  </div>
                )}

                {settingsOpen && (
                  <div className="h-full w-full max-w-sm">

                    <SettingsPanel
                      onClose={() =>
                        setSettingsOpen(false)
                      }
                    />

                  </div>
                )}

              </div>
            )}

          </div>

          <BottomToolbar
            chatOpen={chatOpen}
            reactionsOpen={
              reactionsOpen
            }
            peopleOpen={
              peopleOpen
            }
            settingsOpen={
              settingsOpen
            }
            unreadChatCount={
              unreadChatCount
            }
            onToggleChat={
              toggleChat
            }
            onToggleReactions={
              toggleReactions
            }
            onTogglePeople={
              togglePeople
            }
            onToggleSettings={
              toggleSettings
            }
          />

          <ReactionBar
            open={reactionsOpen}
            onClose={() =>
              setReactionsOpen(false)
            }
            onHandChange={
              handleHandChange
            }
          />

        </div>

      </div>

    </LiveKitRoom>
  );
}

export default Meeting;
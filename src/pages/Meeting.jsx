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

import {
  getLiveKitToken,
} from "../services/livekitService";

import MeetingHeader from "../components/meeting/MeetingHeader";
import ParticipantSidebar from "../components/meeting/ParticipantSidebar";
import CameraGrid from "../components/meeting/CameraGrid";
import BottomToolbar from "../components/meeting/BottomToolbar";
import ChatPanel from "../components/meeting/ChatPanel";
import ReactionBar from "../components/meeting/ReactionBar";

function Meeting() {
  const { code } = useParams();

  const navigate = useNavigate();

  const searchParams =
    new URLSearchParams(
      window.location.search
    );

  const displayName =
    searchParams.get("name") ||
    "Guest";

  const videoEnabled =
    searchParams.get("video") ===
    "true";

  const audioEnabled =
    searchParams.get("audio") ===
    "true";

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
    reactionsOpen,
    setReactionsOpen,
  ] = useState(false);

  useEffect(() => {
    initializeMeeting();
  }, []);

  async function initializeMeeting() {
    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

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

  function handleDisconnected() {
    navigate("/home");
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">

        <div className="text-center">

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

      <div className="flex h-screen overflow-hidden">

        <ParticipantSidebar
          roomCode={code}
          hostId={meeting.host}
          currentUser={user}
        />

        <div className="flex min-w-0 flex-1 flex-col">

          <MeetingHeader
            code={code}
          />

          <div className="flex min-h-0 flex-1">

            <div className="min-w-0 flex-1">
              <CameraGrid />
            </div>

            {chatOpen && (
              <ChatPanel
                meetingId={meeting.id}
                currentUser={user}
                onClose={() =>
                  setChatOpen(false)
                }
              />
            )}

          </div>

          <BottomToolbar
            chatOpen={chatOpen}
            reactionsOpen={
              reactionsOpen
            }
            onToggleChat={() => {
              setChatOpen(
                (current) =>
                  !current
              );

              setReactionsOpen(
                false
              );
            }}
            onToggleReactions={() => {
              setReactionsOpen(
                (current) =>
                  !current
              );

              setChatOpen(false);
            }}
          />

          <ReactionBar
            open={reactionsOpen}
            onClose={() =>
              setReactionsOpen(false)
            }
          />

        </div>

      </div>

    </LiveKitRoom>
  );
}

export default Meeting;
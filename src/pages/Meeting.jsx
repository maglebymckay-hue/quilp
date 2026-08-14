import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import supabase from "../lib/supabase";
import { getLiveKitToken } from "../services/livekitservice";

import {
  LiveKitRoom,
  RoomAudioRenderer,
} from "@livekit/components-react";

import "@livekit/components-styles";

import MeetingHeader from "../components/meeting/MeetingHeader";
import ParticipantSidebar from "../components/meeting/ParticipantSidebar";
import CameraGrid from "../components/meeting/CameraGrid";
import BottomToolbar from "../components/meeting/BottomToolbar";

function Meeting() {
  const { code } = useParams();

  const searchParams = new URLSearchParams(window.location.search);

  const displayName =
    searchParams.get("name") || "Guest";

  const videoEnabled =
    searchParams.get("video") === "true";

  const audioEnabled =
    searchParams.get("audio") === "true";

  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    joinMeeting();
  }, []);

  async function joinMeeting() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in.");
      }

      const response = await getLiveKitToken(
        code,
        user.id,
        displayName
      );

      setToken(response.token);
      setServerUrl(response.url);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <h1 className="text-white text-2xl font-bold">
          Connecting to Quilp...
        </h1>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <h1 className="text-red-500 text-2xl font-bold">
          Failed to connect.
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
      className="h-screen w-screen bg-zinc-950"
    >
      <RoomAudioRenderer />

      <div className="flex h-screen">

        <ParticipantSidebar />

        <div className="flex flex-1 flex-col">

          <MeetingHeader code={code} />

          <div className="flex-1 overflow-hidden">
            <CameraGrid />
          </div>

          <BottomToolbar />

        </div>

      </div>

    </LiveKitRoom>
  );
}

export default Meeting;
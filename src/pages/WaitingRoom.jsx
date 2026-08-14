import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import Avatar from "../components/meeting/ui/Avatar";
import { Copy, Play } from "lucide-react";

function WaitingRoom() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let channel = null;
    let cancelled = false;

    async function initializeRoom() {
      // Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      setUser(user);

      // Find meeting
      const { data: meetingData, error: meetingError } = await supabase
        .from("meetings")
        .select("*")
        .eq("code", code)
        .single();

      if (cancelled) return;

      if (meetingError || !meetingData) {
        console.error("Meeting load error:", meetingError);
        alert("Meeting not found.");
        navigate("/home");
        return;
      }

      setMeeting(meetingData);

      // Load participants
      await loadParticipants(meetingData.id);

      if (cancelled) return;

      // Subscribe to participant changes
      channel = supabase
        .channel(`participants-${meetingData.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "participants",
            filter: `meeting_id=eq.${meetingData.id}`,
          },
          () => {
            loadParticipants(meetingData.id);
          }
        )
        .subscribe();
    }

    initializeRoom();

    // IMPORTANT:
    // Remove the old realtime subscription when React reloads/unmounts.
    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [code, navigate]);

  async function loadParticipants(meetingId) {
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("meeting_id", meetingId);

    if (error) {
      console.error("Participant load error:", error);
      return;
    }

    setParticipants(data || []);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      alert("Meeting code copied!");
    } catch (error) {
      console.error("Copy error:", error);
    }
  }

  function startMeeting() {
    navigate(`/prejoin/${code}`);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="w-full max-w-xl bg-zinc-900 rounded-3xl p-10 border border-zinc-800">

        <h1 className="text-4xl font-bold">
          Waiting Room
        </h1>

        <p className="text-zinc-400 mt-2">
          Meeting Code
        </p>

        <div className="flex gap-3 mt-3">
          <div className="flex-1 bg-zinc-800 rounded-xl p-4 text-2xl font-bold">
            {code}
          </div>

          <button
            onClick={copyCode}
            className="bg-violet-600 hover:bg-violet-500 rounded-xl px-5 transition"
          >
            <Copy size={20} />
          </button>
        </div>

        <h2 className="mt-10 text-xl font-bold">
          Participants ({participants.length})
        </h2>

        <div className="space-y-3 mt-5">
          {participants.map((person) => {
            const displayName =
              person.display_name ||
              person.name ||
              "Participant";

            return (
              <div
                key={person.id}
                className="bg-zinc-800 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Avatar name={displayName} />

                  <span className="text-lg font-medium">
                    {displayName}
                  </span>
                </div>

                {person.is_host && (
                  <span className="text-sm text-zinc-400">
                    Host
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {meeting?.host === user?.id && (
          <button
            onClick={startMeeting}
            className="mt-10 w-full bg-violet-600 hover:bg-violet-500 p-4 rounded-xl flex items-center justify-center gap-3 font-bold transition"
          >
            <Play size={20} />
            Start Meeting
          </button>
        )}

      </div>
    </div>
  );
}

export default WaitingRoom;
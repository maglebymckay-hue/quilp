import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";

import supabase from "../lib/supabase";
import { createMeeting } from "../services/meetingService";

function Home() {
  const navigate = useNavigate();

  const [meetingCode, setMeetingCode] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  }

  async function handleStartMeeting() {
    try {
      const meeting = await createMeeting();

      navigate(`/waiting/${meeting.code}`);
    } catch (error) {
      console.error("Create meeting error:", error);
      alert(error.message);
    }
  }

  async function handleJoinMeeting() {
    const code = meetingCode.trim().toUpperCase();

    if (!code) {
      alert("Enter a meeting code.");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You need to log in first.");
        navigate("/");
        return;
      }

      // Find meeting
      const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .select("*")
        .eq("code", code)
        .eq("active", true)
        .single();

      if (meetingError || !meeting) {
        alert("Meeting not found.");
        return;
      }

      // Check whether user already joined
      const { data: existingParticipant } = await supabase
        .from("participants")
        .select("id")
        .eq("meeting_id", meeting.id)
        .eq("user_id", user.id)
        .maybeSingle();

      // Add participant if needed
      if (!existingParticipant) {
        const { error: participantError } = await supabase
          .from("participants")
          .insert({
            meeting_id: meeting.id,
            user_id: user.id,
            is_host: meeting.host === user.id,
          });

        if (participantError) {
          console.error("Join participant error:", participantError);
          alert(participantError.message);
          return;
        }
      }

      navigate(`/waiting/${code}`);
    } catch (error) {
      console.error("Join meeting error:", error);
      alert("Could not join the meeting.");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-10 py-6">

        <h1 className="text-3xl font-bold text-violet-500">
          Quilp
        </h1>

        <div className="flex items-center gap-4">

          <div className="flex items-center gap-3 rounded-xl bg-zinc-900 px-4 py-2">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 font-bold">
              {user?.email?.charAt(0)?.toUpperCase() || "Q"}
            </div>

            <span className="hidden text-sm text-zinc-300 md:block">
              {user?.email}
            </span>

          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-zinc-800 px-5 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
          >
            Logout
          </button>

        </div>

      </header>

      {/* Main */}
      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24">

        <h2 className="text-center text-6xl font-bold">
          Connect instantly.
        </h2>

        <div className="mt-14 w-full max-w-xl">

          {/* Start */}
          <button
            onClick={handleStartMeeting}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-violet-600 px-6 py-5 text-lg font-bold transition hover:bg-violet-500"
          >
            <Plus size={22} />
            Start Meeting
          </button>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">

            <div className="h-px flex-1 bg-zinc-800" />

            <span className="text-sm text-zinc-500">
              OR
            </span>

            <div className="h-px flex-1 bg-zinc-800" />

          </div>

          {/* Join */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-7">

            <h3 className="text-2xl font-bold">
              Join Meeting
            </h3>

            <p className="mt-2 text-sm text-zinc-400">
              Enter the meeting code shared by the host.
            </p>

            <input
              value={meetingCode}
              onChange={(event) =>
                setMeetingCode(event.target.value.toUpperCase())
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleJoinMeeting();
                }
              }}
              placeholder="OCEAN-572"
              className="mt-6 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-4 text-lg font-semibold uppercase outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
            />

            <button
              onClick={handleJoinMeeting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-bold text-black transition hover:bg-zinc-200"
            >
              Join Meeting
              <ArrowRight size={19} />
            </button>

          </div>

        </div>

      </main>
    </div>
  );
}

export default Home;
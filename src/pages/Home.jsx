import { Plus, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import { createMeeting } from "../services/meetingservice";

function Home() {
  const navigate = useNavigate();

  const [meetingCode, setMeetingCode] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  }

  async function handleStartMeeting() {
    try {
      const meeting = await createMeeting();
      navigate(`/waiting/${meeting.code}`);
    } catch (err) {
      alert(err.message);
    }
  }

  function handleJoinMeeting() {
    if (!meetingCode.trim()) {
      alert("Please enter a meeting code.");
      return;
    }

    navigate(`/waiting/${meetingCode.toUpperCase()}`);
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Top Bar */}

      <header className="flex justify-between items-center px-10 py-6 border-b border-zinc-800">

        <h1 className="text-3xl font-bold text-violet-500">
          Quilp
        </h1>

        <div className="flex items-center gap-4">

          <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-xl">

            <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>

            <span className="text-sm">
              {user?.email}
            </span>

          </div>

          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-xl transition"
          >
            Logout
          </button>

        </div>

      </header>

      {/* Hero */}

      <main className="flex flex-col items-center justify-center text-center px-8 py-24">

        <h2 className="text-7xl font-bold mb-16">
          Connect instantly.
        </h2>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">

          {/* Start Meeting */}

          <button
            onClick={handleStartMeeting}
            className="bg-violet-600 hover:bg-violet-500 rounded-3xl p-12 text-left transition hover:scale-[1.02]"
          >

            <Plus size={60} />

            <h3 className="text-4xl font-bold mt-8">
              Start Meeting
            </h3>

          </button>

          {/* Join Meeting */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12">

            <h3 className="text-4xl font-bold">
              Join Meeting
            </h3>

            <input
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              placeholder="Meeting Code"
              className="w-full mt-10 bg-zinc-800 rounded-xl p-4 text-lg outline-none"
            />

            <button
              onClick={handleJoinMeeting}
              className="w-full mt-5 bg-white text-black rounded-xl p-4 font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition"
            >
              Join Meeting

              <ArrowRight size={20} />

            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Home;
import {
  Plus,
  ArrowRight,
  CalendarDays,
  Clock3,
  History,
  LogOut,
  Video,
  Users,
  Trash2,
  CalendarPlus,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import supabase from "../lib/supabase";

import {
  createMeeting,
} from "../services/meetingservice";

import {
  getScheduledMeetings,
  deleteScheduledMeeting,
} from "../services/scheduleService";

import {
  getMeetingHistory,
  deleteMeetingHistory,
} from "../services/historyService";

import ScheduleMeetingModal from "../components/ScheduleMeetingModal";

function Home() {
  const navigate = useNavigate();

  const [meetingCode, setMeetingCode] =
    useState("");

  const [user, setUser] =
    useState(null);

  const [
    scheduledMeetings,
    setScheduledMeetings,
  ] = useState([]);

  const [
    meetingHistory,
    setMeetingHistory,
  ] = useState([]);

  const [
    scheduleOpen,
    setScheduleOpen,
  ] = useState(false);

  const [
    loadingSchedule,
    setLoadingSchedule,
  ] = useState(true);

  const [
    loadingHistory,
    setLoadingHistory,
  ] = useState(true);

  useEffect(() => {
    initializeHome();
  }, []);

  async function initializeHome() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      setUser(user);

      await Promise.all([
        loadScheduledMeetings(user.id),
        loadHistory(user.id),
      ]);
    } catch (error) {
      console.error(
        "Home initialization error:",
        error
      );
    }
  }

  async function loadScheduledMeetings(
    userId
  ) {
    try {
      setLoadingSchedule(true);

      const meetings =
        await getScheduledMeetings(
          userId
        );

      setScheduledMeetings(
        meetings
      );
    } catch (error) {
      console.error(
        "Load scheduled meetings error:",
        error
      );
    } finally {
      setLoadingSchedule(false);
    }
  }

  async function loadHistory(userId) {
    try {
      setLoadingHistory(true);

      const history =
        await getMeetingHistory(
          userId
        );

      setMeetingHistory(
        history
      );
    } catch (error) {
      console.error(
        "Load meeting history error:",
        error
      );
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleStartMeeting() {
    try {
      const meeting =
        await createMeeting();

      navigate(
        `/waiting/${meeting.code}`
      );
    } catch (error) {
      console.error(
        "Create meeting error:",
        error
      );

      alert(error.message);
    }
  }

  async function handleJoinMeeting() {
    const code =
      meetingCode
        .trim()
        .toUpperCase();

    if (!code) {
      alert(
        "Please enter a meeting code."
      );
      return;
    }

    try {
      const {
        data: meeting,
        error,
      } = await supabase
        .from("meetings")
        .select("*")
        .eq("code", code)
        .eq("active", true)
        .single();

      if (
        error ||
        !meeting
      ) {
        alert(
          "Meeting not found or has ended."
        );

        return;
      }

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      const {
        data: existingParticipant,
      } = await supabase
        .from("participants")
        .select("id")
        .eq(
          "meeting_id",
          meeting.id
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();

      if (
        !existingParticipant
      ) {
        const {
          error:
            participantError,
        } = await supabase
          .from("participants")
          .insert({
            meeting_id:
              meeting.id,
            user_id:
              user.id,
            is_host:
              meeting.host ===
              user.id,
          });

        if (
          participantError
        ) {
          console.error(
            "Join participant error:",
            participantError
          );

          alert(
            participantError.message
          );

          return;
        }
      }

      navigate(
        `/waiting/${code}`
      );

    } catch (error) {
      console.error(
        "Join meeting error:",
        error
      );

      alert(
        "Could not join the meeting."
      );
    }
  }

  async function handleJoinScheduled(
    scheduledMeeting
  ) {
    try {
      const code =
        scheduledMeeting
          .meeting_code
          .toUpperCase();

      const {
        data: existingMeeting,
        error:
          existingMeetingError,
      } = await supabase
        .from("meetings")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (
        existingMeetingError
      ) {
        throw existingMeetingError;
      }

      if (existingMeeting) {
        navigate(
          `/waiting/${code}`
        );

        return;
      }

      const {
        data: newMeeting,
        error:
          createError,
      } = await supabase
        .from("meetings")
        .insert({
          code,
          host: user.id,
          active: true,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      const {
        error:
          participantError,
      } = await supabase
        .from("participants")
        .insert({
          meeting_id:
            newMeeting.id,
          user_id:
            user.id,
          is_host:
            true,
        });

      if (
        participantError
      ) {
        throw participantError;
      }

      navigate(
        `/waiting/${code}`
      );
    } catch (error) {
      console.error(
        "Join scheduled meeting error:",
        error
      );

      alert(
        error.message ||
          "Could not start the scheduled meeting."
      );
    }
  }

  async function handleDeleteScheduled(
    id
  ) {
    const confirmed =
      window.confirm(
        "Delete this scheduled meeting?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteScheduledMeeting(
        id
      );

      setScheduledMeetings(
        (current) =>
          current.filter(
            (meeting) =>
              meeting.id !== id
          )
      );
    } catch (error) {
      console.error(
        "Delete scheduled meeting error:",
        error
      );

      alert(error.message);
    }
  }

  async function handleDeleteHistory(
    id
  ) {
    const confirmed =
      window.confirm(
        "Delete this meeting from history?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMeetingHistory(
        id
      );

      setMeetingHistory(
        (current) =>
          current.filter(
            (meeting) =>
              meeting.id !== id
          )
      );
    } catch (error) {
      console.error(
        "Delete history error:",
        error
      );

      alert(error.message);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  function formatMeetingDate(
    dateValue
  ) {
    if (!dateValue) {
      return "Unknown time";
    }

    const date =
      new Date(dateValue);

    return date.toLocaleString(
      [],
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  function formatDuration(
    startedAt,
    endedAt
  ) {
    if (
      !startedAt ||
      !endedAt
    ) {
      return "Duration unavailable";
    }

    const start =
      new Date(startedAt);

    const end =
      new Date(endedAt);

    const totalSeconds =
      Math.max(
        0,
        Math.floor(
          (end - start) / 1000
        )
      );

    const hours =
      Math.floor(
        totalSeconds / 3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) /
          60
      );

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes} min`;
    }

    return `${totalSeconds} sec`;
  }

  const displayName =
    user?.user_metadata
      ?.display_name ||
    user?.email?.split("@")[0] ||
    "User";

  const initial =
    displayName
      ?.charAt(0)
      ?.toUpperCase() ||
    "Q";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600">
              <Video
                size={21}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Quilp
              </h1>

              <p className="text-xs text-zinc-500">
                Connect instantly.
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2 sm:flex">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 font-bold">
                {initial}
              </div>

              <div className="max-w-48">

                <p className="truncate text-sm font-semibold">
                  {displayName}
                </p>

                <p className="truncate text-xs text-zinc-500">
                  {user?.email}
                </p>

              </div>

            </div>

            <button
              onClick={logout}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut
                size={18}
              />
            </button>

          </div>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">

        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              Your workspace
            </p>

            <h2 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Connect instantly.
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Start a meeting now, join with a code, or schedule one for later.
            </p>

          </div>

          <button
            onClick={() =>
              setScheduleOpen(true)
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-5 py-3 font-semibold text-violet-300 transition hover:bg-violet-500/20"
          >
            <CalendarPlus
              size={19}
            />

            Schedule Meeting
          </button>

        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">

          <button
            onClick={
              handleStartMeeting
            }
            className="group min-h-72 rounded-3xl bg-violet-600 p-7 text-left shadow-2xl transition duration-300 hover:-translate-y-1 hover:bg-violet-500 sm:p-9"
          >

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Plus
                size={28}
              />
            </div>

            <div className="mt-14">

              <h3 className="text-3xl font-bold sm:text-4xl">
                Start Meeting
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-violet-100 sm:text-base">
                Create a room instantly and invite others with your meeting code.
              </p>

              <div className="mt-7 flex items-center gap-2 font-semibold">

                Start now

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />

              </div>

            </div>

          </button>

          <div className="min-h-72 rounded-3xl border border-zinc-800 bg-zinc-900 p-7 sm:p-9">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800">
              <Users
                size={26}
                className="text-violet-400"
              />
            </div>

            <h3 className="mt-8 text-3xl font-bold sm:text-4xl">
              Join Meeting
            </h3>

            <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
              Enter the code shared with you by the meeting host.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              <input
                value={
                  meetingCode
                }
                onChange={(
                  event
                ) =>
                  setMeetingCode(
                    event.target.value
                      .toUpperCase()
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    handleJoinMeeting();
                  }
                }}
                placeholder="OCEAN-572"
                className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-4 font-semibold uppercase outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
              />

              <button
                onClick={
                  handleJoinMeeting
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 font-bold text-black transition hover:bg-zinc-200"
              >
                Join

                <ArrowRight
                  size={18}
                />
              </button>

            </div>

          </div>

        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">

          {/* Upcoming Meetings */}

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70">

            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                  <CalendarDays
                    size={19}
                    className="text-violet-400"
                  />
                </div>

                <div>
                  <h3 className="font-bold">
                    Upcoming Meetings
                  </h3>

                  <p className="text-xs text-zinc-500">
                    Your scheduled meetings.
                  </p>
                </div>

              </div>

            </div>

            <div className="p-5">

              {loadingSchedule && (
                <div className="flex min-h-48 items-center justify-center">
                  <p className="text-sm text-zinc-500">
                    Loading meetings...
                  </p>
                </div>
              )}

              {!loadingSchedule &&
                scheduledMeetings.length ===
                  0 && (
                  <div className="flex min-h-48 items-center justify-center">

                    <div className="max-w-sm text-center">

                      <CalendarDays
                        size={30}
                        className="mx-auto text-zinc-700"
                      />

                      <p className="mt-4 font-semibold text-zinc-300">
                        Nothing scheduled yet
                      </p>

                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        Schedule a meeting and it will appear here.
                      </p>

                    </div>

                  </div>
                )}

              {!loadingSchedule &&
                scheduledMeetings.length >
                  0 && (
                  <div className="space-y-3">

                    {scheduledMeetings.map(
                      (
                        scheduledMeeting
                      ) => (
                        <div
                          key={
                            scheduledMeeting.id
                          }
                          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                              <h4 className="truncate font-semibold text-white">
                                {
                                  scheduledMeeting.title
                                }
                              </h4>

                              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">

                                <Clock3
                                  size={14}
                                />

                                {formatMeetingDate(
                                  scheduledMeeting.scheduled_for
                                )}

                              </div>

                              <p className="mt-2 text-xs font-medium text-violet-400">
                                {
                                  scheduledMeeting.meeting_code
                                }
                              </p>

                            </div>

                            <button
                              onClick={() =>
                                handleDeleteScheduled(
                                  scheduledMeeting.id
                                )
                              }
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>

                          </div>

                          <button
                            onClick={() =>
                              handleJoinScheduled(
                                scheduledMeeting
                              )
                            }
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                          >
                            Join Meeting

                            <ArrowRight
                              size={16}
                            />
                          </button>

                        </div>
                      )
                    )}

                  </div>
                )}

            </div>

          </div>

          {/* Recent Meetings */}

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70">

            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800">
                  <History
                    size={19}
                    className="text-zinc-300"
                  />
                </div>

                <div>
                  <h3 className="font-bold">
                    Recent Meetings
                  </h3>

                  <p className="text-xs text-zinc-500">
                    Meetings you've completed.
                  </p>
                </div>

              </div>

            </div>

            <div className="p-5">

              {loadingHistory && (
                <div className="flex min-h-48 items-center justify-center">
                  <p className="text-sm text-zinc-500">
                    Loading history...
                  </p>
                </div>
              )}

              {!loadingHistory &&
                meetingHistory.length ===
                  0 && (
                  <div className="flex min-h-48 items-center justify-center">

                    <div className="max-w-sm text-center">

                      <Clock3
                        size={30}
                        className="mx-auto text-zinc-700"
                      />

                      <p className="mt-4 font-semibold text-zinc-300">
                        No recent meetings
                      </p>

                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        End a meeting as the host and it will appear here.
                      </p>

                    </div>

                  </div>
                )}

              {!loadingHistory &&
                meetingHistory.length >
                  0 && (
                  <div className="space-y-3">

                    {meetingHistory.map(
                      (history) => (
                        <div
                          key={history.id}
                          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                              <h4 className="truncate font-semibold text-white">
                                {history.title ||
                                  `Meeting ${history.meeting_code}`}
                              </h4>

                              <p className="mt-1 text-xs font-medium text-violet-400">
                                {history.meeting_code}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">

                                <span>
                                  {formatMeetingDate(
                                    history.ended_at
                                  )}
                                </span>

                                <span>
                                  {formatDuration(
                                    history.started_at,
                                    history.ended_at
                                  )}
                                </span>

                              </div>

                            </div>

                            <button
                              onClick={() =>
                                handleDeleteHistory(
                                  history.id
                                )
                              }
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

            </div>

          </div>

        </section>

      </main>

      {scheduleOpen &&
        user && (
          <ScheduleMeetingModal
            user={user}
            onClose={() =>
              setScheduleOpen(
                false
              )
            }
            onCreated={(
              newMeeting
            ) => {
              setScheduledMeetings(
                (current) =>
                  [
                    ...current,
                    newMeeting,
                  ].sort(
                    (a, b) =>
                      new Date(
                        a.scheduled_for
                      ) -
                      new Date(
                        b.scheduled_for
                      )
                  )
              );
            }}
          />
        )}

    </div>
  );
}

export default Home;
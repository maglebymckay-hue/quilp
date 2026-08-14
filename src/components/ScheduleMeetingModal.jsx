import {
  useState,
} from "react";

import {
  CalendarDays,
  X,
} from "lucide-react";

import generateMeetingCode from "../utils/generateMeetingCode";

import {
  createScheduledMeeting,
} from "../services/scheduleService";

function ScheduleMeetingModal({
  user,
  onClose,
  onCreated,
}) {
  const [title, setTitle] =
    useState("");

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Enter a meeting title.");
      return;
    }

    if (!date || !time) {
      alert("Choose a date and time.");
      return;
    }

    try {
      setSaving(true);

      const meetingCode =
        generateMeetingCode();

      const scheduledFor =
        new Date(
          `${date}T${time}`
        ).toISOString();

      const meeting =
        await createScheduledMeeting({
          hostId: user.id,
          title: title.trim(),
          meetingCode,
          scheduledFor,
        });

      onCreated?.(meeting);
      onClose();
    } catch (error) {
      console.error(
        "Schedule meeting error:",
        error
      );

      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl sm:p-8">

        <div className="flex items-start justify-between">

          <div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/15">
              <CalendarDays
                size={22}
                className="text-violet-400"
              />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-white">
              Schedule Meeting
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Pick a title, date, and time.
            </p>

          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X size={18} />
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          <div>

            <label className="text-sm font-medium text-zinc-300">
              Meeting title
            </label>

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Weekly team sync"
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
            />

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <div>

              <label className="text-sm font-medium text-zinc-300">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-violet-500"
              />

            </div>

            <div>

              <label className="text-sm font-medium text-zinc-300">
                Time
              </label>

              <input
                type="time"
                value={time}
                onChange={(event) =>
                  setTime(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-violet-500"
              />

            </div>

          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-violet-600 px-5 py-4 font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Scheduling..."
              : "Schedule Meeting"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default ScheduleMeetingModal;
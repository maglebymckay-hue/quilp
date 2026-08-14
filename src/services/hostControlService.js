import supabase from "../lib/supabase";

const API_URL = "http://localhost:3001";

async function hostRequest(endpoint, body) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },

      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Host action failed."
    );
  }

  return data;
}

export function muteParticipant(
  room,
  targetIdentity,
  trackSid
) {
  return hostRequest("/host/mute", {
    room,
    targetIdentity,
    trackSid,
  });
}

export function removeParticipant(
  room,
  targetIdentity
) {
  return hostRequest("/host/remove", {
    room,
    targetIdentity,
  });
}

export function endMeeting(room) {
  return hostRequest("/host/end", {
    room,
  });
}
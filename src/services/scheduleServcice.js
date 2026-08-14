import supabase from "../lib/supabase";

export async function getScheduledMeetings(userId) {
  const { data, error } = await supabase
    .from("scheduled_meetings")
    .select("*")
    .eq("host_id", userId)
    .gte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createScheduledMeeting({
  hostId,
  title,
  meetingCode,
  scheduledFor,
}) {
  const { data, error } = await supabase
    .from("scheduled_meetings")
    .insert({
      host_id: hostId,
      title,
      meeting_code: meetingCode,
      scheduled_for: scheduledFor,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteScheduledMeeting(id) {
  const { error } = await supabase
    .from("scheduled_meetings")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
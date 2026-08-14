import supabase from "../lib/supabase";

export async function loadMessages(meetingId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function sendMessage({
  meetingId,
  senderId,
  message,
}) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      meeting_id: meetingId,
      sender_id: senderId,
      message,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
import supabase from "../lib/supabase";

export async function getMeetingHistory(userId) {
  const { data, error } = await supabase
    .from("meeting_history")
    .select("*")
    .eq("host_id", userId)
    .order("ended_at", {
      ascending: false,
    })
    .limit(10);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function deleteMeetingHistory(id) {
  const { error } = await supabase
    .from("meeting_history")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
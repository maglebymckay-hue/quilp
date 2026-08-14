import supabase from "../lib/supabase";
import generateMeetingCode from "../utils/generateMeetingCode";

export async function createMeeting() {
  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not logged in.");
  }

  // Generate meeting code
  const code = generateMeetingCode();

  // Create meeting
  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert({
      code,
      host: user.id,
      active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Meeting Error:", error);
    throw error;
  }

  // Add host as the first participant
  const { error: participantError } = await supabase
    .from("participants")
    .insert({
      meeting_id: meeting.id,
      user_id: user.id,
      is_host: true,
    });

  if (participantError) {
    console.error("Participant Error:", participantError);
    throw participantError;
  }

  console.log("Meeting Created:", meeting);

  return meeting;
}
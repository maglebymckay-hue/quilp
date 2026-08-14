const API_URL = "http://localhost:3001";

export async function getLiveKitToken(room, identity, name) {
  const response = await fetch(`${API_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      room,
      identity,
      name,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch LiveKit token.");
  }

  return response.json();
}
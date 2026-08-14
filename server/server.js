import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import {
  AccessToken,
  RoomServiceClient,
} from "livekit-server-sdk";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

/*
  LiveKit's client connection URL is normally wss://,
  while RoomServiceClient uses the HTTP version.
*/
const livekitHttpUrl = process.env.LIVEKIT_URL
  .replace(/^wss:/, "https:")
  .replace(/^ws:/, "http:");

const roomService = new RoomServiceClient(
  livekitHttpUrl,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

/* --------------------------------
   Supabase helpers
-------------------------------- */

async function getAuthenticatedUser(req) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Not authenticated.");
  }

  const response = await fetch(
    `${process.env.SUPABASE_URL}/auth/v1/user`,
    {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: authorization,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Invalid login session.");
  }

  return response.json();
}

async function getMeeting(roomCode, authorization) {
  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/meetings?code=eq.${encodeURIComponent(
      roomCode
    )}&select=id,code,host,active`,
    {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: authorization,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Could not load meeting.");
  }

  const meetings = await response.json();

  return meetings[0] || null;
}

async function verifyHost(req, roomCode) {
  const user = await getAuthenticatedUser(req);

  const meeting = await getMeeting(
    roomCode,
    req.headers.authorization
  );

  if (!meeting) {
    throw new Error("Meeting not found.");
  }

  if (meeting.host !== user.id) {
    throw new Error("Only the host can do that.");
  }

  return {
    user,
    meeting,
  };
}

/* --------------------------------
   LiveKit Token
-------------------------------- */

app.post("/token", async (req, res) => {
  try {
    const {
      room,
      identity,
      name,
    } = req.body;

    if (!room || !identity) {
      return res.status(400).json({
        error: "Missing room or identity.",
      });
    }

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity,
        name,
      }
    );

    token.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
    });

    res.json({
      token: await token.toJwt(),
      url: process.env.LIVEKIT_URL,
    });
  } catch (error) {
    console.error("Token error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

/* --------------------------------
   Host: Mute participant
-------------------------------- */

app.post("/host/mute", async (req, res) => {
  try {
    const {
      room,
      targetIdentity,
      trackSid,
    } = req.body;

    if (!room || !targetIdentity || !trackSid) {
      return res.status(400).json({
        error: "Missing mute information.",
      });
    }

    await verifyHost(req, room);

    await roomService.mutePublishedTrack(
      room,
      targetIdentity,
      trackSid,
      true
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Mute error:", error);

    res.status(403).json({
      error: error.message,
    });
  }
});

/* --------------------------------
   Host: Remove participant
-------------------------------- */

app.post("/host/remove", async (req, res) => {
  try {
    const {
      room,
      targetIdentity,
    } = req.body;

    if (!room || !targetIdentity) {
      return res.status(400).json({
        error: "Missing participant information.",
      });
    }

    await verifyHost(req, room);

    await roomService.removeParticipant(
      room,
      targetIdentity
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Remove error:", error);

    res.status(403).json({
      error: error.message,
    });
  }
});

/* --------------------------------
   Host: End meeting
-------------------------------- */

app.post("/host/end", async (req, res) => {
  try {
    const { room } = req.body;

    if (!room) {
      return res.status(400).json({
        error: "Missing room.",
      });
    }

    await verifyHost(req, room);

    /*
      Mark meeting inactive in Supabase.
    */
    const updateResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/meetings?code=eq.${encodeURIComponent(
        room
      )}`,
      {
        method: "PATCH",
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: req.headers.authorization,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          active: false,
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(
        "Could not mark meeting as ended."
      );
    }

    /*
      Delete LiveKit room.
      This disconnects everybody.
    */
    await roomService.deleteRoom(room);

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("End meeting error:", error);

    res.status(403).json({
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `✅ Quilp server running on port ${PORT}`
  );
});
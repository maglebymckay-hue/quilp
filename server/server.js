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

const PORT =
  process.env.PORT || 3001;

/* --------------------------------
   LiveKit
-------------------------------- */

const livekitHttpUrl =
  process.env.LIVEKIT_URL
    .replace(/^wss:/, "https:")
    .replace(/^ws:/, "http:");

const roomService =
  new RoomServiceClient(
    livekitHttpUrl,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
  );

/* --------------------------------
   Supabase helpers
-------------------------------- */

async function getAuthenticatedUser(req) {
  const authorization =
    req.headers.authorization;

  if (
    !authorization?.startsWith(
      "Bearer "
    )
  ) {
    throw new Error(
      "Not authenticated."
    );
  }

  const response = await fetch(
    `${process.env.SUPABASE_URL}/auth/v1/user`,
    {
      headers: {
        apikey:
          process.env
            .SUPABASE_ANON_KEY,

        Authorization:
          authorization,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Invalid login session."
    );
  }

  return response.json();
}

async function getMeeting(
  roomCode,
  authorization
) {
  const response = await fetch(
    `${
      process.env.SUPABASE_URL
    }/rest/v1/meetings?code=eq.${encodeURIComponent(
      roomCode
    )}&select=id,code,host,active,created_at`,
    {
      headers: {
        apikey:
          process.env
            .SUPABASE_ANON_KEY,

        Authorization:
          authorization,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Could not load meeting."
    );
  }

  const meetings =
    await response.json();

  return meetings[0] || null;
}

async function verifyHost(
  req,
  roomCode
) {
  const user =
    await getAuthenticatedUser(req);

  const meeting =
    await getMeeting(
      roomCode,
      req.headers.authorization
    );

  if (!meeting) {
    throw new Error(
      "Meeting not found."
    );
  }

  if (
    meeting.host !== user.id
  ) {
    throw new Error(
      "Only the host can do that."
    );
  }

  return {
    user,
    meeting,
  };
}

/* --------------------------------
   Scheduled meeting title
-------------------------------- */

async function getScheduledMeetingTitle(
  roomCode,
  authorization
) {
  try {
    const response = await fetch(
      `${
        process.env.SUPABASE_URL
      }/rest/v1/scheduled_meetings?meeting_code=eq.${encodeURIComponent(
        roomCode
      )}&select=title&limit=1`,
      {
        headers: {
          apikey:
            process.env
              .SUPABASE_ANON_KEY,

          Authorization:
            authorization,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data =
      await response.json();

    return data[0]?.title || null;

  } catch (error) {
    console.error(
      "Scheduled title lookup error:",
      error
    );

    return null;
  }
}

/* --------------------------------
   Save meeting history
-------------------------------- */

async function saveMeetingHistory(
  meeting,
  authorization
) {
  // Avoid duplicate history rows.
  const existingResponse =
    await fetch(
      `${
        process.env.SUPABASE_URL
      }/rest/v1/meeting_history?meeting_id=eq.${meeting.id}&select=id&limit=1`,
      {
        headers: {
          apikey:
            process.env
              .SUPABASE_ANON_KEY,

          Authorization:
            authorization,
        },
      }
    );

  if (existingResponse.ok) {
    const existing =
      await existingResponse.json();

    if (existing.length > 0) {
      return;
    }
  }

  const title =
    await getScheduledMeetingTitle(
      meeting.code,
      authorization
    );

  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/meeting_history`,
    {
      method: "POST",

      headers: {
        apikey:
          process.env
            .SUPABASE_ANON_KEY,

        Authorization:
          authorization,

        "Content-Type":
          "application/json",

        Prefer:
          "return=minimal",
      },

      body: JSON.stringify({
        meeting_id:
          meeting.id,

        host_id:
          meeting.host,

        meeting_code:
          meeting.code,

        title:
          title ||
          `Meeting ${meeting.code}`,

        started_at:
          meeting.created_at ||
          new Date().toISOString(),

        ended_at:
          new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) {
    const text =
      await response.text();

    console.error(
      "History insert response:",
      text
    );

    throw new Error(
      "Could not save meeting history."
    );
  }
}

/* --------------------------------
   LiveKit Token
-------------------------------- */

app.post(
  "/token",
  async (req, res) => {
    try {
      const {
        room,
        identity,
        name,
      } = req.body;

      if (
        !room ||
        !identity
      ) {
        return res
          .status(400)
          .json({
            error:
              "Missing room or identity.",
          });
      }

      const token =
        new AccessToken(
          process.env
            .LIVEKIT_API_KEY,

          process.env
            .LIVEKIT_API_SECRET,

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
        token:
          await token.toJwt(),

        url:
          process.env
            .LIVEKIT_URL,
      });

    } catch (error) {
      console.error(
        "Token error:",
        error
      );

      res
        .status(500)
        .json({
          error:
            error.message,
        });
    }
  }
);

/* --------------------------------
   Host: Mute participant
-------------------------------- */

app.post(
  "/host/mute",
  async (req, res) => {
    try {
      const {
        room,
        targetIdentity,
        trackSid,
      } = req.body;

      if (
        !room ||
        !targetIdentity ||
        !trackSid
      ) {
        return res
          .status(400)
          .json({
            error:
              "Missing mute information.",
          });
      }

      await verifyHost(
        req,
        room
      );

      await roomService
        .mutePublishedTrack(
          room,
          targetIdentity,
          trackSid,
          true
        );

      res.json({
        success: true,
      });

    } catch (error) {
      console.error(
        "Mute error:",
        error
      );

      res
        .status(403)
        .json({
          error:
            error.message,
        });
    }
  }
);

/* --------------------------------
   Host: Remove participant
-------------------------------- */

app.post(
  "/host/remove",
  async (req, res) => {
    try {
      const {
        room,
        targetIdentity,
      } = req.body;

      if (
        !room ||
        !targetIdentity
      ) {
        return res
          .status(400)
          .json({
            error:
              "Missing participant information.",
          });
      }

      await verifyHost(
        req,
        room
      );

      await roomService
        .removeParticipant(
          room,
          targetIdentity
        );

      res.json({
        success: true,
      });

    } catch (error) {
      console.error(
        "Remove error:",
        error
      );

      res
        .status(403)
        .json({
          error:
            error.message,
        });
    }
  }
);

/* --------------------------------
   Host: End meeting
-------------------------------- */

app.post(
  "/host/end",
  async (req, res) => {
    try {
      const { room } =
        req.body;

      if (!room) {
        return res
          .status(400)
          .json({
            error:
              "Missing room.",
          });
      }

      const {
        meeting,
      } =
        await verifyHost(
          req,
          room
        );

      /*
        Save history BEFORE
        ending the meeting.
      */

      await saveMeetingHistory(
        meeting,
        req.headers.authorization
      );

      /*
        Mark meeting inactive.
      */

      const updateResponse =
        await fetch(
          `${
            process.env
              .SUPABASE_URL
          }/rest/v1/meetings?code=eq.${encodeURIComponent(
            room
          )}`,
          {
            method: "PATCH",

            headers: {
              apikey:
                process.env
                  .SUPABASE_ANON_KEY,

              Authorization:
                req.headers
                  .authorization,

              "Content-Type":
                "application/json",

              Prefer:
                "return=minimal",
            },

            body:
              JSON.stringify({
                active: false,
              }),
          }
        );

      if (
        !updateResponse.ok
      ) {
        throw new Error(
          "Could not mark meeting as ended."
        );
      }

      /*
        Delete LiveKit room.
        Everyone gets disconnected.
      */

      try {
        await roomService
          .deleteRoom(room);
      } catch (error) {
        console.error(
          "Delete LiveKit room error:",
          error
        );
      }

      res.json({
        success: true,
      });

    } catch (error) {
      console.error(
        "End meeting error:",
        error
      );

      res
        .status(403)
        .json({
          error:
            error.message,
        });
    }
  }
);

/* --------------------------------
   Start Server
-------------------------------- */

app.listen(
  PORT,
  () => {
    console.log(
      `✅ Quilp server running on port ${PORT}`
    );
  }
);
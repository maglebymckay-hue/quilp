import { useNavigate, useParams } from "react-router-dom";
import { PreJoin } from "@livekit/components-react";

function PreJoinPage() {
  const navigate = useNavigate();
  const { code } = useParams();

  function handleSubmit(values) {
    const params = new URLSearchParams({
      name: values.username,
      video: values.videoEnabled,
      audio: values.audioEnabled,
    });

    navigate(`/meeting/${code}?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">

      <div className="w-full max-w-xl rounded-3xl bg-zinc-900 border border-zinc-800 p-8 shadow-2xl">

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-white">
            Quilp
          </h1>

          <p className="text-zinc-400 mt-2">
            Ready to join your meeting?
          </p>

        </div>

        <PreJoin
          defaults={{
            username: "",
            videoEnabled: true,
            audioEnabled: true,
          }}
          onSubmit={handleSubmit}
        />

      </div>

    </div>
  );
}

export default PreJoinPage;
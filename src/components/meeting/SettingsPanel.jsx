import {
  Camera,
  Mic,
  Speaker,
  X,
} from "lucide-react";

import {
  MediaDeviceSelect,
} from "@livekit/components-react";

function SettingsPanel({ onClose }) {
  return (
    <aside className="flex h-full w-96 flex-col border-l border-zinc-800 bg-zinc-950">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">

        <div>
          <h2 className="text-xl font-bold text-white">
            Settings
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Audio and video devices
          </p>
        </div>

        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <X size={19} />
        </button>

      </div>

      {/* Settings */}

      <div className="flex-1 space-y-8 overflow-y-auto p-6">

        {/* Camera */}

        <div>
          <div className="mb-3 flex items-center gap-2">

            <Camera
              size={18}
              className="text-violet-400"
            />

            <h3 className="font-semibold text-white">
              Camera
            </h3>

          </div>

          <MediaDeviceSelect
            kind="videoinput"
            className="w-full"
          />
        </div>

        {/* Microphone */}

        <div>
          <div className="mb-3 flex items-center gap-2">

            <Mic
              size={18}
              className="text-violet-400"
            />

            <h3 className="font-semibold text-white">
              Microphone
            </h3>

          </div>

          <MediaDeviceSelect
            kind="audioinput"
            className="w-full"
          />
        </div>

        {/* Speaker */}

        <div>
          <div className="mb-3 flex items-center gap-2">

            <Speaker
              size={18}
              className="text-violet-400"
            />

            <h3 className="font-semibold text-white">
              Speaker
            </h3>

          </div>

          <MediaDeviceSelect
            kind="audiooutput"
            className="w-full"
          />

          <p className="mt-2 text-xs text-zinc-500">
            Speaker selection depends on browser support.
          </p>
        </div>

      </div>

    </aside>
  );
}

export default SettingsPanel;
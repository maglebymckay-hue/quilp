import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-violet-500">
          404
        </h1>

        <h2 className="text-3xl font-bold mt-4">
          Page not found
        </h2>

        <p className="text-zinc-400 mt-3">
          The page you're looking for doesn't exist.
        </p>

        <button
          onClick={() => navigate("/home")}
          className="mt-8 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default NotFound;
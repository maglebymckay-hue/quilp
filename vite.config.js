import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  console.log("VITE_SUPABASE_URL =", env.VITE_SUPABASE_URL);

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
  };
});
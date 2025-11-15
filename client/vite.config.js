import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // For Tailwind v4+

export default defineConfig({
  plugins: [tailwindcss(), react()],
});

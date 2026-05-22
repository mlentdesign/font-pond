import { defineConfig } from "vitest/config";
import { resolve } from "path";

// Tests need the same "@/..." path alias the app uses (defined in tsconfig.json).
// Vitest doesn't read tsconfig paths on its own, so mirror it here.
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});

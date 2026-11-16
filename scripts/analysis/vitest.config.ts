import { defineConfig } from "vitest/config";
import { resolve } from "path";
export default defineConfig({
  resolve: { alias: { "@": resolve(__dirname, "../../src") } },
  test: { include: ["scripts/analysis/*.run.ts"], testTimeout: 600000, root: resolve(__dirname, "../..") },
});

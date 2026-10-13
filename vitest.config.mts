import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    clearMocks: true,
    // Mocked requests still need an absolute URL when constructed in Node.
    env: { NEXT_PUBLIC_API_BASE_URL: "https://api.example.test", NEXT_PUBLIC_DATA_SOURCE: "api" },
  },
});

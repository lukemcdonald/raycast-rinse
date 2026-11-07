import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    include: ["scripts/**/*.test.ts", "src/**/*.test.ts"],
    mockReset: true,
    restoreMocks: true,
  },
});

import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// eslint-disable-next-line import/no-default-export -- vitest wants this
export default defineConfig({
  plugins: [tsconfigPaths()],
});

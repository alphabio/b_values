// b_path:: packages/b_utils/vite.config.ts
import { defineConfig } from "vite";

import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
});

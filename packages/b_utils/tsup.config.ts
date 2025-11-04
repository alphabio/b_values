// b_path:: packages/b_utils/tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/parse/index.ts", "src/generate/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
});

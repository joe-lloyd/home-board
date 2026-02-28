import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  target: "node20",
  noExternal: ["@homeboard/db", "@homeboard/types"],
  external: ["@prisma/client"],
});

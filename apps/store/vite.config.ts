import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { lingui, linguiTransformerBabelPreset } from "@lingui/vite-plugin";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const linguiConfigPath = fileURLToPath(new URL("../../lingui.config.ts", import.meta.url));

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    target: "esnext",
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
    lingui({ configPath: linguiConfigPath }),
    babel({
      presets: [linguiTransformerBabelPreset(undefined, { configPath: linguiConfigPath })],
    }),
  ],
  ssr: {
    noExternal: ["ms"],
  },
  nitro: {
    preset: "bun",
  },
});

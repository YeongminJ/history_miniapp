import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "my-history-king",
  brand: {
    displayName: "내가역사왕",
    primaryColor: "#5D4037",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev --host",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});

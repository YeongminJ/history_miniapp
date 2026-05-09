import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "my-history-king",
  brand: {
    displayName: "역사왕",
    primaryColor: "#5D4037",
    icon: "https://static.toss.im/appsintoss/36039/7172327e-9dc5-4efe-98a9-94bfa8072722.png",
  },
  web: {
    // 실기기 샌드박스에서 이 값을 참조해요. Wi-Fi가 바뀌면 현재 Mac LAN IP로
    // 갱신해주세요: `ipconfig getifaddr en0`
    host: "192.168.68.109",
    port: 5173,
    commands: {
      dev: "vite dev --host",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});

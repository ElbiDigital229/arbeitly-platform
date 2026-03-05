import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import vuetify from "vite-plugin-vuetify";

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 2222,
    proxy: {
      "/api": {
        target: "http://localhost:2000",
        changeOrigin: true,
      },
    },
  },
});

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // frontend will call /api/...
        "/api": {
          target: "https://api.football-data.org",
          changeOrigin: true,
          secure: true,

          // /api/competitions/PL -> /v4/competitions/PL
          rewrite: (path) => path.replace(/^\/api/, "/v4"),

          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              const token = env.VITE_FOOTBALL_DATA_TOKEN;
              if (token) proxyReq.setHeader("X-Auth-Token", token);
            });
          },
        },
      },
    },
  };
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { githubAuthPlugin } from "./vite-github-auth";

// GitHub OAuth Client Secret - In production, use environment variable
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '19f20194b44ec52147a30df59791cc10f3963845';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    githubAuthPlugin(GITHUB_CLIENT_SECRET),
  ],
  server: {
    port: 5173,
  },
  appType: 'spa',
});

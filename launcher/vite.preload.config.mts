import {defineConfig} from "vite"
import {getBaseViteConfig} from "./vite.base.config.mjs"

// https://vitejs.dev/config
export default defineConfig((env) => {
  return getBaseViteConfig(env)
});

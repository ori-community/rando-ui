import type {ConfigEnv, UserConfig} from "vite"
import {defineConfig, mergeConfig} from "vite"
import {getBuildConfig, external, pluginHotRestart, getBuildDefine} from "./vite.base.config"
import { fileURLToPath, URL } from "url"

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<"build">
  const {forgeConfigSelf} = forgeEnv
  const define = getBuildDefine(forgeEnv)
  const config: UserConfig = {
    build: {
      lib: {
        entry: forgeConfigSelf.entry!,
        fileName: () => "[name].js",
        formats: ["cjs"],
      },
      rollupOptions: {
        external,
      },
      minify: false,
    },
    plugins: [pluginHotRestart("restart")],
    define,
    resolve: {
      // Load the Node.js entry.
      mainFields: ["module", "jsnext:main", "jsnext"],
      alias: {
        "@launcher": fileURLToPath(new URL("./src", import.meta.url)),
        "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
        "@web": fileURLToPath(new URL("../web", import.meta.url)),
      },
    },
  }

  return mergeConfig(getBuildConfig(forgeEnv), config)
})

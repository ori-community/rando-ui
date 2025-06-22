import type {ConfigEnv, UserConfig} from "vite"
import {defineConfig, mergeConfig} from "vite"
import {getBuildConfig, getBuildDefine, external, pluginHotRestart} from "./vite.base.config"

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
        "@": "./src",
        "@shared": "../shared",
      },
    },
  }

  return mergeConfig(getBuildConfig(forgeEnv), config)
})

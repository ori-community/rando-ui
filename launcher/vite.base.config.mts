import {builtinModules} from "node:module"
import type {ConfigEnv, Plugin, UserConfig} from "vite"
import {fileURLToPath} from "url"
import {nativeExtraModules} from "./forge.config.mjs"

export const externals = ["electron", "utf-8-validate", ...nativeExtraModules, ...builtinModules.map((m) => [m, `node:${m}`]).flat()]

export function getBaseViteConfig(env: ConfigEnv): UserConfig {
  return {
    define: getBuildDefines(env),
    resolve: {
      alias: {
        "@launcher": fileURLToPath(new URL("./src", import.meta.url)),
        "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
        "@web": fileURLToPath(new URL("../web", import.meta.url)),
      },
    },
    build: {
      minify: false,
      rolldownOptions: {
        external: externals,
      },
    },
  }
}

export function getBuildDefines(env: ConfigEnv) {
  if (env.command === "serve") {
    process.env.NODE_ENV = "development"
  }

  return {}
}


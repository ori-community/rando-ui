import { builtinModules } from 'node:module'
import type { ConfigEnv, Plugin, UserConfig } from 'vite'
import pkg from './package.json'
import {fileURLToPath} from "url"

export const builtins = ['electron', ...builtinModules.map((m) => [m, `node:${m}`]).flat()]
export const external = [...builtins, ...Object.keys('dependencies' in pkg ? (pkg.dependencies as Record<string, unknown>) : {})]

export function getBaseViteConfig(env: ConfigEnv): UserConfig {
  return {
    plugins: [pluginHotRestart("restart")],
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
      rollupOptions: {
        external,
      }
    }
  }
}

export function getBuildDefines(env: ConfigEnv) {
  if (env.command === "serve") {
    process.env.NODE_ENV = "development"
  }

  return {}
}

export function pluginHotRestart(command: 'reload' | 'restart'): Plugin {
  return {
    name: '@electron-forge/plugin-vite:hot-restart',
    closeBundle() {
      if (command === 'reload') {
        // for (const server of Object.values(process.viteDevServers)) {
        //   // Preload scripts hot reload.
        //   server.ws.send({ type: 'full-reload' })
        // }
      } else {
        // Main process hot restart.
        // https://github.com/electron/forge/blob/v7.2.0/packages/api/core/src/api/start.ts#L216-L223
        process.stdin.emit('data', 'rs')
      }
    },
  }
}

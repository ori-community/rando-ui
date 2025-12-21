import {ForgeConfig} from "@electron-forge/shared-types"
import {MakerZIP} from "@electron-forge/maker-zip"
import {VitePlugin} from "@electron-forge/plugin-vite"
import {FusesPlugin} from "@electron-forge/plugin-fuses"
import {FuseV1Options, FuseVersion} from "@electron/fuses"
import {namedHookWithTaskFn} from "@electron-forge/plugin-base"
import {execa} from "execa"
import packageJson from "./package.json"
import path from "node:path"
import fs from "node:fs"

/** Native modules that need to be copied into the ASAR */
export const nativeExtraModules = ["focus-ori", "zeromq", "hasha"]

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    ignore: (file: string) => {
      if (!file) return false

      // Include vite output, UI and resources
      return !["/.vite", "/web-build", "/resources"].some(f => file.startsWith(f))
    },
    icon: path.join(__dirname, "resources/icon"),
  },
  hooks: {
    packageAfterCopy: namedHookWithTaskFn<"packageAfterCopy">(
      async (_listrTask, _resolvedForgeConfig, resourcesPath, _electronVersion, _platform, _arch) => {
        const nativeExtraNpmModules: string[] = []
        const nativeExtraFileModules: string[] = []

        for (const nativeExtraModule of nativeExtraModules) {
          // @ts-ignore
          const version = packageJson.dependencies[nativeExtraModule] as string

          if (version.startsWith("file:")) {
            nativeExtraFileModules.push(nativeExtraModule)
          } else {
            nativeExtraNpmModules.push(nativeExtraModule)
          }
        }

        for (const nativeExtraNpmModule of nativeExtraNpmModules) {
          if (!Object.hasOwn(packageJson.dependencies, nativeExtraNpmModule)) {
            throw new Error(`Failed to package module '${nativeExtraNpmModule}': It was not found in package.json dependencies`)
          }

          // @ts-ignore
          const version = packageJson.dependencies[nativeExtraNpmModule] as string

          await execa("npm", ["install", `${nativeExtraNpmModule}@${version}`, "--prefix", resourcesPath])
        }

        const nodeModulesPath = path.join(resourcesPath, "node_modules")
        for (const nativeExtraFileModule of nativeExtraFileModules) {
          // @ts-ignore
          const version = packageJson.dependencies[nativeExtraFileModule] as string

          await fs.promises.mkdir(nodeModulesPath, {
            recursive: true
          })

          await fs.promises.cp(version.substring("file:".length), path.join(nodeModulesPath, nativeExtraFileModule), {
            recursive: true,
            dereference: true,
          })
        }
      },
      "Installing native extra dependencies",
    ),
  },
  rebuildConfig: {},
  makers: [
    new MakerZIP({}, ["win32", "linux"]),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}

export default config

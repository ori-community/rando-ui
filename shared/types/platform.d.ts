export type LauncherPlatform = "windows" | "linux"

/**
 * "other" is only used in the frontend when running the web-only build
 */
export type Platform = LauncherPlatform | "other"

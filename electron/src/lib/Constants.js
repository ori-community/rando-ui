import path from 'path'
import os from 'os'

export const LAUNCHER_WORKING_DIR = process.env.NODE_ENV === 'development' ? (os.platform() === 'win32' ? 'C:\\moon' : './work-dir') : path.dirname(process.argv0)
export const RANDOMIZER_BASE_PATH = path.resolve(LAUNCHER_WORKING_DIR, './randomizer')
export const SEEDS_PATH = path.resolve(LAUNCHER_WORKING_DIR, './seeds')
export const UPDATE_PATH = path.resolve(LAUNCHER_WORKING_DIR, './update')
export const SETTINGS_PATH = path.resolve(RANDOMIZER_BASE_PATH, './settings.ini')
export const CURRENT_SEED_PATH_FILE = path.resolve(RANDOMIZER_BASE_PATH, './.currentseedpath')
export const LAST_VERSION_FILE = path.resolve(RANDOMIZER_BASE_PATH, './LAST_VERSION')
export const AUTH_BASE_PATH = path.resolve(RANDOMIZER_BASE_PATH, './auth')
export const WINESTREAMPROXY_DIR = path.resolve(LAUNCHER_WORKING_DIR, './winestreamproxy')
export const DXVK_CACHE_DIR = path.resolve(LAUNCHER_WORKING_DIR, './dxvk-cache')

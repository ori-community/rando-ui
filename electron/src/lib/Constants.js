import path from 'path'
import os from 'os'

const cwd = process.env.NODE_ENV === 'development' ? (os.platform() === 'win32' ? 'C:\\moon' : './work-dir') : path.dirname(process.argv0)

export const RANDOMIZER_BASE_PATH = path.resolve(cwd, './randomizer')
export const SEEDS_PATH = path.resolve(cwd, './seeds')
export const UPDATE_PATH = path.resolve(cwd, './update')
export const SETTINGS_PATH = `${RANDOMIZER_BASE_PATH}/settings.ini`
export const CURRENT_SEED_PATH_FILE = `${RANDOMIZER_BASE_PATH}/.currentseedpath`
export const LAST_VERSION_FILE = `${RANDOMIZER_BASE_PATH}/LAST_VERSION`

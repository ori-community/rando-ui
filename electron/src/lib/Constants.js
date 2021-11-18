import path from 'path'
import os from 'os'

const cwd = process.env.NODE_ENV === 'development' ? (os.platform() === 'win32' ? 'C:\\moon' : './work-dir') : path.dirname(process.argv0)

export const RANDOMIZER_BASE_PATH = path.resolve(cwd, './randomizer')
export const SEEDS_PATH = path.resolve(cwd, './seeds')
export const UPDATE_PATH = path.resolve(cwd, './update')

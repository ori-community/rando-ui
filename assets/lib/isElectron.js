export const isElectron = () => typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron

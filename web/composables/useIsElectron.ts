export const useIsElectron = () => {
  return window.__isElectron === true
}

declare global {
  interface Window {
    __isElectron?: boolean,
  }
}

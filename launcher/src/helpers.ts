export const getElectronUrl = (to: string) => {
  return process.env.WEBPACK_DEV_SERVER_URL  // TODO
    ? `http://localhost:3000#${to}`
    : `app://./index.html#${to}`
}

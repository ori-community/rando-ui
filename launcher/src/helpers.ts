export const getElectronUrl = (to: string) => {
  return process.env.NODE_ENV === "development"
    ? `http://localhost:3000#${to}`
    : `app://./index.html#${to}`
}

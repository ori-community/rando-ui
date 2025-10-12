import {parse as parseCsv} from "csv-parse"
import os from "os"
import {execa} from "execa"

export const getElectronUrl = (to: string) => {
  return process.env.NODE_ENV === "development"
    ? `http://localhost:3000${to}`
    : `app://./index.html#${to}`
}

export const isProcessRunning = async (processName: string) => {
  if (os.platform() !== "win32") {
    console.log("isProcessRunning used on unsupported OS")
    return false
  }

  const tasklistProcess = await execa(`tasklist /FO CSV /NH /FI "IMAGENAME eq ${processName}"`)

  const parser = parseCsv(tasklistProcess.stdout)

  for await (const record of parser) {
    if (record[0].toLowerCase() === processName.toLowerCase()) {
      return true
    }
  }

  return false
}


export const waitForProcess = (processName: string, maxWaitSeconds: number = 20) => new Promise<void>((resolve, reject) => {
  let tries = 0

  const check = async () => {
    tries++

    if (await isProcessRunning(processName)) {
      resolve()
    } else if (tries > maxWaitSeconds) {
      reject(new Error(`Could not find process ${processName} within ${maxWaitSeconds} seconds`))
    } else {
      setTimeout(check, 1000)
    }
  }

  check()
})

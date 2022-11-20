import { exec } from 'child_process'
import { parse as parseCsv } from 'csv-parse'
import os from 'os'

export const isProcessRunning = async (processName) => {
  if (os.platform() !== 'win32') {
    console.log('isProcessRunning used on unsupported OS')
    return false
  }

  const tasklistOutput = await new Promise((resolve) => {
    exec('tasklist /FO CSV', (error, stdout) => {
      if (error) {
        console.error(error)
        resolve('')
        return
      }

      resolve(stdout)
    })
  })

  const parser = parseCsv(tasklistOutput, {
    columns: true,
  })

  for await (const record of parser) {
    if (record['Image Name'].toLowerCase() === processName.toLowerCase()) {
      return true
    }
  }

  return false
}

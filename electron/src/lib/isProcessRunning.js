import psList from 'ps-list'

export const isProcessRunning = async (processName) => {
  const processes = await psList({ all: true })
  return processes.some(p => p.name.toLowerCase() === processName.toLowerCase())
}

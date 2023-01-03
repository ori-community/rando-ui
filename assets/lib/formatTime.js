export function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return (
    (hours > 0 ? `${hours.toFixed(0)}:` : '') +
    `${minutes.toFixed(0).padStart(2, '0')}:${seconds.toFixed(1).padStart(4, '0')}`
  )
}

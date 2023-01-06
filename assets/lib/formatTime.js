export function formatTime(totalSeconds, subSecondDigits = 1) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const secondsCharacterCount = subSecondDigits === 0
    ? 2 // e.g. 12
    : 3 + subSecondDigits // e.g. "02.4" for 2.4 seconds and 1 digit

  return (
    (hours > 0 ? `${hours.toFixed(0)}:` : '') +
    `${minutes.toFixed(0).padStart(2, '0')}:${seconds.toFixed(subSecondDigits).padStart(secondsCharacterCount, '0')}`
  )
}

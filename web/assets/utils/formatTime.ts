export function formatTime(
  totalSeconds: number,
  subSecondDigits: number = 1,
  omitMinutesIfZero: boolean = false,
  alwaysShowSign: boolean = false,
): string {
  let string = ""

  if (totalSeconds < 0) {
    string += "-"
    totalSeconds *= -1
  } else if (alwaysShowSign) {
    string += "+"
  }

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.trunc(totalSeconds % 60 * Math.pow(10, subSecondDigits)) / Math.pow(10, subSecondDigits)

  const hoursVisible = hours > 0
  const minutesVisible = hoursVisible || minutes > 0 || !omitMinutesIfZero

  const secondsCharacterCount =
    subSecondDigits === 0
      ? (minutesVisible ? 2 : 1) // e.g. 12 or 6
      : (minutesVisible ? 3 : 2) + subSecondDigits // e.g. "02.4" for 2.4 seconds and 1 digit

  string += (hoursVisible ? `${hours.toFixed(0)}:` : "") +
    (minutesVisible ? `${minutes.toFixed(0).padStart(hoursVisible ? 2 : 1, "0")}:` : "") +
    `${seconds.toFixed(subSecondDigits).padStart(secondsCharacterCount, "0")}`

  return string
}

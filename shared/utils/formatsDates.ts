import {format as formatDateFn, formatDistanceToNow, parseISO} from "date-fns"
import type {Locale} from "date-fns"

let allLocales: Record<string, Locale> = {}
import("date-fns/locale").then(locales => {
  allLocales = locales
})

const getLocale = (): Locale | undefined => {
  const locale = navigator.language.replace("-", "")
  const rootLocale = locale.substring(0, 2)

  return allLocales[locale] ?? allLocales[rootLocale]
}

export const formatDate = ((dateISO: string, format: string = "P"): string => {
  return formatDateFn(parseISO(dateISO), format, {
    locale: getLocale(),
  })
})

export const formatDateObject = ((date: Date, format: string = "P"): string => {
  return formatDateFn(date, format, {
    locale: getLocale(),
  })
})

export const formatDateEpoch = ((epochMillis: number, format: string = "P"): string => {
  return formatDateFn(new Date(epochMillis), format, {
    locale: getLocale(),
  })
})

export const formatDateRelative = ((date: Date): string => {
  if (import.meta.server) {
    return "on " + formatDateFn(new Date(date), "PP", {
      locale: getLocale(),
    })
  }

  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: getLocale(),
  })
})

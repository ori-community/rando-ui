import { format as formatDate, formatDistanceToNow, parseISO } from 'date-fns'
import { enCA } from 'date-fns/locale'

export const formatsDates = {
  methods: {
    formatDateRelative(date) {
      if (process.server) {
        return 'on ' + formatDate(new Date(date), 'PP', {
          locale: enCA,
        })
      }

      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: enCA,
      })
    },
    formatDate(dateISO, format = 'dd.MM.yyyy') {
      return formatDate(parseISO(dateISO), format, {
        locale: enCA,
      })
    },
    formatDateObject(date, format = 'dd.MM.yyyy') {
      return formatDate(date, format, {
        locale: enCA,
      })
    },
    formatDateEpoch(epochMillis, format = 'dd.MM.yyyy') {
      return formatDate(new Date(epochMillis), format, {
        locale: enCA,
      })
    },
  },
}

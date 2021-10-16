import {formatDistanceToNow, format as formatDate, parseISO} from 'date-fns'
import {enCA} from 'date-fns/locale'

export const formatsDates = {
  methods: {
    formatDateRelative (date) {
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
    formatDate (dateISO, format = 'dd.MM.yyyy') {
      return formatDate(parseISO(dateISO), format, {
        locale: enCA,
      })
    },
  },
}

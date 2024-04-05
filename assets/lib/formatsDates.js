import { format as formatDate, formatDistanceToNow, parseISO } from 'date-fns'

let allLocales = {};
import("date-fns/locale").then(locales => {
  allLocales = locales;
});

const getLocale = () => {
  const locale = navigator.language.replace("-", "");
  const rootLocale = locale.substring(0, 2);

  return allLocales[locale] ?? allLocales[rootLocale];
};

export const formatsDates = {
  methods: {
    formatDateRelative(date) {
      if (process.server) {
        return 'on ' + formatDate(new Date(date), 'PP', {
          locale: getLocale(),
        })
      }

      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: getLocale(),
      })
    },
    formatDate(dateISO, format = 'P') {
      return formatDate(parseISO(dateISO), format, {
        locale: getLocale(),
      })
    },
    formatDateObject(date, format = 'P') {
      return formatDate(date, format, {
        locale: getLocale(),
      })
    },
    formatDateEpoch(epochMillis, format = 'P') {
      return formatDate(new Date(epochMillis), format, {
        locale: getLocale(),
      })
    },
  },
}

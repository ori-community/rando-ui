export const ungetterify = (obj) => {
  const keys = Object.keys(obj)

  const prototype = Object.getPrototypeOf(obj)

  if (prototype) {
    const getters = Object.entries(Object.getOwnPropertyDescriptors(prototype))
      .filter(([key, descriptor]) => typeof descriptor.get === 'function')
      .map(([key]) => key)

    keys.push(...getters)
  }

  return keys.reduce((clone, key) => {
    const value = obj[key]

    if (Array.isArray(value)) {
      clone[key] = value.map(v =>
        typeof v === 'object'
          ? ungetterify(v)
          : v
      )
    } else {
      clone[key] = typeof value === 'object'
        ? ungetterify(value)
        : value
    }

    return clone
  }, {})
}

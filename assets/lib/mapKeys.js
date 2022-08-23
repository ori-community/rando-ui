export const mapKeys = (object, idKey = 'id') =>
  Object.entries(object).map(([id, value]) => ({
    [idKey]: id,
    ...value,
  }))

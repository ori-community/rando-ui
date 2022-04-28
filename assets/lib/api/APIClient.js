export class APIClient {
  static _axios = null

  static get axios() {
    if (APIClient._axios) {
      return APIClient._axios
    } else {
      throw new Error('Axios instance must be set before calling an APIClient method')
    }
  }

  static setAxios(instance) {
    APIClient._axios = instance
  }
}

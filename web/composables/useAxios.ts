import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api',
})

export const useAxios = () => {
  return axiosInstance
}

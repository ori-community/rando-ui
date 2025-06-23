import axios from "axios"

const axiosInstance = axios.create({
  baseURL: "https://wotw.orirando.com/api",
})

export const useAxios = () => {
  return axiosInstance
}

import {defineStore} from "pinia"
import type {UserInfo} from "@shared/types/http-api"

export const useUserStore = defineStore("user", () => {
  const {axios, catchAxiosErrors} = useAxios()

  /**
   * undefined = Unknown state, didn't check yet
   * null = not logged-in
   * User = logged in
   */
  const user = ref<UserInfo | null | undefined>(undefined)

  const isLoggedIn = computed(() => {
    return !!user.value
  })

  const isDeveloper = computed(() => {
    return !!user.value?.isDeveloper
  })

  async function updateUser() {
    await catchAxiosErrors(
      async () => {
        user.value = (await (axios.get("/users/me/info"))).data as UserInfo
      },
      async (e) => {
        user.value = null

        if (e.status && e.status === 401) {
          return
        }

        console.error(e)
      },
    )
  }

  return {
    user,
    isLoggedIn,
    isDeveloper,
    updateUser,
  }
})

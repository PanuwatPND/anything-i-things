export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) {
    return
  }

  const { user, isLoggedIn, hydrate } = useAuth()

  hydrate()

  if (!isLoggedIn.value) {
    return navigateTo(ADMIN_LOGIN_PATH)
  }

  if (user.value?.role !== 'admin') {
    return navigateTo('/user/water')
  }
})

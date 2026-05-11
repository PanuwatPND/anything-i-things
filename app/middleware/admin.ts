export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) {
    return
  }

  const { user, isLoggedIn, hydrate } = useAuth()

  hydrate()

  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }

  if (user.value?.role !== 'admin') {
    return navigateTo('/user')
  }
})

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) {
    return
  }

  const { user, isLoggedIn, hydrate } = useAuth()

  hydrate()

  if (isLoggedIn.value) {
    if (user.value?.role === 'admin') {
      return navigateTo('/admin')
    }

    return navigateTo('/user')
  }
})

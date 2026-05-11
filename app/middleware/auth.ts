export default defineNuxtRouteMiddleware((to) => {
  // localStorage ใช้ได้แค่ฝั่ง client — บน SSR อย่า redirect ไม่งั้นจอขาว / วน login
  if (import.meta.server) {
    return
  }

  const { user, isLoggedIn, hydrate } = useAuth()

  hydrate()

  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }

  if (user.value?.role === 'admin' && (to.path === '/' || to.path.startsWith('/user'))) {
    return navigateTo('/admin')
  }

  if (user.value?.role === 'user' && to.path === '/') {
    return navigateTo('/user/water')
  }
})

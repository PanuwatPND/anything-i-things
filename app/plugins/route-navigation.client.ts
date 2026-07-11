const ROUTE_NAV_BLUR_KEY = 'route-nav-blur'

const TAB_PATHS = new Set([
  '/user/water',
  '/user/bills',
  '/user/cart',
  '/user/profile',
])

const normPath = (path: string) => path.replace(/\/$/, '') || '/'

const isTabSwitch = (from: string, to: string) =>
  TAB_PATHS.has(normPath(from)) && TAB_PATHS.has(normPath(to))

export default defineNuxtPlugin(() => {
  const loading = useState(ROUTE_NAV_BLUR_KEY, () => false)
  const router = useRouter()
  const MIN_OVERLAY_MS = 90
  let activeNavigation = 0
  const overlayStartedAt = new Map<number, number>()
  let safetyTimer: ReturnType<typeof setTimeout> | undefined

  const clearSafety = () => {
    if (safetyTimer) {
      clearTimeout(safetyTimer)
      safetyTimer = undefined
    }
  }

  const finishOverlay = async (snapshot: number) => {
    const startedAt = overlayStartedAt.get(snapshot) ?? performance.now()
    const elapsed = performance.now() - startedAt
    if (elapsed < MIN_OVERLAY_MS) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, MIN_OVERLAY_MS - elapsed)
      })
    }
    await nextTick()
    overlayStartedAt.delete(snapshot)
    if (activeNavigation === snapshot) {
      loading.value = false
      clearSafety()
    }
  }

  router.beforeEach((to, from) => {
    if (to.fullPath === from.fullPath) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (isTabSwitch(from.path, to.path)) return
    activeNavigation += 1
    overlayStartedAt.set(activeNavigation, performance.now())
    loading.value = true
    clearSafety()
    safetyTimer = setTimeout(() => {
      loading.value = false
      safetyTimer = undefined
    }, 8000)
  })

  router.afterEach((to, from) => {
    if (to.fullPath === from.fullPath) {
      loading.value = false
      clearSafety()
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (isTabSwitch(from.path, to.path)) {
      loading.value = false
      clearSafety()
      return
    }
    const snapshot = activeNavigation
    void finishOverlay(snapshot)
  })

  router.onError(() => {
    loading.value = false
    clearSafety()
  })
})

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
  >
    <div
      ref="shellRef"
      class="lg-shell pointer-events-auto relative mx-auto w-full max-w-md rounded-3xl p-2"
      style="touch-action: none; user-select: none;"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
    >
      <!-- Sliding glass pill (absolutely positioned under icons) -->
      <div
        class="lg-pill pointer-events-none absolute top-2 rounded-2xl"
        :style="pillStyle"
        aria-hidden="true"
      />

      <!-- Tab buttons — no @click, navigation is handled in onPointerUp -->
      <div class="relative grid grid-cols-4 gap-1.5">
        <button
          type="button"
          class="relative z-10 flex h-14 select-none flex-col items-center justify-center gap-1 rounded-2xl text-xs transition-colors duration-200"
          :class="activeTab === 'home' ? 'font-semibold text-slate-800' : 'font-medium text-slate-400'"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20h14V9.5" />
          </svg>
          <span>หน้าแรก</span>
        </button>
        <button
          type="button"
          class="relative z-10 flex h-14 select-none flex-col items-center justify-center gap-1 rounded-2xl text-xs transition-colors duration-200"
          :class="activeTab === 'bills' ? 'font-semibold text-slate-800' : 'font-medium text-slate-400'"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 3h12v18l-2.5-1.8L13 21l-2.5-1.8L8 21l-2-1.4V3Z" />
            <path d="M9 8h6M9 12h6" />
          </svg>
          <span>บิล</span>
        </button>
        <button
          type="button"
          class="relative z-10 flex h-14 select-none flex-col items-center justify-center gap-1 rounded-2xl text-xs transition-colors duration-200"
          :class="activeTab === 'cart' ? 'font-semibold text-slate-800' : 'font-medium text-slate-400'"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
            <path d="M3 4h2l2.4 10.5a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H7" />
          </svg>
          <span>ตะกร้า</span>
        </button>
        <button
          type="button"
          class="relative z-10 flex h-14 select-none flex-col items-center justify-center gap-1 rounded-2xl text-xs transition-colors duration-200"
          :class="activeTab === 'profile' ? 'font-semibold text-slate-800' : 'font-medium text-slate-400'"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20a7 7 0 0 1 14 0" />
          </svg>
          <span>โปรไฟล์</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type TabId = 'home' | 'bills' | 'cart' | 'profile'

const TABS: { id: TabId; path: string }[] = [
  { id: 'home',    path: '/user/water'   },
  { id: 'bills',   path: '/user/bills'   },
  { id: 'cart',    path: '/user/cart'    },
  { id: 'profile', path: '/user/profile' },
]

const PAD    = 8   // p-2 = 8px
const GAP    = 6   // gap-1.5 = 6px
const PILL_H = 56  // h-14

const route    = useRoute()
const router   = useRouter()
const shellRef = ref<HTMLElement | null>(null)

const norm = (p: string) => p.replace(/\/$/, '') || '/'

const setNavDir = (targetIndex: number) => {
  if (!import.meta.client) return
  const dir = targetIndex > activeIndex.value ? 'nav-forward' : 'nav-backward'
  document.documentElement.classList.remove('nav-forward', 'nav-backward')
  document.documentElement.classList.add(dir)
}

const activeTab = computed<TabId>(() => {
  const p = norm(route.path)
  if (p.startsWith('/user/water'))   return 'home'
  if (p.startsWith('/user/bills'))   return 'bills'
  if (p.startsWith('/user/cart'))    return 'cart'
  if (p.startsWith('/user/profile')) return 'profile'
  return 'home'
})

const activeIndex = computed(() => TABS.findIndex(t => t.id === activeTab.value))

// ── pill geometry ─────────────────────────────────────────────────────────────
const tabW = () => {
  const shell = shellRef.value
  if (!shell) return 80
  return (shell.offsetWidth - PAD * 2 - GAP * 3) / 4
}
const tabX = (i: number) => PAD + i * (tabW() + GAP)

// ── pill reactive state ───────────────────────────────────────────────────────
const pillX      = ref(0)
const pillReady  = ref(false)
const isDragging = ref(false)
const snapDur    = ref(0)   // seconds; 0 = instant (no transition)

// duration scales with distance: 1 tab ≈ 0.42s, 3 tabs ≈ 0.72s
const calcDur = (from: number, to: number) =>
  Math.max(0.42, 0.28 + Math.abs(to - from) * 0.15)

const pillStyle = computed(() => ({
  left:      `${pillX.value}px`,
  width:     `${tabW()}px`,
  height:    `${PILL_H}px`,
  opacity:   pillReady.value ? '1' : '0',
  transition: !pillReady.value || isDragging.value || snapDur.value === 0
    ? 'none'
    : `left ${snapDur.value}s cubic-bezier(0.25, 1, 0.5, 1)`,
}))

const snapTo = (i: number) => { pillX.value = tabX(i) }

watch(
  [activeIndex, shellRef] as const,
  ([i, shell], prev) => {
    if (!shell) return
    const target = tabX(i)

    if (!pillReady.value) {
      // first mount — position instantly, no animation
      snapDur.value   = 0
      pillX.value     = target
      pillReady.value = true
      return
    }

    if (Math.abs(pillX.value - target) < 1) {
      // onPointerUp already set the position — don't interrupt ongoing animation
      return
    }

    // external navigation (back button, programmatic router.push, etc.)
    const prevI = prev?.[0] as number | undefined
    snapDur.value = prevI != null ? calcDur(prevI, i) : 0
    pillX.value   = target
  },
  { immediate: true, flush: 'post' },
)

// ── drag / tap state ──────────────────────────────────────────────────────────
let isPointerDown = false
let startClientX  = 0
let startPillX    = 0
let hasMoved      = false
let lastMoveX     = 0
let lastMoveTime  = 0
let velocity      = 0

const onPointerDown = (e: PointerEvent) => {
  isPointerDown = true
  hasMoved      = false
  startClientX  = e.clientX
  startPillX    = pillX.value
  lastMoveX     = e.clientX
  lastMoveTime  = Date.now()
  velocity      = 0
  // NOTE: no setPointerCapture — it redirects pointerup to shell and breaks click
}

const onPointerMove = (e: PointerEvent) => {
  if (!isPointerDown) return

  const dx = e.clientX - startClientX
  if (Math.abs(dx) < 5) return

  if (!hasMoved) {
    isDragging.value = true
    hasMoved = true
  }

  const now = Date.now()
  const dt  = now - lastMoveTime
  if (dt > 0) velocity = (e.clientX - lastMoveX) / dt
  lastMoveX    = e.clientX
  lastMoveTime = now

  const shell = shellRef.value
  const w     = tabW()
  const maxX  = shell ? shell.offsetWidth - w - PAD : PAD
  pillX.value = Math.max(PAD, Math.min(maxX, startPillX + dx))
}

const onPointerUp = (e: PointerEvent) => {
  isPointerDown = false

  if (!isDragging.value) {
    // ── TAP: determine which tab was hit by x coordinate ──────────────────
    const shell = shellRef.value
    if (!shell) return
    const relX = e.clientX - shell.getBoundingClientRect().left
    const w    = tabW()
    for (let i = 0; i < TABS.length; i++) {
      const x = tabX(i)
      if (relX >= x - 2 && relX <= x + w + 2) {
        snapDur.value = calcDur(activeIndex.value, i)   // proportional duration
        snapTo(i)
        const tab = TABS[i]
        if (tab && norm(route.path) !== norm(tab.path)) {
          setNavDir(i)
          router.push(tab.path)
        }
        break
      }
    }
    return
  }

  // ── DRAG: snap to nearest tab ─────────────────────────────────────────────
  isDragging.value = false
  hasMoved         = false

  const w          = tabW()
  const pillCenter = pillX.value + w / 2
  let nearest      = 0
  let minDist      = Infinity
  for (let i = 0; i < TABS.length; i++) {
    const d = Math.abs(pillCenter - (tabX(i) + w / 2))
    if (d < minDist) { minDist = d; nearest = i }
  }

  const FLICK_VEL = 0.45
  if (velocity >  FLICK_VEL && nearest < TABS.length - 1) nearest++
  if (velocity < -FLICK_VEL && nearest > 0)               nearest--

  snapDur.value = 0.3   // short fixed snap for drag release
  snapTo(nearest)
  const tab = TABS[nearest]
  if (tab && norm(route.path) !== norm(tab.path)) {
    setNavDir(nearest)
    router.push(tab.path)
  }
}

const onPointerCancel = () => {
  isPointerDown    = false
  isDragging.value = false
  hasMoved         = false
  snapTo(activeIndex.value)   // snap back to current route
}

onUnmounted(() => { pillReady.value = false })
</script>

<style>
.lg-shell {
  background: rgba(248, 250, 252, 0.48);
  backdrop-filter: blur(40px) saturate(1.8) brightness(1.04);
  -webkit-backdrop-filter: blur(40px) saturate(1.8) brightness(1.04);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    inset 0 1.5px 0 rgba(255, 255, 255, 0.92),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.04),
    inset 1px 0 0 rgba(255, 255, 255, 0.35),
    inset -1px 0 0 rgba(255, 255, 255, 0.35),
    0 24px 64px -20px rgba(15, 23, 42, 0.28),
    0 8px 24px -8px rgba(15, 23, 42, 0.10);
}

.lg-pill {
  position: absolute;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border: 0.5px solid rgba(255, 255, 255, 0.95);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 1),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.05),
    0 4px 14px rgba(15, 23, 42, 0.10),
    0 1px 3px rgba(15, 23, 42, 0.06);
}
</style>

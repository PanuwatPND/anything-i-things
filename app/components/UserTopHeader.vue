<template>
  <div
    class="px-3 py-2 pt-4 transition-all duration-300 ease-out"
    :class="headerShellClass"
  >
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 transition active:scale-95"
        @click="goProfile"
      >
        <img
          :src="avatarSrc"
          alt="profile"
          class="h-full w-full object-cover"
        />
      </button>

      <div class="min-w-0 flex-1">
        <p class="text-[11px] leading-none text-slate-500">
          {{ todayLabel }}
        </p>
        <h1
          class="mt-1 truncate text-base font-bold leading-tight tracking-tight text-slate-900"
        >
          สวัสดี,
          <span class="font-medium text-slate-600">{{ displayName }}</span>
        </h1>
      </div>

      <button
        type="button"
        data-user-cart-icon
        class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all active:scale-95"
        :class="
          cartCount > 0
            ? 'bg-black text-white shadow-lg'
            : 'bg-white text-slate-700 ring-1 ring-black/10 hover:ring-black/20'
        "
        aria-label="เปิดตะกร้า"
        @click="goCart"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path
            d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
          />
        </svg>
        <span
          v-if="cartCount > 0"
          class="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-slate-100 bg-white px-0.5 text-[10px] font-bold leading-none text-black"
        >
          {{ cartCount > 9 ? "9+" : cartCount }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    floating?: boolean;
  }>(),
  {
    floating: false,
  },
);

const router = useRouter();
const { user } = useAuth();
const { totalCount: cartCount } = useLocalWatershop();
const DEFAULT_AVATAR = "/default-avatar.png";
const HEADER_FLOAT_SCROLL_THRESHOLD = 64;
const hasScrolled = ref(false);

const todayLabel = computed(() => {
  try {
    return new Intl.DateTimeFormat("th-TH", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date());
  } catch {
    return "";
  }
});

const displayName = computed(() => {
  const profileName = user.value?.name?.trim() ?? "";
  if (profileName) return profileName;

  const email = user.value?.email ?? "";
  const local = email.split("@")[0] ?? "";
  if (!local) return "ผู้ใช้";
  const cleaned = local.replace(/[-_.]+/g, " ").trim();
  if (!cleaned) return "ผู้ใช้";
  return cleaned
    .split(" ")
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(" ");
});

const avatarSrc = computed(() => user.value?.avatar?.trim() || DEFAULT_AVATAR);
const headerShellClass = computed(() => {
  if (props.floating || hasScrolled.value) {
    return " border border-black/10 bg-white/85 opacity-100 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] backdrop-blur translate-y-0 scale-100";
  }
  return " border border-transparent bg-transparent opacity-90 shadow-none backdrop-blur-0 -translate-y-1 scale-[0.985]";
});

const goProfile = () => {
  router.push("/user/profile");
};

const goCart = () => {
  router.push("/user/cart");
};

const syncScrollState = () => {
  if (!import.meta.client) return;
  hasScrolled.value = window.scrollY > HEADER_FLOAT_SCROLL_THRESHOLD;
};

onMounted(() => {
  syncScrollState();
  window.addEventListener("scroll", syncScrollState, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", syncScrollState);
});
</script>

<style scoped>
.cart-pulse {
  animation: cart-bounce 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cart-bounce {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.22);
  }
  70% {
    transform: scale(0.94);
  }
  100% {
    transform: scale(1);
  }
}
</style>

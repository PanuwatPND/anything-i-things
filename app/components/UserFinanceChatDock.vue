<template>
  <ClientOnly>
    <Transition name="chat-backdrop">
      <div
        v-if="open"
        class="pointer-events-auto fixed inset-0 z-[45] bg-slate-900/45 backdrop-blur-[2px]"
        aria-hidden="true"
        @click="open = false"
      />
    </Transition>

    <div
      class="pointer-events-none fixed right-4 z-50 flex flex-col-reverse items-end gap-2"
      :style="{ bottom: dockBottom }"
    >
      <button
        type="button"
        class="group pointer-events-auto relative h-14 w-14 overflow-hidden rounded-full shadow-[0_12px_28px_-8px_rgba(15,23,42,0.55)] ring-2 ring-white/90 transition active:scale-95"
        :aria-expanded="open"
        aria-controls="user-finance-chat-panel"
        :aria-label="open ? 'ปิดแชท' : 'เปิดแชท'"
        @click="open = !open"
      >
        <span
          v-if="!open"
          class="absolute inset-0 grid place-items-center bg-slate-900 text-white transition group-hover:bg-slate-800"
        >
          <svg
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            />
          </svg>
        </span>
        <span
          v-else
          class="absolute inset-0 grid place-items-center bg-slate-900 text-white transition group-hover:bg-slate-800"
        >
          <svg
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </span>
      </button>

      <Transition name="chat-dock">
        <div
          v-if="open"
          id="user-finance-chat-panel"
          class="pointer-events-auto flex max-h-[min(28rem,58vh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-slate-200/95 shadow-[0_14px_40px_-12px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.08] backdrop-blur-sm"
        >
          <div
            class="flex items-center justify-between gap-2 border-b border-slate-300/60 bg-slate-200/80 px-3 py-2.5"
          >
            <div class="flex min-w-0 items-center gap-2">
              <img
                :src="chatFabSrc"
                alt=""
                width="36"
                height="36"
                class="h-9 w-9 shrink-0 rounded-full object-cover object-[50%_28%] ring-2 ring-white/90"
                draggable="false"
              />
              <p class="truncate text-sm font-semibold text-slate-800">
                แชท (ลุคซาเก้ท)
              </p>
            </div>
            <button
              type="button"
              class="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-300/60 hover:text-slate-800"
              aria-label="ปิด"
              @click="open = false"
            >
              <svg
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            ref="chatScrollRef"
            class="min-h-[7.5rem] flex-1 overflow-y-auto bg-slate-100/50 px-3 py-2"
          >
            <ul class="space-y-2">
              <li
                v-for="m in messages"
                :key="m.id"
                :class="
                  m.from === 'user'
                    ? 'ml-8 rounded-2xl rounded-br-md bg-slate-900 px-3 py-2 text-[13px] leading-snug text-white'
                    : 'mr-8 rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[13px] leading-snug text-slate-800 ring-1 ring-slate-200/80'
                "
              >
                <span class="whitespace-pre-wrap">{{ m.text }}</span>
              </li>
              <li
                v-if="botTyping"
                class="mr-8 rounded-2xl rounded-bl-md bg-white px-3 py-2.5 text-[13px] leading-snug text-slate-500 ring-1 ring-slate-200/80"
                aria-live="polite"
              >
                <span class="typing-placeholder font-medium">...กำลังพิมพ์</span>
              </li>
            </ul>
          </div>

          <div class="border-t border-slate-300/50 bg-slate-200/90 p-2.5">
            <div
              class="relative overflow-hidden rounded-2xl bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-slate-200/80"
            >
              <label class="sr-only" for="finance-chat-input"
                >พิมพ์ข้อความ</label
              >
              <textarea
                id="finance-chat-input"
                v-model="message"
                rows="3"
                :disabled="isBusy"
                class="block w-full resize-none bg-transparent px-3 pb-12 pt-2.5 text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 disabled:opacity-50"
                :placeholder="placeholder"
                @keydown.enter.exact.prevent="submit"
              />
              <div class="absolute bottom-2 right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  class="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-40"
                  :disabled="isBusy || recognizing || !speechSupported"
                  :title="
                    speechSupported
                      ? 'พูดเพื่อพิมพ์'
                      : 'เบราว์เซอร์นี้ไม่รองรับเสียง'
                  "
                  aria-label="พูดเพื่อพิมพ์"
                  @click="toggleVoice"
                >
                  <svg
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
                    />
                    <path d="M19 11a7 7 0 0 1-14 0M12 18v3" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="grid h-9 w-9 place-items-center rounded-full bg-black text-white shadow-md ring-1 ring-black/20 transition hover:bg-neutral-900 active:scale-95 disabled:opacity-40"
                  aria-label="ส่งข้อความ"
                  :disabled="isBusy"
                  @click="submit"
                >
                  <svg
                    class="h-[1.12rem] w-[1.12rem] origin-center -rotate-[46deg] text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.56.75.75 0 0 0 0-1.228A60.517 60.517 0 0 0 3.478 2.404Z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <p
              v-if="hint"
              class="mt-1.5 text-center text-[11px] font-medium text-slate-500"
            >
              {{ hint }}
            </p>
          </div>
        </div>
      </Transition>
    </div>
    <template #fallback />
  </ClientOnly>
</template>

<script setup lang="ts">
/** ชนิดย่อของ Web Speech API — ไม่พึ่ง lib ภายนอก */
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: SpeechRecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionResultEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

const route = useRoute();

const norm = (path: string) => path.replace(/\/$/, "") || "/";

const hasTabBar = computed(() => {
  const p = norm(route.path);
  const bases = [
    "/user/water",
    "/user/bills",
    "/user/cart",
    "/user/profile",
  ] as const;
  return bases.some((base) => p === base || p.startsWith(`${base}/`));
});

const dockBottom = computed(() =>
  hasTabBar.value
    ? "calc(env(safe-area-inset-bottom) + 5.75rem)"
    : "calc(env(safe-area-inset-bottom) + 1.25rem)",
);

const chatFabSrc = "/chat-fab-icon.png";

const CHAT_DISPLAY_NAME_KEY = "lunarwater-chat-display-name";

const open = ref(false);
const message = ref("");
const hint = ref("");
const recognizing = ref(false);
const botTyping = ref(false);
const chatScrollRef = ref<HTMLElement | null>(null);
const chatUserName = ref("");

const isBusy = computed(() => botTyping.value);

type ChatMsg = { id: string; text: string; from: "user" | "system" | "assistant" };
const messages = ref<ChatMsg[]>([
  {
    id: "welcome",
    text: "",
    from: "system",
  },
]);

const buildWelcomeText = () => {
  if (chatUserName.value) {
    return `สวัสดี คุณ${chatUserName.value}! เราคือบอทลุคซาเก้ท พร้อมช่วยเรื่องสั่งน้ำ บิล และตะกร้า — ถามได้เลยนะ`;
  }
  return "สวัสดี! เราคือบอทลุคซาเก้ทนะ มาช่วยดูแลเรื่องสั่งน้ำในแอปนี้\nขอชื่อเล่นของคุณหน่อยได้ไหม จะได้ทักถูกคน~";
};

const placeholder = computed(() =>
  chatUserName.value ? "พิมพ์ข้อความ…" : "พิมพ์ชื่อเล่นของคุณ…",
);

let recognition: SpeechRecognitionInstance | null = null;

const speechSupported = computed(() => {
  if (!import.meta.client) return false;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
});

const showHint = (text: string) => {
  hint.value = text;
  window.setTimeout(() => {
    hint.value = "";
  }, 2200);
};

const scrollChatToEnd = () => {
  const el = chatScrollRef.value;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** ให้ Vue + เบราว์เซอร์ทันวาดแถบกำลังพิมพ์ก่อนไปทำงานหนักต่อ */
const yieldPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

/** แบบ IG: แสดงแถบกำลังพิมพ์ แล้วค่อยใส่ข้อความเต็มทีเดียว */
const withTypingIndicator = async (
  reveal: () => void,
  minPauseMs = 520,
  maxPauseMs = 1200,
) => {
  botTyping.value = true;
  await nextTick();
  await yieldPaint();
  scrollChatToEnd();
  await sleep(minPauseMs + Math.random() * (maxPauseMs - minPauseMs));
  reveal();
  botTyping.value = false;
  await nextTick();
  scrollChatToEnd();
};

/** ระหว่างรอ API ให้เห็น ...กำลังพิมพ์ อย่างน้อย minMs (กันตอบเร็วจนไม่ทันวาด) */
const CHAT_TYPING_MIN_MS = 520;

const fetchChatReplyWithTyping = async (
  turns: { role: "user" | "assistant"; content: string }[],
) => {
  botTyping.value = true;
  await nextTick();
  await yieldPaint();
  scrollChatToEnd();
  const started = Date.now();
  try {
    const { reply } = await $fetch<{ reply: string }>("/api/chat", {
      method: "POST",
      body: {
        messages: turns,
        userName: chatUserName.value,
      },
    });
    const elapsed = Date.now() - started;
    if (elapsed < CHAT_TYPING_MIN_MS) {
      await sleep(CHAT_TYPING_MIN_MS - elapsed);
    }
    const out = (reply || "").trim() || "ไม่มีคำตอบจากบอทครับ";
    botTyping.value = false;
    await nextTick();
    messages.value.push({
      id: `a-${Date.now()}`,
      text: out,
      from: "assistant",
    });
    await nextTick();
    scrollChatToEnd();
  } catch {
    const elapsed = Date.now() - started;
    if (elapsed < CHAT_TYPING_MIN_MS) {
      await sleep(CHAT_TYPING_MIN_MS - elapsed);
    }
    botTyping.value = false;
    await nextTick();
    messages.value.push({
      id: `a-${Date.now()}`,
      text: "ขออภัย ตอนนี้เชื่อมบอทไม่สำเร็จ ลองใหม่นะครับ",
      from: "assistant",
    });
    await nextTick();
    scrollChatToEnd();
  }
};

const submit = async () => {
  const text = message.value.trim();
  if (!text) {
    showHint(chatUserName.value ? "พิมพ์ข้อความก่อนนะ" : "พิมพ์ชื่อเล่นก่อนนะ");
    return;
  }
  if (isBusy.value) return;

  if (!chatUserName.value) {
    const nameGuess = text.replace(/^\s*ชื่อ\s*/i, "").trim().slice(0, 40);
    if (!nameGuess) {
      showHint("พิมพ์ชื่อเล่นก่อนนะ");
      return;
    }
    messages.value.push({
      id: `u-${Date.now()}`,
      text,
      from: "user",
    });
    message.value = "";
    chatUserName.value = nameGuess;
    if (import.meta.client) {
      localStorage.setItem(CHAT_DISPLAY_NAME_KEY, nameGuess);
    }
    await nextTick();
    scrollChatToEnd();
    const ack = `ยินดีที่ได้รู้จักเลยครับ คุณ${nameGuess} — ลุคซาเก้ทจำชื่อไว้แล้วนะ ถามเรื่องสั่งน้ำ บิล หรือตะกร้าได้เลย`;
    await withTypingIndicator(() => {
      messages.value.push({
        id: `a-${Date.now()}`,
        text: ack,
        from: "assistant",
      });
    }, 560, 1300);
    return;
  }

  messages.value.push({
    id: `u-${Date.now()}`,
    text,
    from: "user",
  });
  message.value = "";
  await nextTick();
  scrollChatToEnd();

  const turns = messages.value
    .filter((m) => m.from === "user" || m.from === "assistant")
    .map((m) => ({
      role: m.from === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

  await fetchChatReplyWithTyping(turns);
};

onMounted(async () => {
  if (!import.meta.client) return;
  try {
    const stored = localStorage.getItem(CHAT_DISPLAY_NAME_KEY);
    if (stored) chatUserName.value = stored.trim().slice(0, 40);
  } catch {
    /* ignore */
  }
  const welcome = messages.value[0];
  if (welcome?.id === "welcome" && welcome.text === "") {
    const full = buildWelcomeText();
    await withTypingIndicator(() => {
      welcome.text = full;
    }, 480, 1100);
  }
});

const toggleVoice = () => {
  if (!import.meta.client || !speechSupported.value) return;

  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!SR) return;

  if (recognizing.value && recognition) {
    recognition.stop();
    return;
  }

  recognition = new SR();
  recognition.lang = "th-TH";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (ev: SpeechRecognitionResultEvent) => {
    const said = ev.results[0]?.[0]?.transcript?.trim();
    if (said) {
      message.value = message.value ? `${message.value} ${said}` : said;
    }
  };
  recognition.onerror = () => {
    recognizing.value = false;
    showHint("จับเสียงไม่ได้ — ลองอีกครั้ง");
  };
  recognition.onend = () => {
    recognizing.value = false;
  };
  recognizing.value = true;
  recognition.start();
};

watch(open, (isOpen) => {
  if (!import.meta.client) return;
  document.body.style.overflow = isOpen ? "hidden" : "";
});

onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = "";
});
</script>

<style scoped>
.chat-dock-enter-active,
.chat-dock-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.chat-dock-enter-from,
.chat-dock-leave-to {
  opacity: 0;
  transform: translateY(0.5rem) scale(0.97);
  transform-origin: bottom right;
}

.chat-backdrop-enter-active,
.chat-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.chat-backdrop-enter-from,
.chat-backdrop-leave-to {
  opacity: 0;
}

.typing-placeholder {
  animation: typing-placeholder-pulse 1.1s ease-in-out infinite;
}
@keyframes typing-placeholder-pulse {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 1;
  }
}
</style>

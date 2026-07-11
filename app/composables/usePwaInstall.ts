const DISMISS_KEY = 'pwa-install-dismissed-until';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export const usePwaInstall = () => {
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
  const canInstall = ref(false);
  const isStandalone = ref(false);
  const isIos = ref(false);
  const dismissed = ref(false);

  const refreshDismissed = () => {
    if (!import.meta.client) return;
    const until = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    dismissed.value = until > 0 && Date.now() < until;
  };

  const dismissForDays = (days = 7) => {
    if (!import.meta.client) return;
    const until = Date.now() + days * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, String(until));
    dismissed.value = true;
  };

  const showPrompt = computed(
    () =>
      import.meta.client &&
      !isStandalone.value &&
      !dismissed.value &&
      (canInstall.value || isIos.value),
  );

  const install = async () => {
    const prompt = deferredPrompt.value;
    if (!prompt) return false;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt.value = null;
      canInstall.value = false;
      return true;
    }
    return false;
  };

  onMounted(() => {
    if (!import.meta.client) return;

    refreshDismissed();
    isStandalone.value =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    isIos.value =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;

    if (!isStandalone.value) {
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt.value = event as BeforeInstallPromptEvent;
        canInstall.value = true;
      });
    }

    window.addEventListener('appinstalled', () => {
      deferredPrompt.value = null;
      canInstall.value = false;
      isStandalone.value = true;
    });
  });

  return {
    canInstall,
    isIos,
    isStandalone,
    showPrompt,
    install,
    dismissForDays,
    refreshDismissed,
  };
};

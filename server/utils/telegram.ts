const TELEGRAM_API = "https://api.telegram.org";

export async function sendTelegram(text: string): Promise<void> {
  const config = useRuntimeConfig();
  const token = (config.telegramBotToken as string | undefined)?.trim();
  const chatId = (config.telegramChatId as string | undefined)?.trim();
  if (!token || !chatId) return;

  await $fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    body: { chat_id: chatId, text, parse_mode: "HTML" },
  }).catch(() => {});
}

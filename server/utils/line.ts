const LINE_API = "https://api.line.me/v2/bot/message";

export async function sendLine(text: string, toIds: string[]): Promise<void> {
  const config = useRuntimeConfig();
  const token = String(config.lineChannelAccessToken ?? "").trim();
  if (!token || toIds.length === 0) return;

  await Promise.all(
    toIds.map((to) =>
      $fetch(`${LINE_API}/push`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: { to, messages: [{ type: "text", text }] },
      }).catch(() => {}),
    ),
  );
}

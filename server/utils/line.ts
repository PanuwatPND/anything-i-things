import type { SupabaseClient } from "@supabase/supabase-js";

const LINE_API = "https://api.line.me/v2/bot/message";

function splitIds(value: string | undefined): string[] {
  return (value ?? "").split(",").filter(Boolean);
}

/** รวม group/room + user สำหรับส่งแจ้งเตือน */
export function lineRecipientsFromSettings(map: Record<string, string>): string[] {
  const groups = splitIds(map.line_group_ids);
  const users = splitIds(map.line_user_ids);
  return [...new Set([...groups, ...users])];
}

export async function appendLineSettingId(
  sb: SupabaseClient,
  key: "line_user_ids" | "line_group_ids",
  id: string,
): Promise<void> {
  const { data } = await sb.from("settings").select("value").eq("key", key).maybeSingle();
  const current = splitIds(data?.value);
  if (current.includes(id)) return;

  const { error } = await sb
    .from("settings")
    .upsert({ key, value: [...current, id].join(","), updated_at: new Date().toISOString() });
  if (error) console.error(`[LINE] upsert ${key} failed:`, error.message);
  else console.log(`[LINE] saved ${key}:`, id);
}

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

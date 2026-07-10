import type { SupabaseClient } from "@supabase/supabase-js";

const LINE_API = "https://api.line.me/v2/bot/message";

function splitIds(value: string | undefined): string[] {
  return (value ?? "").split(",").filter(Boolean);
}

function settingOn(map: Record<string, string>, key: string, defaultValue: boolean): boolean {
  const v = map[key];
  if (v === undefined || v === "") return defaultValue;
  return v === "true";
}

/**
 * เลือกปลายทาง LINE จาก settings:
 * - line_notify_groups (default true) → ส่งเข้ากลุ่มใน line_group_ids
 * - line_notify_users  (default false) → ส่งเข้าแชทส่วนตัวใน line_user_ids
 */
export function lineRecipientsFromSettings(map: Record<string, string>): string[] {
  const toGroups = settingOn(map, "line_notify_groups", true);
  const toUsers = settingOn(map, "line_notify_users", false);

  const groups = toGroups ? splitIds(map.line_group_ids) : [];
  const users = toUsers ? splitIds(map.line_user_ids) : [];
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

type LineMessage =
  | { type: "text"; text: string }
  | { type: "flex"; altText: string; contents: unknown };

export async function sendLineMessages(toIds: string[], messages: LineMessage[]): Promise<void> {
  const config = useRuntimeConfig();
  const token = String(config.lineChannelAccessToken ?? "").trim();
  if (!token || toIds.length === 0 || messages.length === 0) return;

  await Promise.all(
    toIds.map(async (to) => {
      try {
        await $fetch(`${LINE_API}/push`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: { to, messages },
        });
      } catch (err) {
        console.error("[LINE] push failed:", to, err);
      }
    }),
  );
}

/** @deprecated ใช้ sendLineMessages + Flex Message แทน */
export async function sendLine(text: string, toIds: string[]): Promise<void> {
  await sendLineMessages(toIds, [{ type: "text", text }]);
}

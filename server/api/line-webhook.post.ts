export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ events?: LineEvent[] }>(event);

    for (const evt of body.events ?? []) {
      const src = evt.source;
      if (!src) continue;

      const userId = src.userId;
      const groupId = src.groupId;
      const type = src.type;

      console.log("[LINE webhook]", JSON.stringify({ type, userId, groupId }));

      // เก็บ userId เข้า Supabase settings โดยอัตโนมัติ
      if (!userId) continue;

      try {
        const sb = serverSupabase(event);
        const { data } = await sb
          .from("settings")
          .select("value")
          .eq("key", "line_user_ids")
          .maybeSingle();

        const current: string[] = data?.value ? data.value.split(",").filter(Boolean) : [];
        if (current.includes(userId)) continue;

        const next = [...current, userId].join(",");
        const { error } = await sb
          .from("settings")
          .upsert({ key: "line_user_ids", value: next, updated_at: new Date().toISOString() });
        if (error) {
          console.error("[LINE webhook] upsert failed:", error.message);
        } else {
          console.log("[LINE webhook] saved new userId:", userId);
        }
      } catch (err) {
        console.error("[LINE webhook] save userId failed:", err);
      }
    }
  } catch (err) {
    console.error("[LINE webhook] handler failed:", err);
  }

  // LINE ต้องการ 200 เสมอ — อย่าคืน error ไม่งั้น webhook จะถูกปิด
  return "OK";
});

type LineEvent = {
  source?: {
    type?: string;
    userId?: string;
    groupId?: string;
  };
};

export default defineEventHandler(async (event) => {
  const body = await readBody<{ events?: LineEvent[] }>(event);

  for (const evt of body.events ?? []) {
    const src = evt.source;
    if (!src) continue;

    const userId = src.userId;
    const groupId = src.groupId;
    const type = src.type;

    console.log("[LINE webhook]", JSON.stringify({ type, userId, groupId }));

    // เก็บ userId เข้า Supabase settings โดยอัตโนมัติ
    if (userId) {
      const sb = serverSupabase(event);
      const { data } = await sb
        .from("settings")
        .select("value")
        .eq("key", "line_user_ids")
        .single();

      const current: string[] = data?.value ? data.value.split(",").filter(Boolean) : [];
      if (!current.includes(userId)) {
        const next = [...current, userId].join(",");
        await sb
          .from("settings")
          .upsert({ key: "line_user_ids", value: next, updated_at: new Date().toISOString() });
        console.log("[LINE webhook] saved new userId:", userId);
      }
    }
  }

  return "OK";
});

type LineEvent = {
  source?: {
    type?: string;
    userId?: string;
    groupId?: string;
  };
};

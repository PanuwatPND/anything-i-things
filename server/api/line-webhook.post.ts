import { appendLineSettingId } from "../utils/line";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ events?: LineEvent[] }>(event);

    for (const evt of body.events ?? []) {
      const src = evt.source;
      if (!src) continue;

      const userId = src.userId;
      const groupId = src.groupId;
      const roomId = src.roomId;
      const type = src.type;

      console.log("[LINE webhook]", JSON.stringify({ type: evt.type, sourceType: type, userId, groupId, roomId }));

      try {
        const sb = serverSupabase(event);

        // กลุ่ม / แชทหลายคน → เก็บ groupId หรือ roomId
        if (groupId) {
          await appendLineSettingId(sb, "line_group_ids", groupId);
        } else if (roomId) {
          await appendLineSettingId(sb, "line_group_ids", roomId);
        } else if (userId && type === "user") {
          // แชทส่วนตัวเท่านั้น
          await appendLineSettingId(sb, "line_user_ids", userId);
        }
      } catch (err) {
        console.error("[LINE webhook] save id failed:", err);
      }
    }
  } catch (err) {
    console.error("[LINE webhook] handler failed:", err);
  }

  // LINE ต้องการ 200 เสมอ — อย่าคืน error ไม่งั้น webhook จะถูกปิด
  return "OK";
});

type LineEvent = {
  type?: string;
  source?: {
    type?: string;
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
};

type ChatTurn = { role: 'user' | 'assistant'; content: string }

function localReplyTh(userText: string, userName: string): string {
  const t = userText.trim().toLowerCase()
  const raw = userText.trim()

  if (/สวัสดี|หวัดดี|hello|hi\b/i.test(raw)) {
    return 'สวัสดีครับ ลุคซาเก้ทยินดีช่วยเรื่องสั่งน้ำหรือบิลนะครับ'
  }
  if (/ขอบคุณ|thanks/i.test(raw)) {
    return 'ยินดีครับ มีอะไรถามต่อได้เลย'
  }
  if (/น้ำ|สั่งน้ำ|สั่ง|เมนู/i.test(raw)) {
    return 'สั่งน้ำดื่มได้ที่แท็บ «หน้าแรก» (น้ำ) ครับ เลือกจำนวนแล้วกดสั่งได้เลย'
  }
  if (/บิล|ใบเสร็จ|ชำระ/i.test(raw)) {
    return 'ดูบิลและใบเสร็จได้ที่แท็บ «บิล» ครับ'
  }
  if (/ตะกร้า/i.test(raw)) {
    return 'จัดการตะกร้าได้ที่แท็บ «ตะกร้า» ครับ'
  }
  if (/โปรไฟล์|บัญชี/i.test(raw)) {
    return 'ตั้งค่าโปรไฟล์ได้ที่แท็บ «โปรไฟล์» ครับ'
  }
  if (/ใคร|คืออะไร|ชื่อ.*บอท|บอท.*ชื่อ|ลุคซาเก้ท|ลุคซา|เก้ท/i.test(raw)) {
    return 'เราคือบอทลุคซาเก้ทครับ มาช่วยตอบเรื่องสั่งน้ำ บิล และตะกร้า — ถามได้เลย'
  }
  if (t.length <= 2) {
    return 'พิมพ์คำถามเพิ่มนิดได้ไหมครับ ลุคซาเก้ทจะได้ช่วยตอบให้ตรงจุดขึ้น'
  }
  const greet = userName ? `คุณ${userName} ` : ''
  return `${greet}ตอนนี้เราตอบแบบจำกัดครับ ลองถามเรื่องสั่งน้ำ บิล หรือตะกร้าได้ — หรือตั้งค่า NUXT_OPENAI_API_KEY เพื่อให้ตอบละเอียดขึ้นครับ`
}

type ChatBody = { messages?: ChatTurn[]; userName?: string }

export default defineEventHandler(async (event) => {
  let body: ChatBody = {}
  try {
    body = await readBody<ChatBody>(event)
  } catch {
    body = {}
  }
  const turns = Array.isArray(body.messages) ? body.messages : []
  const lastUser = [...turns].reverse().find((m) => m.role === 'user')?.content?.trim() || ''
  const userName = (body.userName ?? '').trim().slice(0, 40)

  if (!lastUser) {
    return { reply: 'ยังไม่ได้รับข้อความครับ ลองพิมพ์อีกครั้งนะ' }
  }

  const config = useRuntimeConfig(event)
  const apiKey = (config.openaiApiKey as string)?.trim()

  const nameLine = userName
    ? `The user's nickname is "${userName}" — address them as คุณ${userName} when natural.`
    : 'The user has not given a nickname yet.'

  if (apiKey) {
    try {
      const res = await $fetch<{
        choices?: { message?: { content?: string } }[]
      }>('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                `You are **ลุคซาเก้ท** (LucaGet) — one friendly chatbot persona for a Thai water-delivery app (LunarWater). Use first person ("เรา" / "ผม") naturally. Reply in Thai unless the user uses another language. Be concise (2–5 sentences). ${nameLine} Help with orders, bills, cart, profile: bottom tabs หน้าแรก (น้ำ), บิล, ตะกร้า, โปรไฟล์. Never say you are two separate bots named Get and Luca; your single name is ลุคซาเก้ท.`,
            },
            ...turns.slice(-24),
          ],
          temperature: 0.65,
        },
      })
      const text = res.choices?.[0]?.message?.content?.trim()
      if (text) return { reply: text }
    } catch {
      // fall through to local
    }
  }

  return { reply: localReplyTh(lastUser, userName) }
})

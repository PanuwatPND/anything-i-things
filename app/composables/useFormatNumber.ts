/**
 * จัดรูปแบบจำนวนเต็มแบบมีเครื่องหมายคั่นหลักพัน (เช่น 1,020) ใช้ทั่วแอป
 */
export function useFormatNumber() {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  })

  const formatInt = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') return '0'
    const n =
      typeof value === 'string'
        ? Number(String(value).replace(/,/g, '').trim())
        : Number(value)
    if (!Number.isFinite(n)) return '0'
    return formatter.format(Math.trunc(n))
  }

  return { formatInt }
}

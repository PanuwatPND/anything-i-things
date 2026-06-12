export type OcrResult = {
  amountBaht: number | null
  payerHint: string | null
  confidence: number
}

export const useSlipOcr = () => {
  const { updateSlipVerification } = useWatershopReceipts()

  const runOcr = async (
    receiptId: string,
    imageParts: { base64: string; mimeType: string },
    orderAmountHint?: number,
  ): Promise<OcrResult> => {
    const res = await $fetch<OcrResult>('/api/admin/slip-read', {
      method: 'POST',
      body: {
        imageBase64: imageParts.base64,
        mimeType: imageParts.mimeType,
        orderAmountHint,
      },
    })

    const ocrMessage =
      res.amountBaht != null
        ? `ยอด ${res.amountBaht} ฿${res.payerHint ? ` · ${res.payerHint}` : ''}`
        : res.payerHint
          ? `ระบุผู้โอน (${res.payerHint}) — กรุณากรอกยอดมือในแท็บตรวจสอบ`
          : 'ไม่พบยอดที่ชัดเจนบนสลิป — กรุณากรอกยอดมือในแท็บตรวจสอบ'

    updateSlipVerification(receiptId, {
      amountOnSlip: res.amountBaht ?? undefined,
      payerHint: res.payerHint ?? undefined,
      amountFromOcr: res.amountBaht != null,
      ocrConfidence: res.confidence,
      ocrReadAt: new Date().toISOString(),
      ocrMessage,
    })

    return res
  }

  return { runOcr }
}

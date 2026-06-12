interface DialogOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  showCancel?: boolean
}

interface DialogState extends Required<DialogOptions> {
  open: boolean
  resolve: ((value: boolean) => void) | null
}

const DEFAULT: DialogState = {
  open: false,
  title: '',
  description: '',
  confirmText: 'ยืนยัน',
  cancelText: 'ยกเลิก',
  variant: 'default',
  showCancel: true,
  resolve: null,
}

export const useAlertDialog = () => {
  const state = useState<DialogState>('alert-dialog-state', () => ({ ...DEFAULT }))

  const confirm = (opts: DialogOptions): Promise<boolean> =>
    new Promise((resolve) => {
      state.value = {
        open: true,
        title: opts.title,
        description: opts.description ?? '',
        confirmText: opts.confirmText ?? 'ยืนยัน',
        cancelText: opts.cancelText ?? 'ยกเลิก',
        variant: opts.variant ?? 'default',
        showCancel: opts.showCancel ?? true,
        resolve,
      }
    })

  const alert = (opts: Omit<DialogOptions, 'showCancel' | 'cancelText'>): Promise<boolean> =>
    confirm({ ...opts, showCancel: false, confirmText: opts.confirmText ?? 'ตกลง' })

  const respond = (value: boolean) => {
    state.value.resolve?.(value)
    state.value = { ...DEFAULT }
  }

  return { state, confirm, alert, respond }
}

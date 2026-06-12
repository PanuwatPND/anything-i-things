export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration: number
}

export const useToast = () => {
  const toasts = useState<Toast[]>('toast-list', () => [])

  const show = (type: ToastType, title: string, description?: string, duration = 2500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    toasts.value = [...toasts.value, { id, type, title, description, duration }]
    if (import.meta.client) {
      setTimeout(() => remove(id), duration)
    }
  }

  const remove = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    success: (title: string, description?: string) => show('success', title, description, 2500),
    error: (title: string, description?: string) => show('error', title, description, 3500),
    info: (title: string, description?: string) => show('info', title, description, 2500),
    remove,
  }
}

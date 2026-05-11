type AuthUser = {
  email: string
  role: 'user' | 'admin'
  name?: string
  houseNo?: string
  avatar?: string
}

const AUTH_STORAGE_KEY = 'watershop-auth-user'

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth-user', () => null)

  const isLoggedIn = computed(() => Boolean(user.value))

  const hydrate = () => {
    if (!import.meta.client) return

    const rawUser = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!rawUser) {
      user.value = null
      return
    }

    try {
      const parsed = JSON.parse(rawUser) as Partial<AuthUser>
      if (!parsed || typeof parsed.email !== 'string' || (parsed.role !== 'user' && parsed.role !== 'admin')) {
        user.value = null
        localStorage.removeItem(AUTH_STORAGE_KEY)
        return
      }

      user.value = {
        email: parsed.email,
        role: parsed.role,
        name: typeof parsed.name === 'string' ? parsed.name : '',
        houseNo: typeof parsed.houseNo === 'string' ? parsed.houseNo : '',
        avatar: typeof parsed.avatar === 'string' ? parsed.avatar : '',
      }
    } catch {
      user.value = null
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  const login = async (email: string, _password: string, role: 'user' | 'admin') => {
    const normalizedEmail = email.trim().toLowerCase()
    const fallbackEmail = `${role}-guest@watershop.local`
    const safeEmail = normalizedEmail || fallbackEmail

    const nextUser: AuthUser = { email: safeEmail, role, name: '', houseNo: '', avatar: '' }
    user.value = nextUser

    if (import.meta.client) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
    }
  }

  const logout = () => {
    user.value = null

    if (import.meta.client) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  const updateProfile = (payload: { name: string; houseNo: string; avatar: string }) => {
    if (!user.value) return

    const nextUser: AuthUser = {
      ...user.value,
      name: payload.name.trim(),
      houseNo: payload.houseNo.trim(),
      avatar: payload.avatar.trim(),
    }
    user.value = nextUser

    if (import.meta.client) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
    }
  }

  return {
    user,
    isLoggedIn,
    hydrate,
    login,
    logout,
    updateProfile,
  }
}

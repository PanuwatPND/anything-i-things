type AuthUser = {
  email: string
  role: 'user' | 'admin'
}

const AUTH_STORAGE_KEY = 'watershop-auth-user'

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth-user', () => null)

  const isLoggedIn = computed(() => Boolean(user.value))

  const hydrate = () => {
    if (!import.meta.client) return

    const rawUser = localStorage.getItem(AUTH_STORAGE_KEY)
    user.value = rawUser ? (JSON.parse(rawUser) as AuthUser) : null
  }

  const login = async (email: string, _password: string, role: 'user' | 'admin') => {
    const normalizedEmail = email.trim().toLowerCase()
    const fallbackEmail = `${role}-guest@watershop.local`
    const safeEmail = normalizedEmail || fallbackEmail

    const nextUser = { email: safeEmail, role }
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

  return {
    user,
    isLoggedIn,
    hydrate,
    login,
    logout,
  }
}

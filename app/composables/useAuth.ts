import { ref, onMounted } from 'vue'

export interface User {
  id: string
  email: string
  fullName: string
  accountType: string
  status?: string
  isAdmin?: boolean
}

const API_BASE_URL = '/api'

export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => {
    if (import.meta.client) {
      try {
        const savedToken = localStorage.getItem('authToken')
        if (savedToken && savedToken.startsWith('mock_token_')) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          localStorage.removeItem('userId')
          return null
        }
        const savedUser = localStorage.getItem('user')
        return savedUser ? JSON.parse(savedUser) : null
      } catch {
        return null
      }
    }
    return null
  })

  const token = useState<string | null>('auth-token', () => {
    if (import.meta.client) {
      const savedToken = localStorage.getItem('authToken')
      if (savedToken && savedToken.startsWith('mock_token_')) {
        return null
      }
      return savedToken
    }
    return null
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Safe client side initialization and synchronisation fallback
  onMounted(() => {
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('user')
    const savedUserId = localStorage.getItem('userId')

    // Purge any stale mock token from previous sessions
    if (savedToken && savedToken.startsWith('mock_token_')) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userId')
      token.value = null
      user.value = null
      return
    }

    if (savedToken && savedUser) {
      token.value = savedToken
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        user.value = {
          id: savedUserId || '1001',
          email: '',
          fullName: 'User',
          accountType: 'checking'
        }
      }
    }
  })

  const healthCheck = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/health', {
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch {
      return false
    }
  }

  // Internal flag to prevent infinite refresh loops
  let _isRefreshing = false
  let _refreshPromise: Promise<string | null> | null = null

  const silentRefresh = async (): Promise<string | null> => {
    // Deduplicate concurrent refresh calls
    if (_isRefreshing && _refreshPromise) return _refreshPromise

    _isRefreshing = true
    _refreshPromise = (async () => {
      try {
        // The httpOnly refresh_token cookie is sent automatically by the browser
        const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include', // ensures cookie is sent
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })

        if (!res.ok) return null

        const json = await res.json()
        // sendSuccess wraps: { success, data: { access_token, refresh_token } }
        const payload = json?.data?.data ?? json?.data ?? json
        const newToken = payload?.access_token

        if (newToken) {
          token.value = newToken
          localStorage.setItem('authToken', newToken)
          return newToken
        }
        return null
      } catch {
        return null
      } finally {
        _isRefreshing = false
        _refreshPromise = null
      }
    })()

    return _refreshPromise
  }

  const apiCall = async <T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    bodyData?: Record<string, any>,
    _isRetry = false  // internal: prevents infinite retry loops
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    const makeRequest = async (accessToken: string | null) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const options: RequestInit = {
        method,
        headers,
        credentials: 'include' // send cookies (refresh_token) on every request
      }

      if ((method === 'POST' || method === 'PUT') && bodyData) {
        options.body = JSON.stringify(bodyData)
      }

      return fetch(`${API_BASE_URL}${endpoint}`, options)
    }

    try {
      const activeToken = token.value || localStorage.getItem('authToken')

      // If active token is a fake mock token, reject immediately to avoid 401 spam
      if (activeToken && activeToken.startsWith('mock_token_')) {
        logout()
        return { success: false, error: 'Session expired. Please log in again.' }
      }

      let response = await makeRequest(activeToken)

      // Silent refresh on 401 for non-auth endpoints
      const isAuthEndpoint = endpoint.startsWith('/auth/')
      if (response.status === 401 && !isAuthEndpoint && !_isRetry) {
        const newToken = await silentRefresh()

        if (newToken) {
          // Retry original request with fresh token
          response = await makeRequest(newToken)
        } else {
          // Refresh failed — session truly expired, force logout
          logout()
          const isDashboard = endpoint.startsWith('/dashboard') || !endpoint.startsWith('/admin')
          navigateTo(isDashboard ? '/login' : '/admin/login')
          return { success: false, error: 'Session expired. Please log in again.' }
        }
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        const errorMsg = typeof errJson.error === 'object' && errJson.error
          ? errJson.error.message
          : (errJson.error || errJson.message || `HTTP error ${response.status}`)
        return { success: false, error: errorMsg }
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (e: any) {
      console.error('API Call Error:', e)
      return { success: false, error: e.message || 'Network connection failed' }
    }
  }

  const login = async (emailVal: string, passwordVal: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiCall<any>('/auth/login', 'POST', {
        email: emailVal,
        password: passwordVal
      })

      // apiCall wraps the server response in { success, data }.
      // The server returns { success, data: { access_token, user } }, so the
      // actual payload is at response.data.data (or response.data if already flat).
      const loginPayload = response.data?.data ?? response.data

      if (response.success && loginPayload?.access_token) {
        token.value = loginPayload.access_token
        localStorage.setItem('authToken', loginPayload.access_token)

        const rawUser = loginPayload.user || {}
        const isAdminUser = rawUser.role === 'admin' || rawUser.role === 'superadmin' || rawUser.isAdmin === true

        const userData: User = {
          id: rawUser.id?.toString() || '1',
          email: rawUser.email || emailVal,
          fullName: rawUser.fullName || rawUser.full_name || (emailVal.split('@')[0] || 'User').toUpperCase(),
          accountType: rawUser.accountType || 'checking',
          status: rawUser.status || 'active',
          isAdmin: isAdminUser
        }

        user.value = userData
        localStorage.setItem('userId', userData.id)
        localStorage.setItem('user', JSON.stringify(userData))

        // Background profile enrichment if needed (non-blocking)
        apiCall<any>('/dashboard/profile', 'GET').then((profileRes) => {
          const profileData = profileRes.data?.data?.data ?? profileRes.data?.data ?? profileRes.data
          if (profileRes.success && profileData) {
            const updatedUser: User = {
              ...userData,
              fullName: profileData.fullName || profileData.full_name || userData.fullName,
              accountType: profileData.accountType || userData.accountType,
              status: profileData.status || userData.status,
              isAdmin: profileData.role === 'admin' || profileData.role === 'superadmin' || profileData.isAdmin === true
            }
            user.value = updatedUser
            localStorage.setItem('user', JSON.stringify(updatedUser))
          }
        }).catch(() => {})

        isLoading.value = false
        if (isAdminUser) {
          navigateTo('/admin')
        } else {
          navigateTo('/dashboard')
        }
        return true
      }

      error.value = response.error || (response.data?.error?.message) || 'Login failed. Check your credentials.'
      isLoading.value = false
      return false
    } catch (e: any) {
      error.value = e?.message || 'Failed to connect to backend server. Please try again.'
      isLoading.value = false
      return false
    }
  }

  const register = async (emailVal: string, passwordVal: string, fullNameVal: string, accountTypeVal: string, phoneVal: string = '0000000000') => {
    isLoading.value = true
    error.value = null

    try {
      const regResponse = await apiCall<any>('/auth/register', 'POST', {
        email: emailVal,
        password: passwordVal,
        full_name: fullNameVal,
        phone: phoneVal || undefined
      })

      if (!regResponse.success) {
        error.value = regResponse.error || 'Registration failed'
        isLoading.value = false
        return false
      }

      // Auto-login with real credentials
      return await login(emailVal, passwordVal)
    } catch (e: any) {
      error.value = e?.message || 'Failed to connect to backend.'
      isLoading.value = false
      return false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('user')
    navigateTo('/login')
  }

  return {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    apiCall
  }
}

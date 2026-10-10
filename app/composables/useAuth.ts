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
      return localStorage.getItem('authToken')
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
        signal: AbortSignal.timeout(1500)
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
          headers: { 'Content-Type': 'application/json' }
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
      const isHealthy = await healthCheck()

      if (!isHealthy) {
        console.warn('Backend server not running. Using mock login fallback.')
        const isDefaultAdmin = emailVal.toLowerCase().includes('admin')
        const mockUser: User = {
          id: '1001',
          email: emailVal,
          fullName: (emailVal.split('@')[0] || '').toUpperCase(),
          accountType: 'Checking',
          status: 'Active',
          isAdmin: isDefaultAdmin
        }

        token.value = 'mock_token_' + Date.now()
        user.value = mockUser

        localStorage.setItem('authToken', token.value)
        localStorage.setItem('userId', mockUser.id)
        localStorage.setItem('user', JSON.stringify(mockUser))

        setTimeout(() => {
          isLoading.value = false
          if (isDefaultAdmin) {
            navigateTo('/admin')
          } else {
            navigateTo('/dashboard')
          }
        }, 800)
        return true
      }

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

              // Fetch full profile using the Nuxt backend endpoint
        const profileRes = await apiCall<any>('/dashboard/profile', 'GET')
        // apiCall wraps server JSON: { success, data: <serverJson> }
        // Server sendSuccess returns: { success, data: user }
        // So actual user is at profileRes.data?.data?.data ?? profileRes.data?.data
        const profileData = profileRes.data?.data?.data ?? profileRes.data?.data ?? profileRes.data

        if (profileRes.success && profileData) {
          const isAdminUser = profileData.role === 'admin' || profileData.role === 'superadmin'
          const userData: User = {
            id: profileData.id?.toString() || '1001',
            email: profileData.email || emailVal,
            fullName: profileData.fullName || profileData.full_name || emailVal.split('@')[0],
            accountType: 'checking',
            isAdmin: isAdminUser
          }

          user.value = userData
          localStorage.setItem('userId', userData.id)
          localStorage.setItem('user', JSON.stringify(userData))

          isLoading.value = false
          if (isAdminUser) {
            navigateTo('/admin')
          } else {
            navigateTo('/dashboard')
          }
          return true
        }
      }

      error.value = response.error || (response.data?.error?.message) || 'Login failed. Check your credentials.'
      isLoading.value = false
      return false
    } catch (e: any) {
      error.value = 'Failed to connect to backend.'
      isLoading.value = false
      return false
    }
  }

  const register = async (emailVal: string, passwordVal: string, fullNameVal: string, accountTypeVal: string, phoneVal: string = '0000000000') => {
    isLoading.value = true
    error.value = null

    try {
      const isHealthy = await healthCheck()

      if (!isHealthy) {
        console.warn('Backend server not running. Using mock registration fallback.')
        const isDefaultAdmin = emailVal.toLowerCase().includes('admin')
        const mockUser: User = {
          id: Math.floor(Math.random() * 10000).toString(),
          email: emailVal,
          fullName: fullNameVal,
          accountType: accountTypeVal,
          status: 'Active',
          isAdmin: isDefaultAdmin
        }

        token.value = 'mock_token_' + Date.now()
        user.value = mockUser

        localStorage.setItem('authToken', token.value)
        localStorage.setItem('userId', mockUser.id)
        localStorage.setItem('user', JSON.stringify(mockUser))

        setTimeout(() => {
          isLoading.value = false
          if (isDefaultAdmin) {
            navigateTo('/admin')
          } else {
            navigateTo('/dashboard')
          }
        }, 800)
        return true
      }

      const regResponse = await apiCall<any>('/auth/register', 'POST', {
        email: emailVal,
        password: passwordVal,
        full_name: fullNameVal,
        // username omitted — backend auto-generates a unique one from email prefix + random suffix
        phone: phoneVal || undefined
      })

      if (!regResponse.success) {
        error.value = regResponse.error || 'Registration failed'
        isLoading.value = false
        return false
      }

      // Auto-login
      return await login(emailVal, passwordVal)
    } catch (e: any) {
      error.value = 'Failed to connect to backend.'
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

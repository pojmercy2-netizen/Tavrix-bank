<template>
  <div class="magic-page">
    <div class="magic-card">
      <!-- Loading State -->
      <div v-if="state === 'loading'" class="card-content">
        <div class="spinner-container">
          <div class="spinner-glow" />
          <Icon name="lucide:loader-2" class="spin-icon text-indigo" :size="48" />
        </div>
        <h2 class="magic-title">Verifying Magic Link</h2>
        <p class="magic-desc">Please wait while we securely authenticate and log you into your account...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="state === 'success'" class="card-content success">
        <div class="icon-wrap">
          <Icon name="lucide:check-circle-2" class="success-icon animate-scale" :size="48" />
        </div>
        <h2 class="magic-title">Authentication Successful</h2>
        <p class="magic-desc">Welcome back! You are successfully signed in. Redirecting to your dashboard...</p>
        <div class="progress-bar-wrap">
          <div class="progress-bar" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="card-content error">
        <div class="icon-wrap error-icon-wrap">
          <Icon name="lucide:x-circle" class="error-icon animate-shake" :size="48" />
        </div>
        <h2 class="magic-title">Invalid or Expired Link</h2>
        <p class="magic-desc">{{ errorMessage }}</p>
        <NuxtLink to="/login" class="login-btn">
          <Icon name="lucide:arrow-left" :size="16" />
          Back to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

useHead({
  title: 'Magic Login | Tavrix Bank'
})

const route = useRoute()
const state = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('This magic link has expired or is invalid. Please contact support or request a new login link.')
const auth = useAuth()

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    state.value = 'error'
    errorMessage.value = 'Security token is missing in the link. Please double check the link you received.'
    return
  }

  // Small artificial delay for smooth experience
  await new Promise(resolve => setTimeout(resolve, 1500))

  let backendReachable = false

  try {
    // 1. Try to verify token against backend if backend is online
    const res = await auth.apiCall<any>(`/auth/magic-login?token=${token}`, 'POST')
    backendReachable = true

    // Backend responded — unwrap the data (sendSuccess wraps in { success, data: {...} })
    const payload = res.data?.data ?? res.data

    if (res.success && payload?.access_token) {
      localStorage.setItem('authToken', payload.access_token)
      if (payload.user) {
        localStorage.setItem('userId', payload.user.id)
        localStorage.setItem('user', JSON.stringify({
          id: payload.user.id,
          email: payload.user.email,
          fullName: payload.user.fullName || payload.user.full_name,
          accountType: 'Checking',
          status: 'Active',
          isAdmin: payload.user.role === 'admin' || payload.user.role === 'superadmin'
        }))
      }
      state.value = 'success'
      setTimeout(() => {
        navigateTo('/dashboard')
      }, 1500)
      return
    }

    // Backend is online but returned an error (invalid token, banned account, etc.)
    errorMessage.value = res.error || 'This magic link is invalid or has expired. Please request a new one.'
    state.value = 'error'
    return

  } catch (err) {
    console.warn('Backend call threw an exception, trying local storage fallback:', err)
  }

  // 2. Local storage mock fallback (only reached if backend is completely unreachable)
  if (backendReachable) {
    // Backend was reachable but something unexpected happened — don't use mock
    state.value = 'error'
    return
  }

  try {
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]')
    const matchedUser = mockUsers.find((u: any) => u.login_token === token)

    if (matchedUser) {
      if (matchedUser.is_banned) {
        state.value = 'error'
        errorMessage.value = 'This account has been suspended. Please contact administration.'
        return
      }

      // Generate a mock auth token
      const sessionToken = 'mock_token_' + token
      localStorage.setItem('authToken', sessionToken)
      localStorage.setItem('userId', matchedUser.id)
      localStorage.setItem('user', JSON.stringify({
        id: matchedUser.id,
        email: matchedUser.email,
        fullName: matchedUser.full_name,
        accountType: 'Checking',
        status: 'Active',
        isAdmin: matchedUser.role === 'admin'
      }))

      state.value = 'success'
      setTimeout(() => {
        navigateTo('/dashboard')
      }, 1500)
    } else {
      state.value = 'error'
    }
  } catch (e) {
    state.value = 'error'
  }
})
</script>

<style scoped>
.magic-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(circle at top, #0f172a 0%, #020617 100%);
  padding: 24px;
  font-family: 'Inter', sans-serif;
}

.magic-card {
  width: 100%;
  max-width: 440px;
  background: rgba(13, 20, 36, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 40px 32px;
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.spinner-container {
  position: relative;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.spinner-glow {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%);
}

.spin-icon {
  animation: spin 1s linear infinite;
}

.text-indigo {
  color: #818cf8;
}

.icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.success-icon {
  color: #34d399;
}

.error-icon-wrap {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.error-icon {
  color: #f87171;
}

.magic-title {
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}

.magic-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.6;
}

.progress-bar-wrap {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 24px;
}

.progress-bar {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 2px;
  animation: fillProgress 1.5s ease-in-out forwards;
}

.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #f1f5f9;
  font-size: 13.5px;
  font-weight: 600;
  text-decoration: none;
  margin-top: 24px;
  transition: all 0.2s;
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fillProgress {
  to { width: 100%; }
}

.animate-scale {
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes scaleIn {
  from { transform: scale(0.6); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-subtitle">Log in to your Tavrix Bank account</p>
      </div>
      
      <div v-if="auth.error.value" class="error-banner">
        ⚠️ {{ auth.error.value }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label" for="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            class="form-input" 
            placeholder="Enter your email" 
            v-model="email"
            required 
          />
        </div>
        
        <div class="form-group">
          <div class="password-label-wrapper">
            <label class="form-label mb-0" for="password">Password</label>
            <a href="#" class="auth-link text-xs" @click.prevent="handleForgotPassword">Forgot Password?</a>
          </div>
          <input 
            type="password" 
            id="password" 
            class="form-input" 
            placeholder="Enter your password" 
            v-model="password"
            required 
          />
        </div>
        
        <button type="submit" class="btn btn-primary auth-btn mt-3" :disabled="auth.isLoading.value">
          <span v-if="auth.isLoading.value" class="flex items-center gap-2">
            <Icon name="i-lucide-loader-2" class="spin w-4 h-4" />
            Logging In...
          </span>
          <span v-else>Log In</span>
        </button>
      </form>
      
      <div class="auth-footer">
        Don't have an account? <NuxtLink to="/register" class="auth-link">Open an Account</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'Log In | Tavrix Bank'
})

const email = ref('')
const password = ref('')
const auth = useAuth()

const handleLogin = async () => {
  await auth.login(email.value, password.value)
}

const handleForgotPassword = async () => {
  const userEmail = email.value || (import.meta.client ? window.prompt('Please enter your email address to reset your password:') : '')
  if (!userEmail) return

  auth.isLoading.value = true
  const res = await auth.apiCall<any>('/auth/forgot-password', 'POST', { email: userEmail })
  auth.isLoading.value = false

  if (res.success) {
    if (import.meta.client) {
      window.alert(res.data?.message || 'A password reset link has been simulated and sent to your email address!')
    }
  } else {
    if (import.meta.client) {
      window.alert(`Error: ${res.error || 'Failed to send reset request.'}`)
    }
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 180px); /* accounts for header/footer */
  background-color: var(--color-background-subtle);
  padding: 80px 24px;
}

.dark .auth-page {
  background-color: var(--color-background-dark);
}

.auth-card {
  background: var(--color-surface);
  width: 100%;
  max-width: 480px;
  padding: 48px;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--color-border);
}

.dark .auth-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.dark .auth-title {
  color: var(--color-text-light);
}

.auth-subtitle {
  color: var(--color-text-muted);
  font-size: 14px;
}

.dark .auth-subtitle {
  color: #94a3b8;
}

.error-banner {
  background-color: var(--color-error-bg);
  color: var(--color-error);
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.password-label-wrapper {
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 8px;
}

.auth-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted);
}

.dark .auth-footer {
  color: #94a3b8;
}

.auth-link {
  color: var(--color-secondary);
  font-weight: 500;
}

.auth-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 32px 20px;
  }
}
</style>

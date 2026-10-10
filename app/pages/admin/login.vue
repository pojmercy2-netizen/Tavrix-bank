<template>
  <div class="admin-auth-page">
    <div class="admin-auth-card">
      <div class="admin-auth-header">
        <div class="security-badge">
          <Icon name="lucide:shield-alert" class="w-8 h-8 text-amber-500" />
        </div>
        <h1 class="admin-auth-title">Secured Admin Portal</h1>
        <p class="admin-auth-subtitle">Authorized personnel only. Logs are active.</p>
      </div>

      <div v-if="errorMessage" class="error-banner">
        ⚠️ {{ errorMessage }}
      </div>

      <form @submit.prevent="handleAdminLogin">
        <div class="form-group">
          <label class="form-label" for="email">Admin Email / Username</label>
          <input
            id="email"
            v-model="email"
            type="text"
            class="form-input"
            placeholder="admin@tavrixbank.com"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input password-input"
              placeholder="••••••••"
              required
              :disabled="isLoading"
            />
            <button
              type="button"
              class="password-toggle-btn"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary admin-auth-btn" :disabled="isLoading">
          <span v-if="isLoading" class="flex items-center gap-2">
            <Icon name="lucide:loader-2" class="spin w-4 h-4" />
            Authenticating...
          </span>
          <span v-else>Access Console</span>
        </button>
      </form>

      <div class="admin-auth-footer">
        <NuxtLink to="/login" class="back-link">
          <Icon name="lucide:arrow-left" class="w-4 h-4" />
          Standard Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: false
})

useHead({
  title: 'Secure Admin Login | Tavrix Bank'
})

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const auth = useAuth()

const handleAdminLogin = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const success = await auth.login(email.value, password.value)
    if (success) {
      if (auth.user.value?.isAdmin) {
        navigateTo('/admin')
      } else {
        errorMessage.value = 'Access denied. Administrator privileges required.'
        auth.logout()
      }
    } else {
      errorMessage.value = auth.error.value || 'Invalid credentials or insufficient privileges.'
    }
  } catch (err) {
    errorMessage.value = 'An error occurred during authentication.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.admin-auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #020c1b;
  padding: 24px;
}

.admin-auth-card {
  background: #0d192d;
  width: 100%;
  max-width: 440px;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.admin-auth-header {
  text-align: center;
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.security-badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.admin-auth-title {
  font-size: 24px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 6px;
}

.admin-auth-subtitle {
  color: #64748b;
  font-size: 13px;
}

.error-banner {
  background-color: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.25);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  line-height: 1.4;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(2, 12, 27, 0.5);
  font-size: 14px;
  color: #f1f5f9;
  outline: none;
  transition: border-color 0.15s ease-in-out;
}

.form-input:focus {
  border-color: rgba(245, 158, 11, 0.5);
}

.password-input-wrapper {
  position: relative;
  display: flex;
}

.password-input {
  padding-right: 44px;
}

.password-toggle-btn {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background: none;
}

.admin-auth-btn {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 10px;
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);
}

.admin-auth-btn:hover {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(217, 119, 6, 0.4);
}

.admin-auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.admin-auth-footer {
  margin-top: 24px;
  text-align: center;
  display: flex;
  justify-content: center;
}

.back-link {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  transition: color 0.15s ease;
}

.back-link:hover {
  color: #94a3b8;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 0.8s linear infinite;
}
</style>

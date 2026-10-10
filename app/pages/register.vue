<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">Open an Account</h1>
        <p class="auth-subtitle">Join Tavrix Bank and bank smarter today</p>
      </div>
      
      <div v-if="auth.error.value" class="error-banner">
        ⚠️ {{ auth.error.value }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label" for="fullName">Full Name</label>
          <input 
            type="text" 
            id="fullName" 
            class="form-input" 
            placeholder="Enter your full name"
            v-model="fullName"
            required 
          />
        </div>

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
          <label class="form-label" for="phone">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            class="form-input" 
            placeholder="Enter your 10-digit phone number"
            v-model="phone"
            minlength="10"
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="accountType">Account Type</label>
          <select 
            id="accountType" 
            class="form-input form-select" 
            v-model="accountType"
            required 
          >
            <option value="" disabled>Select account type</option>
            <option value="checking">Everyday Checking</option>
            <option value="savings">High-Yield Savings</option>
            <option value="business">Business Checking</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            class="form-input" 
            placeholder="Create a strong password"
            v-model="password"
            required 
          />
        </div>
        
        <button type="submit" class="btn btn-primary auth-btn mt-3" :disabled="auth.isLoading.value">
          <span v-if="auth.isLoading.value" class="flex items-center gap-2">
            <Icon name="i-lucide-loader-2" class="spin w-4 h-4" />
            Creating Account...
          </span>
          <span v-else>Create Account</span>
        </button>
      </form>
      
      <div class="auth-footer">
        Already have an account? <NuxtLink to="/login" class="auth-link">Log In</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'Open an Account | Tavrix Bank'
})

const fullName = ref('')
const email = ref('')
const phone = ref('')
const accountType = ref('')
const password = ref('')

const auth = useAuth()

const handleSubmit = async () => {
  await auth.register(
    email.value,
    password.value,
    fullName.value,
    accountType.value,
    phone.value
  )
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

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
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

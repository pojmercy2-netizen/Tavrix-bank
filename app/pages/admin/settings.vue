<template>
  <div class="admin-page fade-in">
    <div class="page-header">
      <div>
        <h1 class="admin-page-title">Platform Settings</h1>
        <p class="page-subtitle">Configure global website contacts and support details</p>
      </div>
    </div>

    <!-- Alert -->
    <div v-if="alert.show" :class="['alert-banner', alert.type]">
      <Icon :name="alert.type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'" class="w-4 h-4" />
      <span>{{ alert.message }}</span>
      <button class="alert-close" @click="alert.show = false">
        <Icon name="lucide:x" class="w-4 h-4" />
      </button>
    </div>

    <div class="settings-layout">
      <!-- Settings Form -->
      <div class="admin-card settings-card">
        <h3 class="card-title">Customer Support Info</h3>
        <p class="card-desc">These contacts are displayed on the public landing page (FAQ and Contact Us sections).</p>

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin text-indigo-500" />
          <span>Loading current settings...</span>
        </div>

        <form v-else class="settings-form" @submit.prevent="handleSave">
          <div class="form-group">
            <label class="form-label" for="support-email">Support Email Address</label>
            <div class="input-icon-wrapper">
              <Icon name="lucide:mail" class="input-icon" />
              <input
                id="support-email"
                v-model="form.supportEmail"
                type="email"
                placeholder="support@example.com"
                class="form-input with-icon"
                required
              />
            </div>
            <span class="input-help">All mailto links and public support forms will direct here</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="support-phone">Support Helpline Number</label>
            <div class="input-icon-wrapper">
              <Icon name="lucide:phone" class="input-icon" />
              <input
                id="support-phone"
                v-model="form.supportPhone"
                type="text"
                placeholder="+1 (800) 555-0199"
                class="form-input with-icon"
                required
              />
            </div>
            <span class="input-help"> Helplines and call buttons will redirect here</span>
          </div>

          <button type="submit" class="save-btn" :disabled="saving">
            <Icon :name="saving ? 'lucide:loader-2' : 'lucide:save'" :class="['w-4 h-4', saving && 'spin-icon']" />
            <span>{{ saving ? 'Saving Changes...' : 'Save Settings' }}</span>
          </button>
        </form>
      </div>

      <!-- Preview Card -->
      <div class="admin-card preview-card">
        <h3 class="card-title">Live Preview</h3>
        <p class="card-desc">Here is how the contact details will appear to the visitors on landing pages.</p>
        
        <div class="preview-box">
          <div class="preview-item">
            <div class="preview-icon mail">
              <Icon name="lucide:mail" class="w-5 h-5" />
            </div>
            <div>
              <span class="preview-label">Email Us</span>
              <span class="preview-value">{{ form.supportEmail || 'support@tavrixbank.com' }}</span>
            </div>
          </div>

          <div class="preview-item">
            <div class="preview-icon phone">
              <Icon name="lucide:phone" class="w-5 h-5" />
            </div>
            <div>
              <span class="preview-label">Call Helpline</span>
              <span class="preview-value">{{ form.supportPhone || '+1 (800) 555-0199' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Platform Settings | Admin — Tavrix Bank' })

const auth = useAuth()
const loading = ref(true)
const saving = ref(false)

const form = reactive({
  supportEmail: '',
  supportPhone: ''
})

const alert = reactive({
  show: false,
  type: 'success' as 'success' | 'error',
  message: ''
})

const showAlert = (type: 'success' | 'error', message: string) => {
  alert.type = type
  alert.message = message
  alert.show = true
  setTimeout(() => { alert.show = false }, 5000)
}

const loadSettings = async () => {
  loading.value = true
  const res = await auth.apiCall<any>('/settings', 'GET')
  if (res.success && res.data) {
    const data = res.data?.data ?? res.data
    form.supportEmail = data.supportEmail || ''
    form.supportPhone = data.supportPhone || ''
  } else {
    showAlert('error', res.error || 'Failed to load support settings.')
  }
  loading.value = false
}

const handleSave = async () => {
  saving.value = true
  const res = await auth.apiCall<any>('/admin/settings', 'PUT', {
    supportEmail: form.supportEmail.trim(),
    supportPhone: form.supportPhone.trim()
  })

  if (res.success) {
    showAlert('success', 'Platform settings updated successfully!')
  } else {
    showAlert('error', res.error || 'Failed to save platform settings.')
  }
  saving.value = false
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.admin-page {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  margin-bottom: 8px;
}

.admin-page-title {
  font-size: 24px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 6px;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* Settings Layout */
.settings-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }
}

.admin-card {
  background: #0d1424;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.card-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 8px;
  line-height: 1.5;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  padding: 32px 0;
  justify-content: center;
}

/* Forms */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: rgba(255, 255, 255, 0.3);
  width: 16px;
  height: 16px;
}

.form-input.with-icon {
  padding-left: 38px;
}

.form-input {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 14px;
  color: #f1f5f9;
  font-size: 14px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.04);
}

.input-help {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Alert */
.alert-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 500;
}
.alert-banner.success {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #6ee7b7;
}
.alert-banner.error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}
.alert-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
}
.alert-close:hover { opacity: 1; }

/* Preview */
.preview-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 16px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-icon.mail {
  background: rgba(99, 102, 241, 0.12);
  color: #a5b4fc;
}

.preview-icon.phone {
  background: rgba(16, 185, 129, 0.12);
  color: #6ee7b7;
}

.preview-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.preview-value {
  font-size: 13.5px;
  font-weight: 600;
  color: #e2e8f0;
}

/* Animations */
.animate-spin {
  animation: spin 1s linear infinite;
}
.spin-icon {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

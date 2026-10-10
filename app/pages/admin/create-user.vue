<template>
  <div class="admin-page fade-in">
    <div class="page-header">
      <div>
        <h1 class="admin-page-title">Create User Account</h1>
        <p class="page-subtitle">Manually create a new user account and generate a magic login link</p>
      </div>
    </div>

    <div class="create-layout">
      <!-- Create Form -->
      <div class="form-panel">
        <div class="panel-title">
          <Icon name="lucide:user-plus" :size="18" />
          Account Details
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">First Name <span class="required">*</span></label>
            <input v-model="form.firstName" type="text" placeholder="John" class="form-input" :class="{ error: errors.firstName }" />
            <div v-if="errors.firstName" class="error-msg">{{ errors.firstName }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Last Name <span class="required">*</span></label>
            <input v-model="form.lastName" type="text" placeholder="Smith" class="form-input" :class="{ error: errors.lastName }" />
            <div v-if="errors.lastName" class="error-msg">{{ errors.lastName }}</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email Address <span class="required">*</span></label>
          <div class="input-with-icon">
            <Icon name="lucide:mail" :size="15" class="input-icon" />
            <input v-model="form.email" type="email" placeholder="john@example.com" class="form-input with-icon" :class="{ error: errors.email }" />
          </div>
          <div v-if="errors.email" class="error-msg">{{ errors.email }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <div class="input-with-icon">
            <Icon name="lucide:phone" :size="15" class="input-icon" />
            <input v-model="form.phone" type="tel" placeholder="+1 234 567 8900" class="form-input with-icon" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Initial Balance ($)</label>
            <div class="input-with-icon">
              <Icon name="lucide:dollar-sign" :size="15" class="input-icon" />
              <input v-model="form.balance" type="number" placeholder="0.00" min="0" step="0.01" class="form-input with-icon" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Account Currency</label>
            <select v-model="form.currency" class="form-select">
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="CAD">CAD — Canadian Dollar</option>
              <option value="AUD">AUD — Australian Dollar</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Account Role</label>
          <div class="role-tabs">
            <button v-for="role in roles" :key="role.value" class="role-tab" :class="{ active: form.role === role.value }" @click="form.role = role.value">
              <Icon :name="role.icon" :size="15" :style="{ color: role.color }" />
              <span>{{ role.label }}</span>
              <span class="role-desc">{{ role.desc }}</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">KYC Status</label>
          <div class="kyc-tabs">
            <button v-for="k in kycOptions" :key="k.value" class="kyc-tab" :class="[{ active: form.kycStatus === k.value }, k.value]" @click="form.kycStatus = k.value">
              <Icon :name="k.icon" :size="14" />
              {{ k.label }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Auto-generate Password?</label>
          <div class="toggle-row">
            <button class="toggle-btn" :class="{ on: form.autoPassword }" @click="form.autoPassword = !form.autoPassword">
              <span class="toggle-knob" />
            </button>
            <span class="toggle-label">{{ form.autoPassword ? 'System will generate a secure password' : 'I will set a password' }}</span>
          </div>
        </div>

        <div class="form-group" v-if="!form.autoPassword">
          <label class="form-label">Password <span class="required">*</span></label>
          <div class="input-with-icon">
            <Icon name="lucide:lock" :size="15" class="input-icon" />
            <input v-model="form.password" :type="showPwd ? 'text' : 'password'" placeholder="Min. 8 characters" class="form-input with-icon with-right" :class="{ error: errors.password }" />
            <button class="pwd-toggle" @click="showPwd = !showPwd" type="button">
              <Icon :name="showPwd ? 'lucide:eye-off' : 'lucide:eye'" :size="14" />
            </button>
          </div>
          <div v-if="errors.password" class="error-msg">{{ errors.password }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Admin Note (internal)</label>
          <textarea v-model="form.note" placeholder="Optional internal note about this account..." class="form-textarea" rows="3" maxlength="300"></textarea>
        </div>

        <button class="create-btn" :disabled="creating" @click="handleCreate">
          <Icon :name="creating ? 'lucide:loader-2' : 'lucide:user-plus'" :size="17" :class="{ 'spin-icon': creating }" />
          {{ creating ? 'Creating Account...' : 'Create Account' }}
        </button>
      </div>

      <!-- Result / Login Link Panel -->
      <div class="result-panel">
        <!-- Success Card -->
        <Transition name="slide-up">
          <div v-if="createdUser" class="success-card">
            <div class="success-header">
              <div class="success-icon-wrap">
                <Icon name="lucide:check-circle-2" :size="28" class="success-icon" />
              </div>
              <div>
                <div class="success-title">Account Created!</div>
                <div class="success-sub">User account is ready to use</div>
              </div>
            </div>

            <div class="user-summary">
              <div class="user-avatar-lg">{{ createdUser.firstName[0] }}{{ createdUser.lastName[0] }}</div>
              <div class="user-summary-info">
                <div class="user-fullname">{{ createdUser.firstName }} {{ createdUser.lastName }}</div>
                <div class="user-email-text">{{ createdUser.email }}</div>
                <div class="user-meta-row">
                  <span class="user-meta-badge role">{{ createdUser.role }}</span>
                  <span class="user-meta-badge kyc" :class="createdUser.kycStatus">{{ createdUser.kycStatus }}</span>
                </div>
              </div>
            </div>

            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">Account ID</div>
                <div class="detail-val monospace">{{ createdUser.id }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Starting Balance</div>
                <div class="detail-val green">${{ Number(createdUser.balance).toFixed(2) }}</div>
              </div>
              <div class="detail-item" v-if="createdUser.tempPassword">
                <div class="detail-label">Temp Password</div>
                <div class="detail-val monospace">{{ createdUser.tempPassword }}</div>
              </div>
            </div>

            <!-- Magic Login Link -->
            <div class="login-link-section">
              <div class="login-link-header">
                <Icon name="lucide:link-2" :size="15" />
                Magic Login Link
              </div>
              <p class="login-link-desc">Share this permanent link with the user. It logs them in automatically and <strong>never expires</strong>.</p>

              <div class="link-box">
                <div class="link-text">{{ loginLink }}</div>
                <button class="copy-btn" @click="copyLink" :class="{ copied: linkCopied }">
                  <Icon :name="linkCopied ? 'lucide:check' : 'lucide:copy'" :size="14" />
                  {{ linkCopied ? 'Copied!' : 'Copy' }}
                </button>
              </div>

              <div class="link-actions">
                <button class="link-action-btn" @click="regenerateLink">
                  <Icon name="lucide:refresh-cw" :size="14" />
                  Regenerate Link
                </button>
                <button class="link-action-btn email-btn" @click="handleSendEmail" :disabled="sendingEmail">
                  <Icon :name="sendingEmail ? 'lucide:loader-2' : 'lucide:mail'" :size="14" :class="{ 'spin-icon': sendingEmail }" />
                  {{ sendingEmail ? 'Sending...' : 'Send via Email' }}
                </button>
              </div>

              <div class="link-expiry">
                <Icon name="lucide:infinity" :size="12" />
                Permanent link – never expires
              </div>
            </div>

            <button class="new-user-btn" @click="resetForm">
              <Icon name="lucide:plus" :size="15" />
              Create Another User
            </button>
          </div>
        </Transition>

        <!-- Guide when no user created yet -->
        <div v-if="!createdUser" class="guide-card">
          <div class="guide-icon">
            <Icon name="lucide:user-plus" :size="32" />
          </div>
          <div class="guide-title">Create a New Account</div>
          <div class="guide-desc">Fill in the form on the left to create a user account. Once created, you''ll get a magic login link to share with the user.</div>

          <div class="guide-steps">
            <div class="guide-step" v-for="step in guideSteps" :key="step.num">
              <div class="step-num">{{ step.num }}</div>
              <div class="step-text">{{ step.text }}</div>
            </div>
          </div>
        </div>

        <!-- Recent Creations -->
        <div class="admin-card recent-card" v-if="recentlyCreated.length > 0">
          <div class="rc-header">
            <Icon name="lucide:history" :size="15" />
            Recently Created
          </div>
          <div class="rc-list">
            <div v-for="u in recentlyCreated" :key="u.id" class="rc-item">
              <div class="rc-avatar">{{ u.firstName[0] }}{{ u.lastName[0] }}</div>
              <div class="rc-body">
                <div class="rc-name">{{ u.firstName }} {{ u.lastName }}</div>
                <div class="rc-email">{{ u.email }}</div>
              </div>
              <div class="rc-time">{{ u.createdAgo }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <Icon :name="toast.type === 'success' ? 'lucide:check-circle' : 'lucide:x-circle'" :size="16" />
        {{ toast.msg }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Create User | Tavrix Bank Admin' })

const auth = useAuth()
const creating = ref(false)
const showPwd = ref(false)
const linkCopied = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  balance: 0,
  currency: 'USD',
  role: 'user',
  kycStatus: 'pending',
  autoPassword: true,
  password: '',
  note: ''
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
})

const roles = [
  { value: 'user', label: 'User', icon: 'lucide:user', color: '#94a3b8', desc: 'Standard account' },
  { value: 'vip', label: 'VIP', icon: 'lucide:star', color: '#fbbf24', desc: 'Premium features' },
  { value: 'admin', label: 'Admin', icon: 'lucide:shield', color: '#818cf8', desc: 'Full admin access' },
]

const kycOptions = [
  { value: 'pending', label: 'Pending', icon: 'lucide:clock' },
  { value: 'verified', label: 'Verified', icon: 'lucide:shield-check' },
  { value: 'rejected', label: 'Rejected', icon: 'lucide:x-circle' },
]

const guideSteps = [
  { num: '1', text: 'Fill in the user\'s name, email, and contact details' },
  { num: '2', text: 'Set an initial balance and account role if needed' },
  { num: '3', text: 'Click Create Account to register the user' },
  { num: '4', text: 'Copy the magic link and share it with the user' },
]

interface CreatedUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  kycStatus: string
  balance: number
  tempPassword?: string
  createdAgo?: string
}

const createdUser = ref<CreatedUser | null>(null)
const loginLink = ref('')
const linkExpiry = ref('')
const recentlyCreated = ref<any[]>([])

const toast = ref({ show: false, msg: '', type: 'success' })
const showToast = (msg: string, type = 'success') => {
  toast.value = { show: true, msg, type }
  setTimeout(() => toast.value.show = false, 3500)
}

const generateId = () => 'usr-' + Math.random().toString(36).substring(2, 10).toUpperCase()
const generateToken = () => Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18)
const generatePassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const validate = () => {
  errors.firstName = form.firstName.trim() ? '' : 'First name is required'
  errors.lastName = form.lastName.trim() ? '' : 'Last name is required'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : 'Valid email is required'
  errors.password = form.autoPassword || form.password.length >= 8 ? '' : 'Password must be at least 8 characters'
  return !errors.firstName && !errors.lastName && !errors.email && !errors.password
}

const buildLoginLink = (token: string) => {
  const base = import.meta.client ? window.location.origin : 'https://tavrixbank.com'
  return `${base}/auth/magic?token=${token}`
}

const handleCreate = async () => {
  if (!validate()) return
  creating.value = true

  try {
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
      balance: Number(form.balance),
      currency: form.currency,
      role: form.role === 'vip' ? 'user' : form.role,
      kycStatus: form.kycStatus === 'approved' ? 'verified' :
                 form.kycStatus === 'skipped' ? 'unverified' : form.kycStatus,
      password: form.autoPassword ? undefined : form.password
    }
    const res = await auth.apiCall<any>('/admin/users/create', 'POST', payload)

    if (!res?.success) {
      throw new Error(res?.error || 'Failed to create user. Check the server is running.')
    }

    const data = res.data?.data ?? res.data

    createdUser.value = {
      id: data?.id,
      firstName: data?.firstName || form.firstName,
      lastName: data?.lastName || form.lastName,
      email: data?.email || form.email,
      role: data?.role || form.role,
      kycStatus: data?.kycStatus || form.kycStatus,
      balance: data?.balance ?? Number(form.balance),
      tempPassword: data?.tempPassword
    }

    // Build the permanent magic login link from the backend-issued token
    const magicToken = data?.login_token
    loginLink.value = magicToken ? buildLoginLink(magicToken) : ''

    showToast('Account created and saved successfully!')
  } catch (err: any) {
    showToast(err?.message || 'Failed to create user account.', 'error')
  } finally {
    if (createdUser.value) {
      recentlyCreated.value.unshift({ ...createdUser.value, createdAgo: 'Just now' })
      if (recentlyCreated.value.length > 5) recentlyCreated.value.pop()
    }
    creating.value = false
  }
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(loginLink.value)
    linkCopied.value = true
    setTimeout(() => linkCopied.value = false, 2500)
    showToast('Login link copied to clipboard!')
  } catch {
    showToast('Could not copy — please copy manually.', 'error')
  }
}

const regenerateLink = async () => {
  if (!createdUser.value?.email) return
  sendingEmail.value = true
  try {
    // Re-fetches the permanent token from DB and sends it again
    const res = await auth.apiCall<any>('/admin/users/send-magic-link', 'POST', {
      email: createdUser.value.email
    })
    if (res?.success) {
      showToast('Login link re-sent to user\'s email!')
    } else {
      showToast(res?.error || 'Failed to resend link.', 'error')
    }
  } catch (err: any) {
    showToast(err?.message || 'Failed to resend link.', 'error')
  } finally {
    sendingEmail.value = false
  }
}

const sendingEmail = ref(false)

const handleSendEmail = async () => {
  if (!createdUser.value?.email) return
  sendingEmail.value = true
  try {
    // Backend fetches the permanent token from DB — frontend only needs to pass email
    const res = await auth.apiCall<any>('/admin/users/send-magic-link', 'POST', {
      email: createdUser.value.email
    })
    if (res?.success) {
      showToast('Magic link sent to user\'s email successfully!')
    } else {
      showToast(res?.error || 'Failed to send email. Check server logs.', 'error')
    }
  } catch (err: any) {
    showToast(err?.message || 'Failed to send email. Check server logs.', 'error')
  } finally {
    sendingEmail.value = false
  }
}

const resetForm = () => {
  createdUser.value = null
  loginLink.value = ''
  Object.assign(form, {
    firstName: '', lastName: '', email: '', phone: '',
    balance: 0, currency: 'USD', role: 'user',
    kycStatus: 'pending', autoPassword: true, password: '', note: ''
  })
}
</script>

<style scoped>
.admin-page { animation: fadeIn 0.4s ease-out; color: #f8fafc; }
@keyframes fadeIn { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }

.page-header { margin-bottom: 28px; }
.admin-page-title { font-size: 26px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em; }
.page-subtitle { font-size: 14px; color: rgba(255,255,255,0.4); margin-top: 4px; }

.create-layout { display: grid; grid-template-columns: 1fr 420px; gap: 24px; align-items: start; }
@media (max-width: 1100px) { .create-layout { grid-template-columns: 1fr; } }

/* Form Panel */
.form-panel {
  background: rgba(13,20,36,0.9);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 28px;
}

.panel-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 16px; font-weight: 700; color: #f1f5f9;
  margin-bottom: 24px; padding-bottom: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }

.form-group { margin-bottom: 18px; }
.form-label { display: block; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
.required { color: #f87171; }

.input-with-icon { position: relative; }
.input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.3); pointer-events: none; }

.form-input {
  width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; padding: 11px 14px; color: #f1f5f9; font-size: 14px;
  font-family: inherit; outline: none; transition: border-color 0.2s; box-sizing: border-box;
}
.form-input.with-icon { padding-left: 40px; }
.form-input.with-right { padding-right: 44px; }
.form-input:focus { border-color: rgba(99,102,241,0.6); background: rgba(99,102,241,0.04); }
.form-input.error { border-color: rgba(239,68,68,0.5); }

.pwd-toggle {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; padding: 4px;
}

.form-select {
  width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; padding: 11px 14px; color: #f1f5f9; font-size: 14px;
  font-family: inherit; outline: none; cursor: pointer; transition: border-color 0.2s;
}
.form-select:focus { border-color: rgba(99,102,241,0.6); }
.form-select option { background: #0d1424; color: #f1f5f9; }

.form-textarea {
  width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; padding: 11px 14px; color: #f1f5f9; font-size: 14px;
  font-family: inherit; outline: none; resize: vertical; transition: border-color 0.2s; box-sizing: border-box;
}
.form-textarea:focus { border-color: rgba(99,102,241,0.6); }

.error-msg { font-size: 12px; color: #f87171; margin-top: 5px; }

/* Role tabs */
.role-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.role-tab {
  flex: 1; min-width: 100px; display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 10px; border-radius: 10px; font-family: inherit; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.6); transition: all 0.18s;
}
.role-tab span:first-of-type { font-size: 13px; font-weight: 600; color: #f1f5f9; }
.role-desc { font-size: 11px; color: rgba(255,255,255,0.3); }
.role-tab.active { border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.1); }

/* KYC tabs */
.kyc-tabs { display: flex; gap: 8px; }
.kyc-tab {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  border-radius: 9px; font-size: 13px; font-weight: 500;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.45); cursor: pointer; font-family: inherit; transition: all 0.18s;
}
.kyc-tab.active.pending { background: rgba(245,158,11,0.12); color: #fbbf24; border-color: rgba(245,158,11,0.3); }
.kyc-tab.active.approved { background: rgba(16,185,129,0.12); color: #34d399; border-color: rgba(16,185,129,0.3); }
.kyc-tab.active.skipped { background: rgba(148,163,184,0.1); color: #94a3b8; border-color: rgba(148,163,184,0.2); }

/* Toggle */
.toggle-row { display: flex; align-items: center; gap: 12px; }
.toggle-btn { width: 46px; height: 26px; border-radius: 13px; background: rgba(255,255,255,0.1); border: none; cursor: pointer; position: relative; transition: background 0.25s; flex-shrink: 0; }
.toggle-btn.on { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
.toggle-knob { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: left 0.25s cubic-bezier(0.4,0,0.2,1); display: block; }
.toggle-btn.on .toggle-knob { left: 23px; }
.toggle-label { font-size: 13px; color: rgba(255,255,255,0.5); }

.create-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 14px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; border: none;
  font-family: inherit; transition: all 0.2s; margin-top: 8px;
}
.create-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(99,102,241,0.4); }
.create-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* Result Panel */
.result-panel { display: flex; flex-direction: column; gap: 18px; }

.success-card {
  background: rgba(13,20,36,0.9); border: 1px solid rgba(16,185,129,0.25);
  border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 20px;
}

.success-header { display: flex; align-items: center; gap: 14px; }
.success-icon-wrap { width: 50px; height: 50px; border-radius: 50%; background: rgba(16,185,129,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.success-icon { color: #34d399; }
.success-title { font-size: 18px; font-weight: 700; color: #f1f5f9; }
.success-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 2px; }

.user-summary { display: flex; align-items: center; gap: 14px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); }
.user-avatar-lg { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; font-weight: 700; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-fullname { font-size: 16px; font-weight: 700; color: #f1f5f9; }
.user-email-text { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 2px; }
.user-meta-row { display: flex; gap: 6px; margin-top: 6px; }
.user-meta-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 99px; }
.user-meta-badge.role { background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.25); }
.user-meta-badge.pending { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.2); }
.user-meta-badge.approved { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
.user-meta-badge.skipped { background: rgba(148,163,184,0.1); color: #94a3b8; }

.detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px,1fr)); gap: 12px; }
.detail-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px 12px; }
.detail-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: rgba(255,255,255,0.3); margin-bottom: 4px; }
.detail-val { font-size: 13.5px; font-weight: 600; color: #f1f5f9; word-break: break-all; }
.detail-val.green { color: #34d399; }
.monospace { font-family: 'JetBrains Mono','Courier New',monospace; font-size: 12px; }

/* Login Link */
.login-link-section { display: flex; flex-direction: column; gap: 10px; }
.login-link-header { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.7); }
.login-link-desc { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.6; }
.login-link-desc strong { color: #fbbf24; }

.link-box { display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.35); border: 1px solid rgba(99,102,241,0.3); border-radius: 10px; padding: 10px 12px; }
.link-text { flex: 1; font-family: 'JetBrains Mono','Courier New',monospace; font-size: 11px; color: #a5b4fc; word-break: break-all; line-height: 1.5; }
.copy-btn { display: flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; flex-shrink: 0; background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }
.copy-btn.copied { background: rgba(16,185,129,0.2); color: #34d399; border-color: rgba(16,185,129,0.3); }

.link-actions { display: flex; gap: 8px; }
.link-action-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 9px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5); font-family: inherit; transition: all 0.18s; }
.link-action-btn:hover { background: rgba(255,255,255,0.08); color: #f1f5f9; }
.link-action-btn.email-btn { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.08); color: #a5b4fc; }
.link-action-btn.email-btn:hover { background: rgba(99,102,241,0.18); }

.link-expiry { display: flex; align-items: center; gap: 5px; font-size: 11px; color: rgba(255,255,255,0.25); }

.new-user-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 11px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.6); font-family: inherit; transition: all 0.18s; }
.new-user-btn:hover { background: rgba(255,255,255,0.08); color: #f1f5f9; }

/* Guide Card */
.guide-card { background: rgba(13,20,36,0.9); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 32px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; }
.guide-icon { width: 64px; height: 64px; border-radius: 20px; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2); color: #818cf8; display: flex; align-items: center; justify-content: center; }
.guide-title { font-size: 17px; font-weight: 700; color: #f1f5f9; }
.guide-desc { font-size: 13.5px; color: rgba(255,255,255,0.4); line-height: 1.6; max-width: 320px; }
.guide-steps { display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 8px; }
.guide-step { display: flex; align-items: flex-start; gap: 12px; text-align: left; padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 9px; border: 1px solid rgba(255,255,255,0.05); }
.step-num { width: 24px; height: 24px; border-radius: 50%; background: rgba(99,102,241,0.2); color: #a5b4fc; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.step-text { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.5; padding-top: 2px; }

/* Recent Card */
.admin-card { background: rgba(13,20,36,0.9); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 18px; }
.rc-header { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.5); margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.rc-list { display: flex; flex-direction: column; gap: 10px; }
.rc-item { display: flex; align-items: center; gap: 10px; }
.rc-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; font-weight: 700; font-size: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rc-body { flex: 1; }
.rc-name { font-size: 13px; font-weight: 600; color: #f1f5f9; }
.rc-email { font-size: 11px; color: rgba(255,255,255,0.35); }
.rc-time { font-size: 11px; color: rgba(255,255,255,0.25); white-space: nowrap; }

/* Toast */
.toast { position: fixed; bottom: 28px; right: 28px; display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; z-index: 9999; backdrop-filter: blur(12px); }
.toast.success { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
.toast.error { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

.slide-up-enter-active { transition: all 0.35s cubic-bezier(0.4,0,0.2,1); }
.slide-up-enter-from { opacity: 0; transform: translateY(16px); }

.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

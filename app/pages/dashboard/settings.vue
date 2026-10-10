<template>
  <div class="dashboard-page-container">
    <div class="dashboard-page-header">
      <h2>Account Settings</h2>
      <p>Manage your profile, security preferences, and notification settings.</p>
    </div>

    <div class="page-grid">
      <!-- LEFT COLUMN -->
      <div class="flex-column-gap">
        
        <!-- Profile Info Card -->
        <div class="dashboard-card">
          <div class="card-header-main">
            <h3>Profile Information</h3>
          </div>
          <form class="dashboard-form" @submit.prevent="saveProfile">
            <div class="form-group">
              <label class="form-label" for="fullName">Full Name</label>
              <input id="fullName" type="text" v-model="profile.fullName" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="email">Email Address</label>
              <input id="email" type="email" v-model="profile.email" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="phone">Phone Number</label>
              <input id="phone" type="tel" v-model="profile.phone" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="address">Mailing Address</label>
              <textarea id="address" v-model="profile.address" rows="3" class="form-input" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary submit-btn">Save Changes</button>
          </form>
        </div>

        <!-- KYC Identity Verification Card -->
        <div class="dashboard-card">
          <div class="card-header-main">
            <h3>Identity Verification (KYC)</h3>
          </div>

          <!-- Unverified State -->
          <div v-if="kycStatus === 'Unverified'" class="kyc-container">
            <div class="kyc-intro">
              <Icon name="lucide:shield-alert" class="w-10 h-10 text-rose-500" />
              <div>
                <h4>Verification Required</h4>
                <p>Please upload a valid government-issued ID to fully verify your account and lift transaction limits.</p>
              </div>
            </div>

            <form class="dashboard-form" @submit.prevent="submitKyc">
              <div class="form-group">
                <label class="form-label" for="documentType">Document Type</label>
                <select id="documentType" v-model="kycForm.documentType" class="form-input form-select" required>
                  <option value="Passport">Passport</option>
                  <option value="Driver License">Driver's License</option>
                  <option value="National ID Card">National ID Card</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="documentNumber">Document Number</label>
                <input id="documentNumber" type="text" v-model="kycForm.documentNumber" placeholder="Enter document identification number" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="expiryDate">Expiry Date</label>
                <input id="expiryDate" type="date" v-model="kycForm.expiryDate" class="form-input" required />
              </div>

              <div class="upload-grid">
                <div class="form-group">
                  <label class="form-label">Front Side of ID</label>
                  <label class="file-dropzone">
                    <input type="file" accept="image/*" @change="handleKycUpload($event, 'front')" class="hidden-file-input" required />
                    <template v-if="kycForm.frontImage">
                      <img :src="kycForm.frontImage" class="preview-img" />
                      <span class="change-file-lbl">Change Image</span>
                    </template>
                    <template v-else>
                      <Icon name="lucide:camera" class="w-6 h-6 text-slate-400" />
                      <span class="dropzone-text">Upload Front Image</span>
                    </template>
                  </label>
                </div>

                <div class="form-group">
                  <label class="form-label">Back Side of ID</label>
                  <label class="file-dropzone">
                    <input type="file" accept="image/*" @change="handleKycUpload($event, 'back')" class="hidden-file-input" required />
                    <template v-if="kycForm.backImage">
                      <img :src="kycForm.backImage" class="preview-img" />
                      <span class="change-file-lbl">Change Image</span>
                    </template>
                    <template v-else>
                      <Icon name="lucide:camera" class="w-6 h-6 text-slate-400" />
                      <span class="dropzone-text">Upload Back Image</span>
                    </template>
                  </label>
                </div>
              </div>

              <button type="submit" class="btn btn-primary submit-btn">Submit Verification</button>
            </form>
          </div>

          <!-- Pending Verification State -->
          <div v-else-if="kycStatus === 'Pending Verification'" class="kyc-container">
            <div class="kyc-banner pending">
              <Icon name="lucide:clock" class="w-6 h-6 text-amber-600" />
              <div>
                <h4>Verification Status: Under Review</h4>
                <p>Your documents were submitted successfully. Verification normally takes 1-2 business days.</p>
              </div>
            </div>

            <div class="submitted-details">
              <h5>Submitted Document Information:</h5>
              <ul>
                <li><strong>Document:</strong> {{ kycForm.documentType }}</li>
                <li><strong>Number:</strong> {{ kycForm.documentNumber }}</li>
                <li><strong>Expiry Date:</strong> {{ kycForm.expiryDate }}</li>
              </ul>
            </div>

            <!-- Admin Approval Simulator -->
            <div class="simulator-box">
              <span class="sim-label">Testing Simulator:</span>
              <button class="btn btn-primary sim-btn" @click="simulateApproval">
                <Icon name="lucide:badge-check" class="w-4 h-4 mr-1" />
                Quick Approve (Verify Account)
              </button>
            </div>
          </div>

          <!-- Verified State -->
          <div v-else-if="kycStatus === 'Verified'" class="kyc-container">
            <div class="kyc-banner verified">
              <Icon name="lucide:badge-check" class="w-6 h-6 text-emerald-600" />
              <div>
                <h4>Identity Fully Verified</h4>
                <p>All limit restrictions have been removed. Your account is in good standing.</p>
              </div>
            </div>

            <div class="submitted-details">
              <h5>Verified Credentials:</h5>
              <ul>
                <li><strong>Document:</strong> {{ kycForm.documentType }}</li>
                <li><strong>Number:</strong> {{ kycForm.documentNumber }}</li>
                <li><strong>Expiry Date:</strong> {{ kycForm.expiryDate }}</li>
              </ul>
            </div>

            <!-- Admin Reset Simulator -->
            <div class="simulator-box">
              <span class="sim-label">Testing Simulator:</span>
              <button class="btn btn-outline sim-btn text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20" @click="simulateReset">
                <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-1" />
                Reset Verification
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN -->
      <div class="flex-column-gap">
        <!-- Security Card -->
        <div class="dashboard-card">
          <div class="card-header-main">
            <h3>Security</h3>
          </div>
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <h4>Change Password</h4>
                <p>Update your account password</p>
              </div>
              <button class="secondary-btn" @click="openPasswordModal">Update</button>
            </div>

            <!-- Transfer PIN Section -->
            <div class="setting-item">
              <div class="setting-info">
                <h4>Transfer PIN</h4>
                <p>{{ hasTransferPin ? '4-digit transaction authorization PIN is active' : 'Set a 4-digit PIN to secure your transfers' }}</p>
              </div>
              <button class="secondary-btn" @click="openPinModal">
                {{ hasTransferPin ? 'Reset PIN' : 'Set PIN' }}
              </button>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Two-Factor Authentication</h4>
                <p>Secure your account with 2FA</p>
              </div>
              <div :class="['toggle-switch', { active: twoFactor }]" @click="toggle2FA">
                <div class="toggle-slider"></div>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Active Sessions</h4>
                <p>Manage devices logged into your account</p>
              </div>
              <button class="secondary-btn" @click="openSessionsModal">View</button>
            </div>
          </div>
        </div>

        <!-- Notifications Card -->
        <div class="dashboard-card">
          <div class="card-header-main">
            <h3>Notifications</h3>
          </div>
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <h4>Email Alerts</h4>
                <p>Receive statements and notices via email</p>
              </div>
              <div :class="['toggle-switch', { active: emailAlerts }]" @click="toggleEmailAlerts">
                <div class="toggle-slider"></div>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>SMS Alerts</h4>
                <p>Get text messages for large transactions</p>
              </div>
              <div :class="['toggle-switch', { active: smsAlerts }]" @click="toggleSmsAlerts">
                <div class="toggle-slider"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PIN MODAL -->
    <div v-if="showPinModal" class="modal-overlay" @click.self="closePinModal">
      <div class="modal-box">
        <div class="modal-header">
          <Icon name="lucide:shield-check" class="modal-icon" />
          <h2>{{ hasTransferPin ? 'Reset Transfer PIN' : 'Set Transfer PIN' }}</h2>
          <button class="modal-close" @click="closePinModal"><Icon name="lucide:x" /></button>
        </div>

        <form @submit.prevent="saveTransferPin" class="modal-body">
          <div v-if="hasTransferPin" class="form-group">
            <label class="form-label" for="currentPin">Current 4-Digit PIN</label>
            <input
              id="currentPin"
              type="password"
              v-model="pinForm.current"
              maxlength="4"
              pattern="\d{4}"
              placeholder="••••"
              class="form-input text-center font-mono letter-spacing-lg"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="newPin">New 4-Digit PIN</label>
            <input
              id="newPin"
              type="password"
              v-model="pinForm.newPin"
              maxlength="4"
              pattern="\d{4}"
              placeholder="••••"
              class="form-input text-center font-mono letter-spacing-lg"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="confirmPin">Confirm New 4-Digit PIN</label>
            <input
              id="confirmPin"
              type="password"
              v-model="pinForm.confirm"
              maxlength="4"
              pattern="\d{4}"
              placeholder="••••"
              class="form-input text-center font-mono letter-spacing-lg"
              required
            />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="closePinModal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save PIN</button>
          </div>
        </form>
      </div>
    </div>

    <!-- CHANGE PASSWORD MODAL -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal-box">
        <div class="modal-header">
          <Icon name="lucide:key-round" class="modal-icon" />
          <h2>Change Password</h2>
          <button class="modal-close" @click="closePasswordModal"><Icon name="lucide:x" /></button>
        </div>

        <form @submit.prevent="submitPasswordChange" class="modal-body">
          <div class="form-group">
            <label class="form-label" for="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              v-model="passwordForm.current"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              v-model="passwordForm.newPassword"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              v-model="passwordForm.confirm"
              class="form-input"
              required
            />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="closePasswordModal">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Password</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ACTIVE SESSIONS MODAL -->
    <div v-if="showSessionsModal" class="modal-overlay" @click.self="closeSessionsModal">
      <div class="modal-box max-w-lg">
        <div class="modal-header">
          <Icon name="lucide:laptop" class="modal-icon" />
          <h2>Active Sessions</h2>
          <button class="modal-close" @click="closeSessionsModal"><Icon name="lucide:x" /></button>
        </div>

        <div class="modal-body max-h-96 overflow-y-auto">
          <p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
            These devices are currently logged into your account. Revoke any unfamiliar sessions.
          </p>

          <div v-if="sessionsLoading" class="flex justify-center p-4">
            <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin text-slate-400" />
          </div>

          <div v-else-if="sessions.length === 0" class="text-center p-4 text-slate-400">
            No active sessions found.
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="session in sessions" 
              :key="session.id" 
              class="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/40"
            >
              <div class="flex items-start gap-3">
                <Icon 
                  :name="session.userAgent?.toLowerCase().includes('mobi') ? 'lucide:smartphone' : 'lucide:monitor'" 
                  class="w-5 h-5 mt-1 text-slate-500" 
                />
                <div>
                  <div class="font-medium text-sm text-slate-700 dark:text-slate-200">
                    {{ session.userAgent || 'Unknown Device' }}
                  </div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">
                    IP: {{ session.ipAddress || '127.0.0.1' }} • Last active: {{ formatDate(session.lastActiveAt || session.createdAt) }}
                  </div>
                  <div v-if="session.isCurrent" class="text-xs text-emerald-500 font-semibold mt-1">
                    Current Session
                  </div>
                </div>
              </div>
              
              <button 
                v-if="!session.isCurrent"
                class="btn btn-outline text-xs px-2.5 py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                @click="revokeSession(session.id)"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="closeSessionsModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Account Settings | Tavrix Bank'
})

const twoFactor = ref(true)
const emailAlerts = ref(true)
const smsAlerts = ref(false)

const profile = reactive({
  fullName: 'John Smith',
  email: 'john.smith@example.com',
  phone: '(555) 123-4567',
  address: '123 Financial Way, Suite 400\nNew York, NY 10004'
})

const kycStatus = ref('Unverified')
const kycForm = reactive({
  documentType: 'Passport',
  documentNumber: '',
  expiryDate: '',
  frontImage: null as string | null,
  backImage: null as string | null,
})

// PIN Settings variables
const hasTransferPin = ref(false)
const showPinModal = ref(false)
const pinForm = reactive({
  current: '',
  newPin: '',
  confirm: ''
})

const auth = useAuth()

// Password Form State
const showPasswordModal = ref(false)
const passwordForm = reactive({
  current: '',
  newPassword: '',
  confirm: ''
})

const openPasswordModal = () => {
  passwordForm.current = ''
  passwordForm.newPassword = ''
  passwordForm.confirm = ''
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
}

const submitPasswordChange = async () => {
  if (passwordForm.newPassword !== passwordForm.confirm) {
    alert('Error: New Password and Confirm Password do not match.')
    return
  }
  if (passwordForm.newPassword.length < 8) {
    alert('Error: New Password must be at least 8 characters long.')
    return
  }

  const res = await auth.apiCall<any>('/auth/change-password', 'POST', {
    currentPassword: passwordForm.current,
    newPassword: passwordForm.newPassword
  })

  if (res.success) {
    alert('Success: Your password has been changed successfully!')
    closePasswordModal()
  } else {
    alert(`Error: ${res.error || 'Failed to change password.'}`)
  }
}

// Sessions State
const showSessionsModal = ref(false)
const sessionsLoading = ref(false)
const sessions = ref<any[]>([])

const openSessionsModal = () => {
  showSessionsModal.value = true
  fetchSessions()
}

const closeSessionsModal = () => {
  showSessionsModal.value = false
}

const fetchSessions = async () => {
  sessionsLoading.value = true
  const res = await auth.apiCall<any>('/auth/sessions', 'GET')
  sessionsLoading.value = false
  if (res.success && res.data) {
    const list: any[] = res.data?.data ?? res.data ?? []
    sessions.value = list
  }
}

const revokeSession = async (sessionId: string) => {
  if (!confirm('Are you sure you want to revoke this session? The device will be logged out.')) {
    return
  }
  const res = await auth.apiCall<any>(`/auth/sessions/${sessionId}`, 'DELETE')
  if (res.success) {
    alert('Session revoked successfully.')
    fetchSessions()
  } else {
    alert(`Error: ${res.error || 'Failed to revoke session.'}`)
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const alert = (msg: string) => {
  if (import.meta.client) {
    window.alert(msg)
  }
}

const saveProfile = async () => {
  const res = await auth.apiCall<any>('/dashboard/profile', 'PUT', {
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    address: profile.address
  })

  if (res.success) {
    alert('Profile updated successfully!')
    if (auth.user.value) {
      auth.user.value.fullName = profile.fullName
      auth.user.value.email = profile.email
      localStorage.setItem('user', JSON.stringify(auth.user.value))
    }
  } else {
    alert(`Error: ${res.error || 'Failed to update profile.'}`)
  }
}

// Toggle operations
const toggle2FA = async () => {
  const nextVal = !twoFactor.value
  const res = await auth.apiCall<any>('/dashboard/profile', 'PUT', {
    twoFactorEnabled: nextVal ? 'true' : 'false'
  })
  if (res.success) {
    twoFactor.value = nextVal
    alert(`Success: Two-Factor Authentication has been ${nextVal ? 'enabled' : 'disabled'}.`)
  } else {
    alert(`Error: ${res.error || 'Failed to toggle 2FA.'}`)
  }
}

const toggleEmailAlerts = async () => {
  const nextVal = !emailAlerts.value
  const res = await auth.apiCall<any>('/dashboard/profile', 'PUT', {
    emailAlertsEnabled: nextVal ? 'true' : 'false'
  })
  if (res.success) {
    emailAlerts.value = nextVal
    alert(`Success: Email Alerts have been ${nextVal ? 'enabled' : 'disabled'}.`)
  } else {
    alert(`Error: ${res.error || 'Failed to toggle email alerts.'}`)
  }
}

const toggleSmsAlerts = async () => {
  const nextVal = !smsAlerts.value
  const res = await auth.apiCall<any>('/dashboard/profile', 'PUT', {
    smsAlertsEnabled: nextVal ? 'true' : 'false'
  })
  if (res.success) {
    smsAlerts.value = nextVal
    alert(`Success: SMS Alerts have been ${nextVal ? 'enabled' : 'disabled'}.`)
  } else {
    alert(`Error: ${res.error || 'Failed to toggle SMS alerts.'}`)
  }
}

const handleKycUpload = (event: Event, side: 'front' | 'back') => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      if (side === 'front') {
        kycForm.frontImage = e.target?.result as string
      } else {
        kycForm.backImage = e.target?.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

const submitKyc = async () => {
  if (!kycForm.documentNumber || !kycForm.expiryDate) {
    alert('Please fill in all identity document fields.')
    return
  }

  const res = await auth.apiCall<any>('/dashboard/kyc', 'POST', {
    documentType: kycForm.documentType,
    documentNumber: kycForm.documentNumber,
    expiryDate: kycForm.expiryDate,
    frontImage: kycForm.frontImage,
    backImage: kycForm.backImage
  })

  if (res.success) {
    kycStatus.value = 'Pending Verification'
    if (import.meta.client) {
      localStorage.setItem('kyc_status', 'Pending Verification')
      localStorage.setItem('kyc_data', JSON.stringify({
        documentType: kycForm.documentType,
        documentNumber: kycForm.documentNumber,
        expiryDate: kycForm.expiryDate,
        frontImage: kycForm.frontImage,
        backImage: kycForm.backImage,
      }))
    }
    alert('Identity verification documents submitted successfully! Admin will review your application.')
  } else {
    alert(`Error: ${res.error || 'Failed to submit KYC.'}`)
  }
}

const simulateApproval = () => {
  kycStatus.value = 'Verified'
  if (import.meta.client) {
    localStorage.setItem('kyc_status', 'Verified')
  }
  alert('Simulated Admin Approval: Your KYC status has been updated to Verified!')
}

const simulateReset = () => {
  kycStatus.value = 'Unverified'
  kycForm.documentNumber = ''
  kycForm.expiryDate = ''
  kycForm.frontImage = null
  kycForm.backImage = null
  if (import.meta.client) {
    localStorage.setItem('kyc_status', 'Unverified')
    localStorage.removeItem('kyc_data')
  }
  alert('Simulated Reset: You can now fill and submit the KYC verification form again.')
}

// Transfer PIN methods
const openPinModal = () => {
  pinForm.current = ''
  pinForm.newPin = ''
  pinForm.confirm = ''
  showPinModal.value = true
}

const closePinModal = () => {
  showPinModal.value = false
}

const saveTransferPin = async () => {
  if (!/^\d{4}$/.test(pinForm.newPin)) {
    alert('Error: PIN must be exactly 4 digits.')
    return
  }
  if (pinForm.newPin !== pinForm.confirm) {
    alert('Error: New PIN and Confirmation PIN do not match.')
    return
  }

  if (hasTransferPin.value) {
    // Verify current PIN on client/localStorage
    if (import.meta.client) {
      const activePin = localStorage.getItem('transfer_pin')
      if (pinForm.current !== activePin) {
        alert('Error: The current PIN you entered is incorrect.')
        return
      }
    }
  }

  const res = await auth.apiCall<any>('/dashboard/profile', 'PUT', {
    transferPin: pinForm.newPin
  })

  if (res.success) {
    if (import.meta.client) {
      localStorage.setItem('transfer_pin', pinForm.newPin)
    }
    hasTransferPin.value = true
    closePinModal()
    alert('Success: Your transfer PIN has been updated successfully!')
  } else {
    alert(`Error: ${res.error || 'Failed to update transfer PIN.'}`)
  }
}

onMounted(async () => {
  // Load profile details from server
  const profileRes = await auth.apiCall<any>('/dashboard/profile', 'GET')
  if (profileRes.success && profileRes.data) {
    const data = profileRes.data?.data ?? profileRes.data
    profile.fullName = data.fullName || ''
    profile.email = data.email || ''
    profile.phone = data.phone || ''
    profile.address = data.address || ''
    twoFactor.value = data.twoFactorEnabled === 'true'
    emailAlerts.value = data.emailAlertsEnabled === 'true'
    smsAlerts.value = data.smsAlertsEnabled === 'true'
    hasTransferPin.value = data.hasTransferPin || !!data.transferPin

    // Use profile kycStatus as authoritative source (set directly by admin approval)
    const profileKycStatus = data.kycStatus as string | undefined
    if (profileKycStatus === 'verified') {
      kycStatus.value = 'Verified'
      if (import.meta.client) localStorage.setItem('kyc_status', 'Verified')
    } else if (profileKycStatus === 'pending') {
      kycStatus.value = 'Pending Verification'
      if (import.meta.client) localStorage.setItem('kyc_status', 'Pending Verification')
    } else if (profileKycStatus === 'rejected') {
      kycStatus.value = 'Unverified'
      if (import.meta.client) localStorage.setItem('kyc_status', 'Unverified')
    } else if (profileKycStatus === 'unverified') {
      kycStatus.value = 'Unverified'
      if (import.meta.client) localStorage.setItem('kyc_status', 'Unverified')
    }
  } else if (auth.user.value) {
    profile.fullName = auth.user.value.fullName
    profile.email = auth.user.value.email
  }

  // Load KYC document details from server (for document form prefill)
  const kycRes = await auth.apiCall<any>('/dashboard/kyc', 'GET')
  if (kycRes.success && kycRes.data) {
    const data = kycRes.data?.data ?? kycRes.data

    // Only update display status from document if profile didn't give a clear verified status
    if (!['Verified', 'Pending Verification'].includes(kycStatus.value)) {
      if (data.status === 'PENDING') {
        kycStatus.value = 'Pending Verification'
        if (import.meta.client) localStorage.setItem('kyc_status', 'Pending Verification')
      } else if (data.status === 'APPROVED') {
        kycStatus.value = 'Verified'
        if (import.meta.client) localStorage.setItem('kyc_status', 'Verified')
      } else if (data.status === 'REJECTED') {
        kycStatus.value = 'Unverified'
        if (import.meta.client) localStorage.setItem('kyc_status', 'Unverified')
      }
    }

    if (data.documentType) {
      kycForm.documentType = data.documentType
      kycForm.documentNumber = data.documentNumber || ''
      kycForm.expiryDate = data.expiryDate || ''
      kycForm.frontImage = data.frontImageUrl || null
      kycForm.backImage = data.backImageUrl || null
    }
  } else if (import.meta.client) {
    const status = localStorage.getItem('kyc_status')
    if (status) {
      kycStatus.value = status
    }
    const data = localStorage.getItem('kyc_data')
    if (data) {
      const parsed = JSON.parse(data)
      kycForm.documentType = parsed.documentType
      kycForm.documentNumber = parsed.documentNumber
      kycForm.expiryDate = parsed.expiryDate
      kycForm.frontImage = parsed.frontImage
      kycForm.backImage = parsed.backImage
    }
    const savedPin = localStorage.getItem('transfer_pin')
    if (savedPin) {
      hasTransferPin.value = true
    }
  }
})
</script>

<style scoped>
.dashboard-page-container {
  max-width: 1000px;
  margin: 0 auto;
}

.dashboard-page-header {
  margin-bottom: 24px;
}

.dashboard-page-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 6px;
}

.dark .dashboard-page-header h2 {
  color: var(--color-text-light);
}

.dashboard-page-header p {
  font-size: 14px;
  color: var(--color-text-muted);
}

.dark .dashboard-page-header p {
  color: #94a3b8;
}

.page-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

@media (max-width: 900px) {
  .page-grid {
    grid-template-columns: 1fr;
  }
}

.flex-column-gap {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-card {
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
  padding: 24px;
}

.dark .dashboard-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.card-header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.dark .card-header-main {
  border-bottom-color: var(--color-border-dark);
}

.card-header-main h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
}

.dark .card-header-main h3 {
  color: var(--color-text-light);
}

.dashboard-form {
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
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-main);
}

.dark .form-label {
  color: var(--color-text-light);
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--color-background-page);
  color: var(--color-text-main);
  outline: none;
  font-family: var(--font-sans);
  box-sizing: border-box;
}

.dark .form-input {
  background: #1e293b;
  border-color: var(--color-border-dark);
  color: #f1f5f9;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
}

.submit-btn {
  font-size: 15px;
  font-weight: 600;
  padding: 12px;
  margin-top: 8px;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.dark .setting-item {
  border-bottom-color: var(--color-border-dark);
}

.setting-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-info h4 {
  color: var(--color-text-main);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.dark .setting-info h4 {
  color: var(--color-text-light);
}

.setting-info p {
  color: var(--color-text-muted);
  font-size: 12px;
}

.dark .setting-info p {
  color: #94a3b8;
}

.secondary-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.dark .secondary-btn {
  border-color: var(--color-border-dark);
  color: #94a3b8;
}

.secondary-btn:hover {
  background-color: var(--color-background-subtle);
  color: var(--color-text-main);
}

.dark .secondary-btn:hover {
  background-color: var(--color-background-dark-subtle);
  color: var(--color-text-light);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dark .toggle-switch {
  background-color: var(--color-border-dark);
}

.toggle-switch.active {
  background-color: var(--color-secondary);
}

.dark .toggle-switch.active {
  background-color: #60a5fa;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(20px);
}

/* KYC Styles */
.kyc-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kyc-intro {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background-color: rgba(239, 68, 68, 0.05);
  border: 1px dashed rgba(239, 68, 68, 0.25);
  border-radius: 8px;
}

.kyc-intro h4 {
  font-size: 14px;
  font-weight: 700;
  color: #ef4444;
  margin-bottom: 2px;
}

.kyc-intro p {
  font-size: 12px;
  color: var(--color-text-muted);
}
.dark .kyc-intro p {
  color: #94a3b8;
}

.upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 500px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }
}

.file-dropzone {
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
  background: var(--color-background-page);
  height: 100px;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.dark .file-dropzone {
  border-color: var(--color-border-dark);
  background: #1e293b;
}

.file-dropzone:hover {
  border-color: var(--color-secondary);
}

.hidden-file-input {
  display: none;
}

.dropzone-text {
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.change-file-lbl {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  color: white;
  text-align: center;
  font-size: 11px;
  padding: 4px;
}

.kyc-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid;
}

.kyc-banner.pending {
  background-color: rgba(245, 158, 11, 0.05);
  border-color: rgba(245, 158, 11, 0.2);
  color: #d97706;
}

.kyc-banner.verified {
  background-color: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.2);
  color: #059669;
}

.kyc-banner h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.kyc-banner p {
  font-size: 12px;
  opacity: 0.9;
}

.submitted-details {
  background: var(--color-background-page);
  border: 1px solid var(--color-border);
  padding: 16px;
  border-radius: 8px;
}

.dark .submitted-details {
  background: #1e293b;
  border-color: var(--color-border-dark);
}

.submitted-details h5 {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--color-text-main);
}
.dark .submitted-details h5 {
  color: #f1f5f9;
}

.submitted-details ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.submitted-details li {
  color: var(--color-text-muted);
}
.dark .submitted-details li {
  color: #94a3b8;
}

.simulator-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
  gap: 12px;
  flex-wrap: wrap;
}

.dark .simulator-box {
  border-top-color: var(--color-border-dark);
}

.sim-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-faint);
}

.sim-btn {
  font-size: 12px;
  padding: 8px 14px;
}

/* Modal Window styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
  overflow: hidden;
  animation: modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
}

.dark .modal-box {
  background: #0f172a;
  border-color: var(--color-border-dark);
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.dark .modal-header {
  border-bottom-color: var(--color-border-dark);
}

.modal-header h2 {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.dark .modal-header h2 {
  color: #f1f5f9;
}

.modal-icon {
  width: 22px;
  height: 22px;
  color: var(--color-secondary);
  flex-shrink: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.letter-spacing-lg {
  letter-spacing: 0.5em;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>

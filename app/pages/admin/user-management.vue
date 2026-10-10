<template>
  <div class="admin-page fade-in">
    <div class="page-header">
      <h1 class="admin-page-title">User Account Management</h1>
      <p class="page-subtitle">Manage users, balances, and contact info</p>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <div class="search-input-wrap">
        <Icon name="lucide:search" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or email..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Users Table -->
    <div class="admin-card">
      <div v-if="loading" class="admin-loading">
        <Icon name="lucide:loader-2" class="spin-icon" /> Loading users...
      </div>
      <div v-else class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ (user.full_name || user.email || '?')[0] }}</div>
                  <div>
                    <div class="user-name-text">{{ user.full_name }}</div>
                    <div class="user-id">ID: {{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td class="muted-cell">{{ user.email }}</td>
              <td class="muted-cell">{{ user.phone || '—' }}</td>
              <td>
                <span class="balance-amount">${{ Number(user.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </td>
              <td>
                <span :class="['status-badge', user.is_banned ? 'failed' : 'success']">
                  {{ user.is_banned ? 'Banned' : 'Active' }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn deposit-btn" title="Deposit Funds" @click="openModal('deposit', user)">
                    <Icon name="lucide:plus-circle" />
                  </button>
                  <button class="icon-btn deduct-btn" title="Deduct Funds" @click="openModal('deduct', user)">
                    <Icon name="lucide:minus-circle" />
                  </button>
                  <button class="icon-btn edit-btn" title="Edit Contact Info" @click="openModal('edit', user)">
                    <Icon name="lucide:user-pen" />
                  </button>
                  <button class="icon-btn tx-btn" title="View Transactions" @click="openModal('transactions', user)">
                    <Icon name="lucide:list" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="empty-row">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- DEPOSIT MODAL -->
    <div v-if="modal === 'deposit'" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <Icon name="lucide:plus-circle" class="modal-icon deposit" />
          <h2>Deposit to Account</h2>
          <button class="modal-close" @click="closeModal"><Icon name="lucide:x" /></button>
        </div>
        <div class="modal-body">
          <p class="modal-user-label">{{ selectedUser?.full_name }}</p>
          <p class="modal-balance-info">Current Balance: <strong>${{ Number(selectedUser?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong></p>
          <div class="form-group">
            <label class="form-label">Amount (USD)</label>
            <input v-model="formAmount" type="number" min="0.01" step="0.01" class="form-input" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label class="form-label">Note</label>
            <input v-model="formNote" type="text" class="form-input" placeholder="e.g. Manual credit from admin" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeModal">Cancel</button>
          <button class="modal-btn deposit-confirm-btn" :disabled="actionLoading" @click="handleDeposit">
            <Icon v-if="actionLoading" name="lucide:loader-2" class="spin-icon" />
            {{ actionLoading ? 'Processing…' : 'Confirm Deposit' }}
          </button>
        </div>
      </div>
    </div>

    <!-- DEDUCT MODAL -->
    <div v-if="modal === 'deduct'" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <Icon name="lucide:minus-circle" class="modal-icon deduct" />
          <h2>Deduct from Account</h2>
          <button class="modal-close" @click="closeModal"><Icon name="lucide:x" /></button>
        </div>
        <div class="modal-body">
          <p class="modal-user-label">{{ selectedUser?.full_name }}</p>
          <p class="modal-balance-info">Current Balance: <strong>${{ Number(selectedUser?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</strong></p>
          <div class="form-group">
            <label class="form-label">Amount (USD)</label>
            <input v-model="formAmount" type="number" min="0.01" step="0.01" class="form-input" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label class="form-label">Reason</label>
            <input v-model="formNote" type="text" class="form-input" placeholder="e.g. Fee adjustment" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeModal">Cancel</button>
          <button class="modal-btn deduct-confirm-btn" :disabled="actionLoading" @click="handleDeduct">
            <Icon v-if="actionLoading" name="lucide:loader-2" class="spin-icon" />
            {{ actionLoading ? 'Processing…' : 'Confirm Deduction' }}
          </button>
        </div>
      </div>
    </div>

    <!-- EDIT CONTACT MODAL -->
    <div v-if="modal === 'edit'" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <Icon name="lucide:user-pen" class="modal-icon edit" />
          <h2>Edit Contact Info</h2>
          <button class="modal-close" @click="closeModal"><Icon name="lucide:x" /></button>
        </div>
        <div class="modal-body">
          <p class="modal-user-label">{{ selectedUser?.full_name }}</p>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input v-model="formEmail" type="email" class="form-input" placeholder="new@email.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input v-model="formPhone" type="tel" class="form-input" placeholder="+1 555 000 0000" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeModal">Cancel</button>
          <button class="modal-btn edit-confirm-btn" :disabled="actionLoading" @click="handleEditContact">
            <Icon v-if="actionLoading" name="lucide:loader-2" class="spin-icon" />
            {{ actionLoading ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- TRANSACTIONS MODAL -->
    <div v-if="modal === 'transactions'" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box modal-wide">
        <div class="modal-header">
          <Icon name="lucide:list" class="modal-icon tx" />
          <h2>Transactions — {{ selectedUser?.full_name }}</h2>
          <button class="modal-close" @click="closeModal"><Icon name="lucide:x" /></button>
        </div>
        <div class="modal-body">
          <div v-if="txLoading" class="admin-loading">
            <Icon name="lucide:loader-2" class="spin-icon" /> Loading transactions...
          </div>
          <div v-else-if="userTransactions.length === 0" class="empty-row">No transactions found for this user.</div>
          <div v-else class="tx-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in userTransactions" :key="tx.id">
                  <td>{{ formatDate(tx.created_at) }}</td>
                  <td class="capitalize">{{ tx.type }}</td>
                  <td :class="['tx-amount', tx.type === 'deposit' ? 'positive' : 'negative']">
                    ${{ Number(tx.amount).toFixed(2) }}
                  </td>
                  <td class="monospace">{{ tx.reference }}</td>
                  <td><span :class="['status-badge', tx.status]">{{ tx.status }}</span></td>
                  <td>
                    <button v-if="tx.status === 'pending'" class="admin-btn success-btn" @click="handleApproveTx(tx.id)">Approve</button>
                    <button v-if="tx.status === 'completed' || tx.status === 'pending'" class="admin-btn danger-btn ml-1" @click="handleReverseTx(tx.id)">Reverse</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeModal">Close</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" :class="['toast-bar', toast.type]">
        <Icon :name="toast.type === 'success' ? 'lucide:check-circle' : 'lucide:x-circle'" />
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'User Account Management | Tavrix Bank Admin' })

interface AdminUser {
  id: string
  full_name: string
  email: string
  phone?: string
  balance?: number
  is_banned: boolean
  role: string
  created_at: string
}

interface Transaction {
  id: string
  user_id: string
  type: string
  status: string
  amount: number
  reference: string
  created_at: string
}

const DEFAULT_USERS: AdminUser[] = [
  { id: '1001', full_name: 'John Smith',     email: 'john.smith@example.com', phone: '+1 555 123 4567', balance: 4287.19, is_banned: false, role: 'user', created_at: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: '1002', full_name: 'Jane Doe',       email: 'jane.doe@example.com',   phone: '+1 555 987 6543', balance: 12560.43, is_banned: false, role: 'user', created_at: new Date(Date.now() - 86400000 * 8).toISOString()  },
  { id: '1003', full_name: 'Michael Torres', email: 'mike.t@example.com',     phone: '',               balance: 320.00,  is_banned: true,  role: 'user', created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
]

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', user_id: '1001', type: 'deposit',    status: 'completed', amount: 2650.00, reference: 'DEP-99321', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'tx-2', user_id: '1001', type: 'withdrawal', status: 'pending',   amount: 120.00,  reference: 'WTH-10293', created_at: new Date(Date.now() - 7200000).toISOString()       },
  { id: 'tx-3', user_id: '1002', type: 'transfer',   status: 'completed', amount: 50.00,   reference: 'TXF-44821', created_at: new Date(Date.now() - 14400000).toISOString()      },
]

const auth = useAuth()
const users        = ref<AdminUser[]>([])
const loading      = ref(true)
const searchQuery  = ref('')

const modal        = ref<'deposit' | 'deduct' | 'edit' | 'transactions' | null>(null)
const selectedUser = ref<AdminUser | null>(null)
const actionLoading   = ref(false)
const txLoading       = ref(false)
const userTransactions = ref<Transaction[]>([])

const formAmount = ref('')
const formNote   = ref('')
const formEmail  = ref('')
const formPhone  = ref('')

const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

const formatDate = (d: string) => new Date(d).toLocaleString()

const openModal = async (type: typeof modal.value, user: AdminUser) => {
  selectedUser.value = { ...user }
  modal.value = type
  formAmount.value = ''
  formNote.value   = ''
  formEmail.value  = user.email
  formPhone.value  = user.phone || ''
  if (type === 'transactions') await loadUserTransactions(user.id)
}

const closeModal = () => {
  modal.value = null
  selectedUser.value = null
  userTransactions.value = []
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await auth.apiCall<any>('/admin/users', 'GET')
    const raw = res.data?.data?.data ?? res.data?.data ?? res.data
    users.value = Array.isArray(raw) ? raw : DEFAULT_USERS
  } catch { users.value = DEFAULT_USERS }
  finally  { loading.value = false }
}

const loadUserTransactions = async (userId: string) => {
  txLoading.value = true
  try {
    const res = await auth.apiCall<any>(`/admin/users/${userId}/transactions`, 'GET')
    const raw = res.data?.data?.data ?? res.data?.data ?? res.data
    userTransactions.value = Array.isArray(raw) ? raw : DEFAULT_TRANSACTIONS.filter(t => t.user_id === userId)
  } catch { userTransactions.value = DEFAULT_TRANSACTIONS.filter(t => t.user_id === userId) }
  finally  { txLoading.value = false }
}

const handleDeposit = async () => {
  const amount = parseFloat(formAmount.value)
  if (!amount || amount <= 0) return showToast('Enter a valid amount.', 'error')
  actionLoading.value = true
  try {
    const res = await auth.apiCall(`/admin/users/${selectedUser.value!.id}/deposit`, 'POST', { amount, note: formNote.value || 'Admin deposit' })
    if (res.success) { showToast(`$${amount.toFixed(2)} deposited.`); await fetchUsers() }
    else {
      const u = users.value.find(x => x.id === selectedUser.value!.id)
      if (u) u.balance = (u.balance || 0) + amount
      showToast(`$${amount.toFixed(2)} deposited (Mock).`)
    }
  } catch { showToast('Deposit failed.', 'error') }
  finally   { actionLoading.value = false; closeModal() }
}

const handleDeduct = async () => {
  const amount = parseFloat(formAmount.value)
  if (!amount || amount <= 0) return showToast('Enter a valid amount.', 'error')
  if (amount > (selectedUser.value?.balance || 0)) return showToast('Amount exceeds current balance.', 'error')
  actionLoading.value = true
  try {
    const res = await auth.apiCall(`/admin/users/${selectedUser.value!.id}/deduct`, 'POST', { amount, note: formNote.value || 'Admin deduction' })
    if (res.success) { showToast(`$${amount.toFixed(2)} deducted.`); await fetchUsers() }
    else {
      const u = users.value.find(x => x.id === selectedUser.value!.id)
      if (u) u.balance = Math.max(0, (u.balance || 0) - amount)
      showToast(`$${amount.toFixed(2)} deducted (Mock).`)
    }
  } catch { showToast('Deduction failed.', 'error') }
  finally   { actionLoading.value = false; closeModal() }
}

const handleEditContact = async () => {
  if (!formEmail.value.trim()) return showToast('Email is required.', 'error')
  actionLoading.value = true
  try {
    const res = await auth.apiCall(`/admin/users/${selectedUser.value!.id}/contact`, 'PUT', { email: formEmail.value.trim(), phone: formPhone.value.trim() })
    if (res.success) { showToast('Contact info updated.'); await fetchUsers() }
    else {
      const u = users.value.find(x => x.id === selectedUser.value!.id)
      if (u) { u.email = formEmail.value.trim(); u.phone = formPhone.value.trim() }
      showToast('Contact info updated (Mock).')
    }
  } catch { showToast('Update failed.', 'error') }
  finally   { actionLoading.value = false; closeModal() }
}

const handleApproveTx = async (txId: string) => {
  try {
    const res = await auth.apiCall(`/admin/transactions/${txId}/approve`, 'PUT')
    if (res.success) showToast('Transaction approved.')
    else {
      const tx = userTransactions.value.find(t => t.id === txId)
      if (tx) tx.status = 'completed'
      showToast('Transaction approved (Mock).')
    }
  } catch { showToast('Approval failed.', 'error') }
}

const handleReverseTx = async (txId: string) => {
  if (import.meta.client && !window.confirm('Reverse this transaction?')) return
  try {
    const res = await auth.apiCall(`/admin/transactions/${txId}/reverse`, 'PUT')
    if (res.success) { showToast('Transaction reversed.'); await loadUserTransactions(selectedUser.value!.id) }
    else {
      const tx = userTransactions.value.find(t => t.id === txId)
      if (tx) tx.status = 'reversed'
      showToast('Transaction reversed (Mock).')
    }
  } catch { showToast('Reversal failed.', 'error') }
}

onMounted(async () => {
  await fetchUsers()
  if (import.meta.client) {
    const route = useRoute()
    if (route.query.id) {
      const targetUser = users.value.find(u => u.id === route.query.id)
      if (targetUser) {
        openModal('transactions', targetUser)
      }
    }
  }
})
</script>

<style scoped>
.admin-page { animation: fadeIn 0.4s ease-out; color: #f8fafc; padding-bottom: 40px; }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px);} to { opacity:1; transform:translateY(0);} }

.page-header { margin-bottom: 28px; }
.admin-page-title { font-size: 28px; font-weight: 700; color: #f1f5f9; }
.page-subtitle { color: #94a3b8; font-size: 14px; margin-top: 4px; }

.search-bar { margin-bottom: 20px; }
.search-input-wrap { position: relative; max-width: 420px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; width: 18px; height: 18px; }
.search-input { width: 100%; padding: 10px 14px 10px 42px; border-radius: 10px; background: rgba(30,41,59,0.7); border: 1px solid rgba(255,255,255,0.08); color: #f1f5f9; font-size: 14px; outline: none; transition: border-color 0.2s; font-family: inherit; }
.search-input::placeholder { color: #64748b; }
.search-input:focus { border-color: rgba(99,102,241,0.5); }

.admin-card { background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; }

.admin-table-container { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; }
.admin-table th { padding: 14px 16px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap; }
.admin-table td { padding: 14px 16px; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; font-size: 14px; }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover td { background: rgba(255,255,255,0.02); }

.user-cell { display: flex; align-items: center; gap: 12px; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#8b5cf6); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }
.user-name-text { font-weight: 600; color: #f1f5f9; font-size: 14px; }
.user-id { font-size: 11px; color: #64748b; }
.muted-cell { color: #94a3b8; font-size: 13px; }
.balance-amount { font-weight: 700; color: #34d399; font-size: 15px; }
.empty-row { text-align: center; color: #64748b; padding: 32px !important; }

.status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em; }
.status-badge.success   { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
.status-badge.failed    { background: rgba(239,68,68,0.15);  color: #f87171; border: 1px solid rgba(239,68,68,0.25);  }
.status-badge.completed { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
.status-badge.pending   { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }
.status-badge.reversed  { background: rgba(148,163,184,0.15); color: #94a3b8; border: 1px solid rgba(148,163,184,0.25); }

.action-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.icon-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 16px; }
.deposit-btn { background: rgba(16,185,129,0.12); color: #34d399; border-color: rgba(16,185,129,0.2); }
.deposit-btn:hover { background: rgba(16,185,129,0.25); }
.deduct-btn  { background: rgba(239,68,68,0.12);  color: #f87171; border-color: rgba(239,68,68,0.2); }
.deduct-btn:hover  { background: rgba(239,68,68,0.25); }
.edit-btn    { background: rgba(99,102,241,0.12); color: #a5b4fc; border-color: rgba(99,102,241,0.2); }
.edit-btn:hover    { background: rgba(99,102,241,0.25); }
.tx-btn      { background: rgba(245,158,11,0.12); color: #fbbf24; border-color: rgba(245,158,11,0.2); }
.tx-btn:hover      { background: rgba(245,158,11,0.25); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal-box { background: #0f172a; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); animation: modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1); overflow: hidden; }
.modal-wide { max-width: 820px; }
@keyframes modalIn { from { opacity:0; transform:scale(0.92) translateY(12px);} to { opacity:1; transform:scale(1) translateY(0);} }

.modal-header { display: flex; align-items: center; gap: 12px; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.modal-header h2 { flex: 1; font-size: 18px; font-weight: 700; color: #f1f5f9; }
.modal-icon { width: 22px; height: 22px; flex-shrink: 0; }
.modal-icon.deposit { color: #34d399; }
.modal-icon.deduct  { color: #f87171; }
.modal-icon.edit    { color: #a5b4fc; }
.modal-icon.tx      { color: #fbbf24; }
.modal-close { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.05); border: none; color: #94a3b8; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
.modal-close:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.modal-user-label { font-size: 16px; font-weight: 700; color: #f1f5f9; }
.modal-balance-info { font-size: 13px; color: #94a3b8; margin-top: -10px; }
.modal-balance-info strong { color: #34d399; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }
.form-input { padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #f1f5f9; font-size: 14px; outline: none; transition: border-color 0.2s; font-family: inherit; }
.form-input:focus { border-color: rgba(99,102,241,0.5); }

.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.06); }
.modal-btn { padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; gap: 8px; font-family: inherit; }
.cancel-btn          { background: rgba(255,255,255,0.05); color: #94a3b8; }
.cancel-btn:hover    { background: rgba(255,255,255,0.08); color: #f1f5f9; }
.deposit-confirm-btn { background: #10b981; color: #fff; }
.deposit-confirm-btn:hover { background: #059669; }
.deduct-confirm-btn  { background: #ef4444; color: #fff; }
.deduct-confirm-btn:hover  { background: #dc2626; }
.edit-confirm-btn    { background: #6366f1; color: #fff; }
.edit-confirm-btn:hover    { background: #4f46e5; }
.modal-btn:disabled  { opacity: 0.6; cursor: not-allowed; }

.tx-table-wrap { max-height: 380px; overflow-y: auto; overflow-x: auto; }
.capitalize { text-transform: capitalize; }
.monospace  { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
.tx-amount.positive { color: #34d399; font-weight: 700; }
.tx-amount.negative { color: #f87171; font-weight: 700; }

.admin-btn { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; font-family: inherit; }
.admin-btn.success-btn { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
.admin-btn.success-btn:hover { background: rgba(16,185,129,0.3); }
.admin-btn.danger-btn  { background: rgba(239,68,68,0.15);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
.admin-btn.danger-btn:hover  { background: rgba(239,68,68,0.3); }
.ml-1 { margin-left: 4px; }

.admin-loading { padding: 32px; text-align: center; color: #94a3b8; font-size: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin-icon { animation: spin 0.7s linear infinite; width: 16px; height: 16px; }

.toast-bar { position: fixed; bottom: 28px; right: 28px; z-index: 9999; padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
.toast-bar.success { background: #064e3b; color: #34d399; border: 1px solid rgba(52,211,153,0.3); }
.toast-bar.error   { background: #450a0a; color: #f87171; border: 1px solid rgba(248,113,113,0.3); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(16px); }
</style>

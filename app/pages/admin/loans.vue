<template>
  <div class="admin-page fade-in">
    <div class="page-header">
      <div>
        <h1 class="admin-page-title">Loan Applications</h1>
        <p class="page-subtitle">Review, approve, or decline user loan requests</p>
      </div>
      <div class="header-stats">
        <div class="hstat"><span class="hstat-val yellow">{{ pendingCount }}</span><span class="hstat-label">Pending</span></div>
        <div class="hstat"><span class="hstat-val green">{{ approvedCount }}</span><span class="hstat-label">Approved</span></div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="search-wrap">
        <Icon name="lucide:search" :size="15" class="search-icon" />
        <input v-model="search" type="text" placeholder="Search by name or email..." class="filter-input" />
      </div>
      <div class="filter-tabs">
        <button v-for="tab in tabs" :key="tab" class="filter-tab" :class="{ active: activeTab === tab }" @click="activeTab = tab">{{ tab }}</button>
      </div>
      <button class="refresh-btn" @click="loadRequests" title="Refresh">
        <Icon name="lucide:refresh-cw" :size="15" :class="{ 'spin-icon': loading }" />
      </button>
    </div>

    <!-- Loan Requests Table -->
    <div class="admin-card">
      <div v-if="loading" class="admin-loading">
        <Icon name="lucide:loader-2" class="spin-icon" /> Loading requests...
      </div>
      <div v-else-if="filteredRequests.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <Icon name="lucide:hand-coins" :size="40" class="empty-icon" />
        </div>
        <div class="empty-title">No Loan Applications</div>
        <div class="empty-sub">
          {{ search || activeTab !== 'All' ? 'No results match your filter.' : 'When users submit loan requests from their dashboard, they will appear here for review.' }}
        </div>
      </div>
      <div v-else class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Loan Product</th>
              <th>Amount</th>
              <th>Term</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in filteredRequests" :key="req.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ (req.userName || '?')[0] }}</div>
                  <div>
                    <div class="user-name-text">{{ req.userName }}</div>
                    <div class="user-email-text">{{ req.userEmail }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="product-badge" :class="req.type">
                  {{ req.name }}
                </span>
              </td>
              <td>
                <span class="amount-value">${{ Number(req.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </td>
              <td class="muted-cell">{{ req.term }} months</td>
              <td class="reason-cell" :title="req.note">{{ req.note }}</td>
              <td class="muted-cell">{{ formatDate(req.created_at) }}</td>
              <td>
                <span :class="['status-badge', req.status?.toLowerCase()]">
                  {{ req.status }}
                </span>
              </td>
              <td>
                <div class="action-btns" v-if="req.status === 'PENDING'">
                  <button
                    class="action-btn approve-btn"
                    title="Approve Loan"
                    :disabled="actionLoading"
                    @click="handleApprove(req)"
                  >
                    <Icon name="lucide:check" :size="13" /> Approve
                  </button>
                  <button
                    class="action-btn decline-btn"
                    title="Decline Loan"
                    :disabled="actionLoading"
                    @click="handleDecline(req)"
                  >
                    Decline
                  </button>
                </div>
                <span v-else class="no-actions">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredRequests.length > 0" class="table-footer">
        <span class="table-count">{{ filteredRequests.length }} of {{ loanRequests.length }} requests</span>
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <Icon :name="toast.type === 'success' ? 'lucide:check-circle' : 'lucide:x-circle'" :size="16" />
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Loan Approvals | Tavrix Bank Admin' })

const auth = useAuth()
const loading = ref(true)
const actionLoading = ref(false)
const loanRequests = ref<any[]>([])
const search = ref('')
const activeTab = ref('All')
const tabs = ['All', 'Pending', 'Approved', 'Rejected']

const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

const pendingCount = computed(() => loanRequests.value.filter(r => r.status === 'PENDING').length)
const approvedCount = computed(() => loanRequests.value.filter(r => r.status === 'APPROVED').length)

const filteredRequests = computed(() => {
  let list = loanRequests.value
  if (activeTab.value !== 'All') {
    list = list.filter(r => r.status?.toUpperCase() === activeTab.value.toUpperCase())
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(r =>
      r.userName?.toLowerCase().includes(q) ||
      r.userEmail?.toLowerCase().includes(q)
    )
  }
  return list
})

const loadRequests = () => {
  loading.value = true
  if (import.meta.client) {
    const data = localStorage.getItem('loan_requests')
    loanRequests.value = data ? JSON.parse(data) : []
  }
  loading.value = false
}

onMounted(() => {
  loadRequests()
})

const handleApprove = async (req: any) => {
  if (!confirm(`Approve loan of $${Number(req.amount).toLocaleString()} for ${req.userName}?`)) return
  actionLoading.value = true
  try {
    // Attempt to deposit to user's account via backend
    const res = await auth.apiCall(`/admin/users/${req.userId}/deposit`, 'POST', {
      amount: Number(req.amount),
      note: `Approved ${req.name} loan`
    })

    // Always update localStorage status
    if (import.meta.client) {
      const data = localStorage.getItem('loan_requests')
      const currentRequests = data ? JSON.parse(data) : []
      const index = currentRequests.findIndex((r: any) => r.id === req.id)
      if (index !== -1) {
        currentRequests[index].status = 'APPROVED'
        localStorage.setItem('loan_requests', JSON.stringify(currentRequests))
        loanRequests.value = currentRequests
      }
    }

    showToast(res.success
      ? `Loan of $${Number(req.amount).toLocaleString()} approved and funds deposited.`
      : `Loan of $${Number(req.amount).toLocaleString()} approved.`
    )
  } catch {
    showToast('Failed to approve loan.', 'error')
  } finally {
    actionLoading.value = false
  }
}

const handleDecline = async (req: any) => {
  if (!confirm(`Decline ${req.userName}'s loan application?`)) return
  actionLoading.value = true
  try {
    if (import.meta.client) {
      const data = localStorage.getItem('loan_requests')
      const currentRequests = data ? JSON.parse(data) : []
      const index = currentRequests.findIndex((r: any) => r.id === req.id)
      if (index !== -1) {
        currentRequests[index].status = 'REJECTED'
        localStorage.setItem('loan_requests', JSON.stringify(currentRequests))
        loanRequests.value = currentRequests
      }
    }
    showToast('Loan application declined.')
  } catch {
    showToast('Failed to decline loan.', 'error')
  } finally {
    actionLoading.value = false
  }
}

const formatDate = (isoStr: string) => {
  if (!isoStr) return '—'
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.admin-page { animation: fadeIn 0.4s ease-out; color: #f8fafc; padding-bottom: 40px; }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px);} to { opacity:1; transform:translateY(0);} }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.admin-page-title { font-size: 26px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em; }
.page-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin-top: 4px; }

.header-stats { display: flex; gap: 16px; }
.hstat { display: flex; flex-direction: column; align-items: center; gap: 2px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 8px 16px; }
.hstat-val { font-size: 22px; font-weight: 700; color: #f1f5f9; }
.hstat-val.yellow { color: #fbbf24; }
.hstat-val.green { color: #34d399; }
.hstat-label { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.07em; }

.filter-bar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
.search-wrap { position: relative; flex: 1; min-width: 220px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.3); }
.filter-input { width: 100%; background: rgba(13,20,36,0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 9px 12px 9px 36px; color: #f1f5f9; font-size: 13.5px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.filter-input:focus { border-color: rgba(99,102,241,0.5); }
.filter-tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 4px; }
.filter-tab { padding: 6px 14px; border-radius: 7px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.45); cursor: pointer; border: none; background: none; font-family: inherit; transition: all 0.18s; }
.filter-tab.active { background: rgba(99,102,241,0.2); color: #a5b4fc; }
.refresh-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 9px; color: rgba(255,255,255,0.45); cursor: pointer; transition: all 0.18s; }
.refresh-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }

.admin-card { background: rgba(13,20,36,0.9); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; }
.admin-loading { padding: 40px; text-align: center; color: #94a3b8; display: flex; align-items: center; justify-content: center; gap: 10px; }
.admin-table-container { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; }
.admin-table th { padding: 12px 16px; color: rgba(255,255,255,0.4); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; border-bottom: 1px solid rgba(255,255,255,0.07); white-space: nowrap; }
.admin-table td { padding: 14px 16px; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; font-size: 13.5px; }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover td { background: rgba(255,255,255,0.02); }

.empty-state { padding: 60px 24px; text-align: center; }
.empty-icon-wrap { width: 72px; height: 72px; border-radius: 18px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.empty-icon { color: rgba(99,102,241,0.6); }
.empty-title { font-size: 18px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
.empty-sub { font-size: 13.5px; color: rgba(255,255,255,0.35); max-width: 380px; margin: 0 auto; line-height: 1.6; }

.user-cell { display: flex; align-items: center; gap: 11px; }
.user-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #ef4444, #f43f5e); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: #fff; flex-shrink: 0; }
.user-name-text { font-weight: 600; color: #f1f5f9; font-size: 13.5px; }
.user-email-text { font-size: 11.5px; color: rgba(255,255,255,0.35); }

.product-badge { display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.product-badge.personal { background: rgba(168,85,247,0.15); color: #c084fc; }
.product-badge.home-eq, .product-badge.home { background: rgba(59,130,246,0.15); color: #60a5fa; }
.product-badge.auto { background: rgba(14,165,233,0.15); color: #38bdf8; }
.product-badge.business { background: rgba(249,115,22,0.15); color: #fb923c; }

.amount-value { font-weight: 700; color: #f1f5f9; }
.muted-cell { color: rgba(255,255,255,0.4); font-size: 13px; }
.reason-cell { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: rgba(255,255,255,0.4); font-size: 13px; }
.no-actions { color: rgba(255,255,255,0.25); }

.status-badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.status-badge.approved { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
.status-badge.rejected { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
.status-badge.pending { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }

.action-btns { display: flex; gap: 8px; align-items: center; }
.action-btn { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border: none; border-radius: 7px; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.approve-btn { background: #10b981; color: #fff; }
.approve-btn:hover:not(:disabled) { background: #059669; }
.decline-btn { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
.decline-btn:hover:not(:disabled) { background: rgba(239,68,68,0.25); }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.table-footer { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: flex-end; }
.table-count { font-size: 12px; color: rgba(255,255,255,0.3); }

.toast { position: fixed; bottom: 28px; right: 28px; display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; z-index: 9999; backdrop-filter: blur(12px); }
.toast.success { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
.toast.error { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

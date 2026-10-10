<template>
  <div class="admin-page fade-in">
    <div class="page-header">
      <div>
        <h1 class="admin-page-title">Deposit Management</h1>
        <p class="page-subtitle">Review and approve pending deposit requests</p>
      </div>
      <div class="header-stats">
        <div class="hstat"><span class="hstat-val">{{ pendingCount }}</span><span class="hstat-label">Pending</span></div>
        <div class="hstat"><span class="hstat-val green">{{ approvedCount }}</span><span class="hstat-label">Approved</span></div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <div class="search-wrap">
        <Icon name="lucide:search" :size="15" class="search-icon" />
        <input v-model="search" type="text" placeholder="Search by reference or user..." class="filter-input" />
      </div>
      <div class="filter-tabs">
        <button v-for="tab in tabs" :key="tab" class="filter-tab" :class="{ active: activeTab === tab }" @click="activeTab = tab">{{ tab }}</button>
      </div>
      <button class="refresh-btn" @click="fetchDeposits" :disabled="loading" title="Refresh">
        <Icon name="lucide:refresh-cw" :size="15" :class="{ 'spin-icon': loading }" />
      </button>
    </div>

    <div class="admin-card">
      <div v-if="loading" class="admin-loading"><Icon name="lucide:loader-2" class="spin-icon" /> Loading deposits...</div>
      <div v-else class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Reference</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dep in filteredDeposits" :key="dep.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ (dep.userName || '?')[0] }}</div>
                  <div>
                    <div class="user-name-text">{{ dep.userName }}</div>
                    <div class="user-email-text">{{ dep.userEmail }}</div>
                  </div>
                </div>
              </td>
              <td class="monospace">{{ dep.reference }}</td>
              <td><span class="method-badge" :class="dep.method">{{ dep.method }}</span></td>
              <td><span class="amount-value">${{ dep.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span></td>
              <td class="muted-cell">{{ formatDate(dep.created_at) }}</td>
              <td><span :class="['status-badge', dep.status.toLowerCase()]">{{ dep.status }}</span></td>
              <td>
                <div class="action-btns" v-if="dep.status === 'PENDING'">
                  <button class="action-btn approve-btn" title="Approve" :disabled="actionLoading" @click="handleApprove(dep)">
                    <Icon name="lucide:check" :size="14" />
                  </button>
                  <button class="action-btn reject-btn" title="Reject" :disabled="actionLoading" @click="handleReject(dep)">
                    <Icon name="lucide:x" :size="14" />
                  </button>
                </div>
                <span v-else class="muted-cell">—</span>
              </td>
            </tr>
            <tr v-if="filteredDeposits.length === 0">
              <td colspan="7" class="empty-row">No deposits found.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredDeposits.length > 0" class="table-footer">
        <span class="table-count">{{ filteredDeposits.length }} of {{ deposits.length }} deposits</span>
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
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Deposit Management | Tavrix Bank Admin' })

interface Deposit {
  id: string
  userName: string
  userEmail: string
  reference: string
  method: string
  amount: number
  status: string
  created_at: string
}

const MOCK: Deposit[] = [
  { id: 'd1', userName: 'John Smith', userEmail: 'john@example.com', reference: 'DEP-99321', method: 'bank', amount: 2650, status: 'PENDING', created_at: new Date(Date.now()-3600000*2).toISOString() },
  { id: 'd2', userName: 'Sarah Kim', userEmail: 'sarah@example.com', reference: 'DEP-88102', method: 'crypto', amount: 800, status: 'PENDING', created_at: new Date(Date.now()-3600000*5).toISOString() },
  { id: 'd3', userName: 'Jane Doe', userEmail: 'jane@example.com', reference: 'DEP-77543', method: 'card', amount: 150, status: 'APPROVED', created_at: new Date(Date.now()-3600000*24).toISOString() },
  { id: 'd4', userName: 'Mark Lee', userEmail: 'mark@example.com', reference: 'DEP-66921', method: 'bank', amount: 5000, status: 'APPROVED', created_at: new Date(Date.now()-3600000*48).toISOString() },
  { id: 'd5', userName: 'Ana Torres', userEmail: 'ana@example.com', reference: 'DEP-55110', method: 'crypto', amount: 320, status: 'REJECTED', created_at: new Date(Date.now()-3600000*72).toISOString() },
]

const deposits = ref<Deposit[]>([])
const loading = ref(true)
const actionLoading = ref(false)
const search = ref('')
const activeTab = ref('All')
const tabs = ['All', 'Pending', 'Approved', 'Rejected']
const auth = useAuth()

const toast = ref({ show: false, msg: '', type: 'success' })
const showToast = (msg: string, type = 'success') => {
  toast.value = { show: true, msg, type }
  setTimeout(() => toast.value.show = false, 3000)
}

const pendingCount = computed(() => deposits.value.filter(d => d.status === 'PENDING').length)
const approvedCount = computed(() => deposits.value.filter(d => d.status === 'APPROVED').length)

const filteredDeposits = computed(() => {
  let list = deposits.value
  if (activeTab.value !== 'All') list = list.filter(d => d.status === activeTab.value.toUpperCase())
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(d => d.reference.toLowerCase().includes(q) || d.userName.toLowerCase().includes(q))
  }
  return list
})

const formatDate = (s: string) => new Date(s).toLocaleString()

const handleApprove = async (dep: Deposit) => {
  actionLoading.value = true
  try {
    const res = await auth.apiCall(`/admin/deposits/${dep.id}/approve`, 'PUT')
    if (res.success) { dep.status = 'APPROVED'; showToast('Deposit approved.') }
    else { dep.status = 'APPROVED'; showToast('Deposit approved (mock).') }
  } catch { dep.status = 'APPROVED'; showToast('Deposit approved (offline).') }
  finally { actionLoading.value = false }
}

const handleReject = async (dep: Deposit) => {
  actionLoading.value = true
  try {
    const res = await auth.apiCall(`/admin/deposits/${dep.id}/reject`, 'PUT')
    if (res.success) { dep.status = 'REJECTED'; showToast('Deposit rejected.', 'error') }
    else { dep.status = 'REJECTED'; showToast('Deposit rejected (mock).', 'error') }
  } catch { dep.status = 'REJECTED'; showToast('Deposit rejected (offline).', 'error') }
  finally { actionLoading.value = false }
}

const fetchDeposits = async () => {
  loading.value = true
  try {
    const res = await auth.apiCall<any>('/admin/deposits', 'GET')
    const raw = res.data?.data?.data ?? res.data?.data ?? res.data
    deposits.value = Array.isArray(raw) ? raw : MOCK
  } catch { deposits.value = MOCK }
  finally { loading.value = false }
}

onMounted(() => fetchDeposits())
</script>

<style scoped>
.admin-page { animation: fadeIn 0.4s ease-out; color: #f8fafc; }
@keyframes fadeIn { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }

.page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
.admin-page-title { font-size:26px; font-weight:700; color:#f1f5f9; letter-spacing:-0.02em; }
.page-subtitle { font-size:14px; color:rgba(255,255,255,0.4); margin-top:4px; }
.header-stats { display:flex; gap:16px; }
.hstat { display:flex; flex-direction:column; align-items:center; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:10px 20px; }
.hstat-val { font-size:22px; font-weight:700; color:#f1f5f9; }
.hstat-val.green { color:#34d399; }
.hstat-label { font-size:11px; color:rgba(255,255,255,0.4); margin-top:2px; }

.filter-bar { display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; align-items:center; }
.search-wrap { position:relative; flex:1; min-width:200px; }
.search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.3); }
.filter-input { width:100%; background:rgba(13,20,36,0.9); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 12px 10px 36px; color:#f1f5f9; font-size:13.5px; font-family:inherit; outline:none; transition:border-color 0.2s; }
.filter-input:focus { border-color:rgba(99,102,241,0.5); }
.filter-tabs { display:flex; gap:4px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:4px; }
.filter-tab { padding:6px 14px; border-radius:7px; font-size:13px; font-weight:500; color:rgba(255,255,255,0.45); cursor:pointer; border:none; background:none; font-family:inherit; transition:all 0.18s; }
.filter-tab.active { background:rgba(99,102,241,0.2); color:#a5b4fc; }

.admin-card { background:rgba(13,20,36,0.9); border:1px solid rgba(255,255,255,0.07); border-radius:14px; overflow:hidden; }
.admin-loading { padding:40px; text-align:center; color:#94a3b8; display:flex; align-items:center; justify-content:center; gap:10px; }
.refresh-btn { width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:9px; color:rgba(255,255,255,0.45); cursor:pointer; transition:all 0.18s; flex-shrink:0; }
.refresh-btn:hover { background:rgba(255,255,255,0.08); color:#fff; }
.admin-table-container { overflow-x:auto; }
.admin-table { width:100%; border-collapse:collapse; text-align:left; }
.admin-table th { padding:12px 14px; color:rgba(255,255,255,0.35); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; border-bottom:1px solid rgba(255,255,255,0.07); }
.admin-table td { padding:14px; color:#cbd5e1; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:middle; font-size:13.5px; }
.admin-table tr:last-child td { border-bottom:none; }
.admin-table tr:hover td { background:rgba(255,255,255,0.02); }
.empty-row { text-align:center; color:rgba(255,255,255,0.25); padding:40px!important; }
.table-footer { padding:12px 16px; border-top:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:flex-end; }
.table-count { font-size:12px; color:rgba(255,255,255,0.3); }

.user-cell { display:flex; align-items:center; gap:10px; }
.user-avatar { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.user-name-text { font-size:13.5px; font-weight:600; color:#f1f5f9; }
.user-email-text { font-size:12px; color:rgba(255,255,255,0.35); }
.monospace { font-family:'JetBrains Mono','Courier New',monospace; font-size:12px; color:#94a3b8; }
.muted-cell { color:rgba(255,255,255,0.35); font-size:13px; }
.amount-value { font-weight:700; color:#f1f5f9; font-size:14px; }

.method-badge { display:inline-block; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:600; text-transform:uppercase; }
.method-badge.bank { background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.25); }
.method-badge.crypto { background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.25); }
.method-badge.card { background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.25); }

.status-badge { display:inline-block; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; text-transform:uppercase; }
.status-badge.pending { background:rgba(245,158,11,0.15); color:#fbbf24; border:1px solid rgba(245,158,11,0.25); }
.status-badge.approved { background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.25); }
.status-badge.rejected { background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.25); }

.action-btns { display:flex; gap:6px; }
.action-btn { width:30px; height:30px; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.18s; font-family:inherit; }
.approve-btn { background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.25); }
.approve-btn:hover { background:rgba(16,185,129,0.3); }
.reject-btn { background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.25); }
.reject-btn:hover { background:rgba(239,68,68,0.3); }
.action-btn:disabled { opacity:0.5; cursor:not-allowed; }

.toast { position:fixed; bottom:28px; right:28px; display:flex; align-items:center; gap:8px; padding:12px 20px; border-radius:12px; font-size:14px; font-weight:500; z-index:9999; backdrop-filter:blur(12px); }
.toast.success { background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); }
.toast.error { background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity:0; transform:translateY(10px); }

.spin-icon { animation:spin 1s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>

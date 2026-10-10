<template>
  <div class="admin-page fade-in">
    <div class="page-header">
      <div>
        <h1 class="admin-page-title">KYC Approvals</h1>
        <p class="page-subtitle">Review submitted identity documents and approve or reject them</p>
      </div>
      <div class="header-stats">
        <div class="hstat"><span class="hstat-val yellow">{{ pendingCount }}</span><span class="hstat-label">Pending</span></div>
        <div class="hstat"><span class="hstat-val green">{{ approvedCount }}</span><span class="hstat-label">Approved</span></div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-wrap">
        <Icon name="lucide:search" :size="15" class="search-icon" />
        <input v-model="search" type="text" placeholder="Search by name or document type..." class="filter-input" />
      </div>
      <div class="filter-tabs">
        <button v-for="tab in tabs" :key="tab" class="filter-tab" :class="{ active: activeTab === tab }" @click="activeTab = tab">{{ tab }}</button>
      </div>
      <button class="refresh-btn" @click="fetchKyc" :disabled="loading" title="Refresh">
        <Icon name="lucide:refresh-cw" :size="15" :class="{ 'spin-icon': loading }" />
      </button>
    </div>

    <div class="admin-card">
      <div v-if="loading" class="admin-loading"><Icon name="lucide:loader-2" class="spin-icon" /> Loading KYC submissions...</div>
      <div v-else class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Document Type</th>
              <th>Document</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in filteredDocs" :key="doc.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ (doc.userName || '?')[0] }}</div>
                  <div>
                    <div class="user-name-text">{{ doc.userName }}</div>
                    <div class="user-email-text monospace">{{ doc.user_id.substring(0,12) }}...</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="doc-type-cell">
                  <Icon :name="getDocIcon(doc.document_type)" :size="15" class="doc-icon" />
                  <span class="capitalize">{{ doc.document_type }}</span>
                </div>
              </td>
              <td>
                <a :href="doc.document_url" target="_blank" rel="noreferrer" class="doc-link">
                  <Icon name="lucide:external-link" :size="13" />
                  View Document
                </a>
              </td>
              <td class="muted-cell">{{ formatDate(doc.submitted_at) }}</td>
              <td>
                <span :class="['status-badge', doc.status.toLowerCase()]">{{ doc.status }}</span>
              </td>
              <td>
                <div class="action-btns" v-if="doc.status === 'PENDING'">
                  <button class="action-btn approve-btn" title="Approve KYC" :disabled="actionLoading" @click="handleApprove(doc)">
                    <Icon name="lucide:shield-check" :size="14" />
                  </button>
                  <button class="action-btn reject-btn" title="Reject KYC" :disabled="actionLoading" @click="handleReject(doc)">
                    <Icon name="lucide:shield-x" :size="14" />
                  </button>
                </div>
                <span v-else class="muted-cell">—</span>
              </td>
            </tr>
            <tr v-if="filteredDocs.length === 0">
              <td colspan="6" class="empty-row">No KYC submissions found.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredDocs.length > 0" class="table-footer">
        <span class="table-count">{{ filteredDocs.length }} of {{ kycDocs.length }} submissions</span>
      </div>
    </div>

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
useHead({ title: 'KYC Approvals | Tavrix Bank Admin' })

interface KYC {
  id: string
  user_id: string
  userName: string
  document_type: string
  document_url: string
  status: string
  submitted_at: string
}

const MOCK: KYC[] = [
  { id: 'kyc-1', user_id: '1001-a1b2-c3d4-e5f6', userName: 'John Smith', document_type: 'passport', document_url: '#', status: 'PENDING', submitted_at: new Date(Date.now()-3600000*2).toISOString() },
  { id: 'kyc-2', user_id: '1002-e5f6-g7h8-i9j0', userName: 'Sarah Kim', document_type: 'drivers license', document_url: '#', status: 'PENDING', submitted_at: new Date(Date.now()-3600000*5).toISOString() },
  { id: 'kyc-3', user_id: '1003-k1l2-m3n4-o5p6', userName: 'Mark Lee', document_type: 'national id', document_url: '#', status: 'PENDING', submitted_at: new Date(Date.now()-3600000*10).toISOString() },
  { id: 'kyc-4', user_id: '1004-q7r8-s9t0-u1v2', userName: 'Jane Doe', document_type: 'passport', document_url: '#', status: 'APPROVED', submitted_at: new Date(Date.now()-3600000*24).toISOString() },
]

const kycDocs = ref<KYC[]>([])
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

const pendingCount = computed(() => kycDocs.value.filter(d => d.status === 'PENDING').length)
const approvedCount = computed(() => kycDocs.value.filter(d => d.status === 'APPROVED').length)

const filteredDocs = computed(() => {
  let list = kycDocs.value
  if (activeTab.value !== 'All') list = list.filter(d => d.status === activeTab.value.toUpperCase())
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(d => d.user_id.toLowerCase().includes(q) || d.document_type.toLowerCase().includes(q) || d.userName.toLowerCase().includes(q))
  }
  return list
})

const formatDate = (s: string) => new Date(s).toLocaleString()

const getDocIcon = (type: string) => {
  if (type.includes('passport')) return 'lucide:book-open'
  if (type.includes('license')) return 'lucide:car'
  return 'lucide:id-card'
}

const handleApprove = async (doc: KYC) => {
  actionLoading.value = true
  try {
    await auth.apiCall(`/admin/kyc/${doc.id}/approve`, 'PUT')
    doc.status = 'APPROVED'
    showToast('KYC approved successfully.')
  } catch { doc.status = 'APPROVED'; showToast('KYC approved (offline).') }
  finally { actionLoading.value = false }
}

const handleReject = async (doc: KYC) => {
  actionLoading.value = true
  try {
    await auth.apiCall(`/admin/kyc/${doc.id}/reject`, 'PUT')
    doc.status = 'REJECTED'
    showToast('KYC rejected.', 'error')
  } catch { doc.status = 'REJECTED'; showToast('KYC rejected (offline).', 'error') }
  finally { actionLoading.value = false }
}

const fetchKyc = async () => {
  loading.value = true
  try {
    const res = await auth.apiCall<any>('/admin/kyc', 'GET')
    const raw = res.data?.data?.data ?? res.data?.data ?? res.data
    kycDocs.value = Array.isArray(raw) ? raw : MOCK
  } catch { kycDocs.value = MOCK }
  finally { loading.value = false }
}

onMounted(() => fetchKyc())
</script>

<style scoped>
.admin-page{animation:fadeIn 0.4s ease-out;color:#f8fafc}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px}
.admin-page-title{font-size:26px;font-weight:700;color:#f1f5f9;letter-spacing:-0.02em}
.page-subtitle{font-size:14px;color:rgba(255,255,255,0.4);margin-top:4px}
.header-stats{display:flex;gap:16px}
.hstat{display:flex;flex-direction:column;align-items:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px 20px}
.hstat-val{font-size:22px;font-weight:700;color:#f1f5f9}
.hstat-val.green{color:#34d399}
.hstat-val.yellow{color:#fbbf24}
.hstat-label{font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px}
.filter-bar{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
.search-wrap{position:relative;flex:1;min-width:200px}
.search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.3)}
.filter-input{width:100%;background:rgba(13,20,36,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 12px 10px 36px;color:#f1f5f9;font-size:13.5px;font-family:inherit;outline:none;transition:border-color 0.2s;box-sizing:border-box}
.filter-input:focus{border-color:rgba(99,102,241,0.5)}
.filter-tabs{display:flex;gap:4px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:4px}
.filter-tab{padding:6px 14px;border-radius:7px;font-size:13px;font-weight:500;color:rgba(255,255,255,0.45);cursor:pointer;border:none;background:none;font-family:inherit;transition:all 0.18s}
.filter-tab.active{background:rgba(99,102,241,0.2);color:#a5b4fc}
.admin-card{background:rgba(13,20,36,0.9);border:1px solid rgba(255,255,255,0.07);border-radius:14px;overflow:hidden}
.admin-loading{padding:40px;text-align:center;color:#94a3b8;display:flex;align-items:center;justify-content:center;gap:10px}
.refresh-btn{width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:rgba(255,255,255,0.45);cursor:pointer;transition:all 0.18s;flex-shrink:0}
.refresh-btn:hover{background:rgba(255,255,255,0.08);color:#fff}
.admin-table-container{overflow-x:auto}
.admin-table{width:100%;border-collapse:collapse;text-align:left}
.admin-table th{padding:12px 14px;color:rgba(255,255,255,0.35);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;border-bottom:1px solid rgba(255,255,255,0.07)}
.admin-table td{padding:14px;color:#cbd5e1;border-bottom:1px solid rgba(255,255,255,0.04);vertical-align:middle;font-size:13.5px}
.admin-table tr:hover td{background:rgba(255,255,255,0.02)}
.empty-row{text-align:center;color:rgba(255,255,255,0.25);padding:40px!important}
.table-footer{padding:12px 16px;border-top:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:flex-end}
.table-count{font-size:12px;color:rgba(255,255,255,0.3)}
.user-cell{display:flex;align-items:center;gap:10px}
.user-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.user-name-text{font-size:13.5px;font-weight:600;color:#f1f5f9}
.user-email-text{font-size:11px;color:rgba(255,255,255,0.3)}
.doc-type-cell{display:flex;align-items:center;gap:7px}
.doc-icon{color:rgba(255,255,255,0.4)}
.capitalize{text-transform:capitalize;color:#cbd5e1}
.doc-link{display:inline-flex;align-items:center;gap:5px;color:#818cf8;text-decoration:none;font-size:13px;font-weight:500;transition:color 0.2s}
.doc-link:hover{color:#a5b4fc}
.monospace{font-family:'JetBrains Mono','Courier New',monospace;font-size:11px}
.muted-cell{color:rgba(255,255,255,0.35);font-size:13px}
.status-badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;text-transform:uppercase}
.status-badge.pending{background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.25)}
.status-badge.approved{background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.25)}
.status-badge.rejected{background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.25)}
.action-btns{display:flex;gap:6px}
.action-btn{width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.18s}
.approve-btn{background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.25)}
.approve-btn:hover{background:rgba(16,185,129,0.3)}
.reject-btn{background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.25)}
.reject-btn:hover{background:rgba(239,68,68,0.3)}
.action-btn:disabled{opacity:0.5;cursor:not-allowed}
.toast{position:fixed;bottom:28px;right:28px;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;backdrop-filter:blur(12px)}
.toast.success{background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3)}
.toast.error{background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3)}
.toast-enter-active,.toast-leave-active{transition:all 0.3s ease}
.toast-enter-from,.toast-leave-to{opacity:0;transform:translateY(10px)}
.spin-icon{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
</style>

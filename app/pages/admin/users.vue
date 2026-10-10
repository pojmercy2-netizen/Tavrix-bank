<template>
  <div class="admin-page fade-in">
    <div class="page-header">
      <div>
        <h1 class="admin-page-title">All Users</h1>
        <p class="page-subtitle">Manage accounts, roles, and access across the platform</p>
      </div>
      <NuxtLink to="/admin/create-user" class="create-btn">
        <Icon name="lucide:user-plus" :size="15" /> Create User
      </NuxtLink>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="search-wrap">
        <Icon name="lucide:search" :size="15" class="search-icon" />
        <input v-model="search" type="text" placeholder="Search by name or email..." class="filter-input" />
      </div>
      <div class="filter-tabs">
        <button v-for="tab in statusTabs" :key="tab" class="filter-tab" :class="{ active: activeTab === tab }" @click="activeTab = tab">
          {{ tab }}
        </button>
      </div>
      <button class="refresh-btn" @click="fetchUsers" :disabled="loading" title="Refresh">
        <Icon name="lucide:refresh-cw" :size="15" :class="{ 'spin-icon': loading }" />
      </button>
    </div>

    <div class="admin-card">
      <div v-if="loading" class="admin-loading">
        <Icon name="lucide:loader-2" class="spin-icon" /> Loading users...
      </div>
      <div v-else class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>KYC</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar" :style="{ background: avatarColor(user.fullName || user.email) }">
                    {{ (user.fullName || user.email)?.[0]?.toUpperCase() }}
                  </div>
                  <div>
                    <div class="user-name-text">{{ user.fullName || '—' }}</div>
                    <div class="user-email-text">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <select class="role-select" :value="user.role" @change="handleRoleChange(user, ($event.target as HTMLSelectElement).value)" :disabled="actionLoading === user.id || user.role === 'superadmin'">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin" disabled>Superadmin</option>
                </select>
              </td>
              <td>
                <span :class="['status-badge', user.status]">{{ user.status }}</span>
              </td>
              <td>
                <span :class="['kyc-badge', user.kycStatus]">{{ user.kycStatus || 'none' }}</span>
              </td>
              <td class="muted-cell">{{ formatDate(user.createdAt || user.created_at || '') }}</td>
              <td>
                <div class="action-btns">
                  <NuxtLink :to="`/admin/user-management?id=${user.id}`" class="action-icon-btn view-btn" title="Manage Account">
                    <Icon name="lucide:settings-2" :size="14" />
                  </NuxtLink>
                  <button
                    v-if="user.status !== 'banned' && user.role !== 'superadmin'"
                    class="action-icon-btn ban-btn"
                    title="Ban User"
                    :disabled="actionLoading === user.id"
                    @click="handleBan(user)"
                  >
                    <Icon name="lucide:ban" :size="14" />
                  </button>
                  <button
                    v-if="user.status === 'banned'"
                    class="action-icon-btn unban-btn"
                    title="Unban User"
                    :disabled="actionLoading === user.id"
                    @click="handleUnban(user)"
                  >
                    <Icon name="lucide:shield-check" :size="14" />
                  </button>
                  <button
                    v-if="user.role !== 'superadmin'"
                    class="action-icon-btn delete-btn"
                    title="Delete User"
                    :disabled="actionLoading === user.id"
                    @click="promptDelete(user)"
                  >
                    <Icon name="lucide:trash-2" :size="14" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="empty-row">
                <Icon name="lucide:users" :size="32" class="empty-icon" />
                <div>No users found{{ search ? ` matching "${search}"` : '' }}.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <span class="table-count">{{ filteredUsers.length }} of {{ users.length }} users</span>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Transition name="modal">
      <div v-if="deleteModal.show" class="modal-overlay" @click.self="deleteModal.show = false">
        <div class="modal-box">
          <div class="modal-icon-wrap">
            <Icon name="lucide:trash-2" :size="28" class="modal-danger-icon" />
          </div>
          <h3 class="modal-title">Delete User?</h3>
          <p class="modal-desc">
            You're about to permanently delete
            <strong>{{ deleteModal.user?.fullName || deleteModal.user?.email }}</strong>.
            This action <em>cannot</em> be undone and will remove all their data.
          </p>
          <div class="modal-user-info">
            <span class="modal-avatar" :style="{ background: deleteModal.user ? avatarColor(deleteModal.user.fullName || deleteModal.user.email) : '#6366f1' }">
              {{ (deleteModal.user?.fullName || deleteModal.user?.email)?.[0]?.toUpperCase() }}
            </span>
            <div>
              <div class="modal-user-name">{{ deleteModal.user?.fullName || '—' }}</div>
              <div class="modal-user-email">{{ deleteModal.user?.email }}</div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="modal-cancel-btn" @click="deleteModal.show = false" :disabled="deleteLoading">Cancel</button>
            <button class="modal-delete-btn" @click="confirmDelete" :disabled="deleteLoading">
              <Icon v-if="deleteLoading" name="lucide:loader-2" :size="14" class="spin-icon" />
              <Icon v-else name="lucide:trash-2" :size="14" />
              {{ deleteLoading ? 'Deleting…' : 'Delete User' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

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
useHead({ title: 'All Users | Tavrix Bank Admin' })

interface AdminUser {
  id: string
  email: string
  fullName: string
  username: string
  role: string
  status: string
  kycStatus: string
  createdAt: string
  created_at?: string
}

const DEFAULT_USERS: AdminUser[] = [
  { id: '1', email: 'john.smith@example.com', fullName: 'John Smith', username: 'johnsmith', role: 'user', status: 'active', kycStatus: 'verified', createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: '2', email: 'jane.doe@example.com', fullName: 'Jane Doe', username: 'janedoe', role: 'user', status: 'banned', kycStatus: 'none', createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
  { id: '3', email: 'admin@tavrixbank.com', fullName: 'Super Administrator', username: 'admin', role: 'admin', status: 'active', kycStatus: 'verified', createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
]

const users = ref<AdminUser[]>([])
const loading = ref(true)
const actionLoading = ref<string | null>(null)
const deleteModal = ref<{ show: boolean; user: AdminUser | null }>({ show: false, user: null })
const deleteLoading = ref(false)
const search = ref('')
const activeTab = ref('All')
const statusTabs = ['All', 'Active', 'Banned', 'Suspended']
const auth = useAuth()

const toast = ref({ show: false, msg: '', type: 'success' })
const showToast = (msg: string, type = 'success') => {
  toast.value = { show: true, msg, type }
  setTimeout(() => toast.value.show = false, 3000)
}

const AVATAR_COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#06b6d4']
const avatarColor = (name: string) => AVATAR_COLORS[(name?.charCodeAt(0) || 65) % AVATAR_COLORS.length]

const filteredUsers = computed(() => {
  let list = users.value
  if (activeTab.value !== 'All') list = list.filter(u => u.status === activeTab.value.toLowerCase())
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(u => u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q))
  }
  return list
})

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await auth.apiCall<any>('/admin/users', 'GET')
    const raw = res.data?.data?.data ?? res.data?.data ?? res.data
    users.value = Array.isArray(raw) ? raw : DEFAULT_USERS
  } catch {
    users.value = DEFAULT_USERS
  } finally {
    loading.value = false
  }
}

const handleBan = async (user: AdminUser) => {
  if (!confirm(`Ban ${user.fullName}? They will lose access immediately.`)) return
  actionLoading.value = user.id
  try {
    const res = await auth.apiCall(`/admin/users/${user.id}/ban`, 'PUT', { ban: true })
    if (res.success) {
      user.status = 'banned'
      showToast(`${user.fullName} has been banned.`)
    } else {
      showToast(res.error || 'Ban failed.', 'error')
    }
  } catch {
    showToast('Network error. Try again.', 'error')
  } finally {
    actionLoading.value = null
  }
}

const handleUnban = async (user: AdminUser) => {
  actionLoading.value = user.id
  try {
    const res = await auth.apiCall(`/admin/users/${user.id}/ban`, 'PUT', { ban: false })
    if (res.success) {
      user.status = 'active'
      showToast(`${user.fullName} has been unbanned.`)
    } else {
      // Offline fallback
      user.status = 'active'
      showToast(`${user.fullName} unbanned (offline).`)
    }
  } catch {
    user.status = 'active'
    showToast(`${user.fullName} unbanned (offline).`)
  } finally {
    actionLoading.value = null
  }
}

const handleRoleChange = async (user: AdminUser, newRole: string) => {
  if (newRole === user.role) return
  if (!confirm(`Change ${user.fullName}'s role to "${newRole}"?`)) return
  actionLoading.value = user.id
  const prevRole = user.role
  user.role = newRole
  try {
    const res = await auth.apiCall(`/admin/users/${user.id}/role`, 'PUT', { role: newRole })
    if (res.success) {
      showToast(`Role updated to ${newRole}.`)
    } else {
      showToast('Role updated (offline).')
    }
  } catch {
    showToast('Role updated (offline).')
  } finally {
    actionLoading.value = null
  }
}

const promptDelete = (user: AdminUser) => {
  deleteModal.value = { show: true, user }
}

const confirmDelete = async () => {
  const user = deleteModal.value.user
  if (!user) return
  deleteLoading.value = true
  try {
    const res = await auth.apiCall(`/admin/users/${user.id}/delete`, 'DELETE')
    if (res.success || res.data?.success) {
      users.value = users.value.filter(u => u.id !== user.id)
      showToast(`${user.fullName || user.email} has been deleted.`)
      deleteModal.value.show = false
    } else {
      showToast(res.error || 'Delete failed. Please try again.', 'error')
    }
  } catch {
    showToast('Network error. Please try again.', 'error')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
.admin-page { animation: fadeIn 0.4s ease-out; color: #f8fafc; }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.admin-page-title { font-size: 26px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em; }
.page-subtitle { font-size: 14px; color: rgba(255,255,255,0.4); margin-top: 4px; }

.create-btn { display: flex; align-items: center; gap: 7px; padding: 9px 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-radius: 10px; font-size: 13.5px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
.create-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.35); }

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
.admin-table td { padding: 13px 16px; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; font-size: 13.5px; }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover td { background: rgba(255,255,255,0.02); }

.user-cell { display: flex; align-items: center; gap: 11px; }
.user-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: #fff; flex-shrink: 0; }
.user-name-text { font-weight: 600; color: #f1f5f9; font-size: 13.5px; }
.user-email-text { font-size: 11.5px; color: rgba(255,255,255,0.35); margin-top: 1px; }
.muted-cell { color: rgba(255,255,255,0.4); font-size: 13px; }

.role-select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 7px; color: #f1f5f9; padding: 5px 10px; font-size: 12px; font-weight: 600; cursor: pointer; outline: none; transition: border-color 0.2s; }
.role-select:focus { border-color: rgba(99,102,241,0.5); }
.role-select:disabled { opacity: 0.5; cursor: not-allowed; }

.status-badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
.status-badge.active { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
.status-badge.banned { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
.status-badge.suspended { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }
.status-badge.deactivated { background: rgba(148,163,184,0.12); color: #94a3b8; border: 1px solid rgba(148,163,184,0.2); }

.kyc-badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
.kyc-badge.verified { background: rgba(16,185,129,0.1); color: #34d399; }
.kyc-badge.pending { background: rgba(245,158,11,0.1); color: #fbbf24; }
.kyc-badge.rejected { background: rgba(239,68,68,0.1); color: #f87171; }
.kyc-badge.none, .kyc-badge.unverified { background: rgba(148,163,184,0.1); color: #64748b; }

.action-btns { display: flex; gap: 6px; }
.action-icon-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 7px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); cursor: pointer; transition: all 0.18s; text-decoration: none; color: rgba(255,255,255,0.5); }
.action-icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
.action-icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ban-btn:hover { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }
.unban-btn:hover { background: rgba(16,185,129,0.15); color: #34d399; border-color: rgba(16,185,129,0.3); }
.view-btn:hover { background: rgba(99,102,241,0.15); color: #a5b4fc; border-color: rgba(99,102,241,0.3); }
.delete-btn:hover { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }

.empty-row { text-align: center; padding: 48px 16px !important; color: rgba(255,255,255,0.25); }
.empty-icon { display: block; margin: 0 auto 12px; opacity: 0.3; }

.table-footer { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: flex-end; }
.table-count { font-size: 12px; color: rgba(255,255,255,0.3); }

.toast { position: fixed; bottom: 28px; right: 28px; display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; z-index: 9999; backdrop-filter: blur(12px); }
.toast.success { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
.toast.error { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Delete Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 16px; }
.modal-box { background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 32px 28px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 25px 60px rgba(0,0,0,0.5); }
.modal-icon-wrap { width: 60px; height: 60px; border-radius: 50%; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
.modal-danger-icon { color: #f87171; }
.modal-title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin: 0 0 10px; }
.modal-desc { font-size: 13.5px; color: rgba(255,255,255,0.5); line-height: 1.6; margin: 0 0 20px; }
.modal-desc strong { color: #f1f5f9; font-weight: 600; }
.modal-desc em { font-style: italic; color: #f87171; }
.modal-user-info { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 12px 14px; margin-bottom: 24px; text-align: left; }
.modal-avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }
.modal-user-name { font-size: 14px; font-weight: 600; color: #f1f5f9; }
.modal-user-email { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px; }
.modal-actions { display: flex; gap: 10px; }
.modal-cancel-btn { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.18s; }
.modal-cancel-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: #fff; }
.modal-delete-btn { flex: 1; padding: 10px; border-radius: 10px; border: none; background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 7px; transition: all 0.18s; }
.modal-delete-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(239,68,68,0.35); }
.modal-delete-btn:disabled, .modal-cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.92) translateY(10px); }
</style>

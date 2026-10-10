<template>
  <div class="admin-page fade-in">
    <div class="page-header">
      <div>
        <h1 class="admin-page-title">Dashboard Overview</h1>
        <p class="page-subtitle">Welcome back, Admin. Here''s what''s happening.</p>
      </div>
      <div class="header-date">{{ todayDate }}</div>
    </div>

    <div v-if="isLoading" class="admin-loading">
      <Icon name="lucide:loader-2" class="spin-icon" /> Loading stats...
    </div>

    <div v-else>
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in statCards" :key="stat.label" @click="navigateTo(stat.path)" style="cursor: pointer;">
          <div class="stat-icon" :style="{ background: stat.iconBg }">
            <Icon :name="stat.icon" :size="20" :style="{ color: stat.iconColor }" />
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <div class="stat-trend" :class="stat.trendUp ? 'up' : 'down'">
            <Icon :name="stat.trendUp ? 'lucide:trending-up' : 'lucide:trending-down'" :size="14" />
            {{ stat.trend }}
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section-title">Quick Actions</div>
      <div class="quick-actions">
        <NuxtLink v-for="action in quickActions" :key="action.path" :to="action.path" class="quick-action-card">
          <div class="qa-icon" :style="{ background: action.bg }">
            <Icon :name="action.icon" :size="18" :style="{ color: action.color }" />
          </div>
          <div class="qa-label">{{ action.label }}</div>
          <Icon name="lucide:chevron-right" :size="14" class="qa-arrow" />
        </NuxtLink>
      </div>

      <!-- Recent Activity + Pending Actions -->
      <div class="two-col">
        <!-- Recent Transactions -->
        <div class="admin-widget">
          <div class="widget-header">
            <h3>Recent Transactions</h3>
            <NuxtLink to="/admin/transactions" class="widget-link">View All</NuxtLink>
          </div>
          <div class="activity-list">
            <div v-for="tx in recentTransactions" :key="tx.id" class="activity-item">
              <div class="activity-icon" :class="tx.type">
                <Icon :name="tx.type === 'deposit' ? 'lucide:download' : tx.type === 'withdrawal' ? 'lucide:upload' : 'lucide:arrow-right'" :size="14" />
              </div>
              <div class="activity-body">
                <div class="activity-title">{{ tx.label }}</div>
                <div class="activity-sub">{{ tx.time }}</div>
              </div>
              <div class="activity-amount" :class="tx.type === 'deposit' ? 'positive' : 'negative'">${{ tx.amount }}</div>
            </div>
          </div>
        </div>

        <!-- Pending Items -->
        <div class="admin-widget">
          <div class="widget-header">
            <h3>Pending Actions</h3>
          </div>
          <div class="pending-list">
            <div v-for="item in pendingItems" :key="item.label" class="pending-item">
              <div class="pending-icon">
                <Icon :name="item.icon" :size="15" />
              </div>
              <div class="pending-body">
                <div class="pending-title">{{ item.count }} {{ item.label }}</div>
                <div class="pending-sub">{{ item.sub }}</div>
              </div>
              <NuxtLink :to="item.path" class="pending-btn">Review</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Admin Dashboard | Tavrix Bank' })

const isLoading = ref(true)
const auth = useAuth()

const todayDate = computed(() => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

const statCards = ref([
  { label: 'Total Users', value: '0', icon: 'lucide:users', iconBg: 'rgba(99,102,241,0.15)', iconColor: '#818cf8', trend: 'Registered users', trendUp: true, path: '/admin/users' },
  { label: 'Total Transactions', value: '0', icon: 'lucide:arrow-left-right', iconBg: 'rgba(16,185,129,0.12)', iconColor: '#34d399', trend: 'System total', trendUp: true, path: '/admin/transactions' },
  { label: 'Pending KYC', value: '0', icon: 'lucide:shield-alert', iconBg: 'rgba(245,158,11,0.12)', iconColor: '#fbbf24', trend: 'Awaiting review', trendUp: false, path: '/admin/kyc' },
  { label: 'Active Loans', value: '0', icon: 'lucide:hand-coins', iconBg: 'rgba(59,130,246,0.12)', iconColor: '#60a5fa', trend: 'Applications', trendUp: true, path: '/admin/loans' },
  { label: 'Total Volume', value: '$0.00', icon: 'lucide:dollar-sign', iconBg: 'rgba(16,185,129,0.12)', iconColor: '#34d399', trend: 'Total volume', trendUp: true, path: '/admin/transactions' },
  { label: 'Pending Withdrawals', value: '0', icon: 'lucide:clock', iconBg: 'rgba(239,68,68,0.12)', iconColor: '#f87171', trend: 'Needs review', trendUp: false, path: '/admin/transactions' },
])

const quickActions = [
  { label: 'KYC Approvals', path: '/admin/kyc', icon: 'lucide:shield-check', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  { label: 'Loan Requests', path: '/admin/loans', icon: 'lucide:hand-coins', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  { label: 'Transfers', path: '/admin/transfers', icon: 'lucide:send', bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  { label: 'Deposits', path: '/admin/deposits', icon: 'lucide:download', bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  { label: 'Virtual Cards', path: '/admin/cards', icon: 'lucide:credit-card', bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
  { label: 'Notifications', path: '/admin/notifications', icon: 'lucide:megaphone', bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
]

const recentTransactions = ref<any[]>([])

const pendingItems = ref([
  { count: 0, label: 'KYC Submissions', sub: 'Awaiting document review', icon: 'lucide:shield-alert', path: '/admin/kyc' },
  { count: 0, label: 'Pending Withdrawals', sub: 'Require manual approval', icon: 'lucide:upload', path: '/admin/transactions' },
  { count: 0, label: 'Loan Applications', sub: 'Ready for decision', icon: 'lucide:hand-coins', path: '/admin/loans' },
])

onMounted(async () => {
  try {
    const res = await auth.apiCall<any>('/admin/dashboard', 'GET')
    const d = res.data?.data?.data ?? res.data?.data ?? res.data
    if (d && typeof d === 'object') {
      if (statCards.value[0]) statCards.value[0].value = String(d.total_users ?? 0)
      if (statCards.value[1]) statCards.value[1].value = String(d.total_transactions ?? 0)
      if (statCards.value[2]) statCards.value[2].value = String(d.pending_kyc ?? 0)
      if (statCards.value[3]) statCards.value[3].value = String(d.active_loans ?? 0)
      if (statCards.value[4]) statCards.value[4].value = `$${Number(d.total_volume || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      if (statCards.value[5]) statCards.value[5].value = String(d.pending_withdrawals ?? 0)

      if (pendingItems.value[0]) pendingItems.value[0].count = d.pending_kyc ?? 0
      if (pendingItems.value[1]) pendingItems.value[1].count = d.pending_withdrawals ?? 0
      if (pendingItems.value[2]) pendingItems.value[2].count = d.active_loans ?? 0
    }
  } catch (err) {
    console.error('Failed to fetch dashboard stats:', err)
  }

  try {
    const txRes = await auth.apiCall<any>('/admin/transactions', 'GET')
    const rawTx = txRes.data?.data?.data ?? txRes.data?.data ?? txRes.data
    if (Array.isArray(rawTx)) {
      recentTransactions.value = rawTx.slice(0, 4).map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        label: `${tx.type === 'deposit' ? 'Deposit' : tx.type === 'withdrawal' ? 'Withdrawal' : 'Transfer'} - ${tx.reference}`,
        amount: Number(tx.amount).toFixed(2),
        time: new Date(tx.created_at || tx.createdAt).toLocaleDateString()
      }))
    }
  } catch (err) {
    console.error('Failed to fetch recent transactions:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.admin-page { animation: fadeIn 0.4s ease-out; color: #f8fafc; }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.admin-page-title { font-size: 26px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em; }
.page-subtitle { font-size: 14px; color: rgba(255,255,255,0.4); margin-top: 4px; }
.header-date { font-size: 13px; color: rgba(255,255,255,0.3); padding: 6px 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; }

.admin-loading { padding:40px; text-align:center; color:#94a3b8; display:flex; align-items:center; justify-content:center; gap:10px; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-bottom: 28px; }
.stat-card { background: rgba(13,20,36,0.9); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; display: flex; align-items: flex-start; gap: 14px; transition: border-color 0.2s; }
.stat-card:hover { border-color: rgba(255,255,255,0.14); }
.stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-body { flex: 1; }
.stat-value { font-size: 24px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.03em; }
.stat-label { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 2px; }
.stat-trend { font-size: 11px; font-weight: 500; display: flex; align-items: center; gap: 4px; margin-top: 8px; white-space: nowrap; }
.stat-trend.up { color: #34d399; }
.stat-trend.down { color: #fbbf24; }

/* Quick Actions */
.section-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 12px; }
.quick-actions { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 28px; }
.quick-action-card { display: flex; align-items: center; gap: 10px; padding: 14px; background: rgba(13,20,36,0.9); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; text-decoration: none; color: #f1f5f9; font-size: 13.5px; font-weight: 500; transition: all 0.18s; }
.quick-action-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); transform: translateY(-1px); }
.qa-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.qa-label { flex: 1; }
.qa-arrow { color: rgba(255,255,255,0.25); }

/* Two col */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }

.admin-widget { background: rgba(13,20,36,0.9); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; }
.widget-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.widget-header h3 { font-size: 15px; font-weight: 600; color: #f1f5f9; }
.widget-link { font-size: 13px; color: #818cf8; text-decoration: none; transition: color 0.2s; }
.widget-link:hover { color: #a5b4fc; }

.activity-list { display: flex; flex-direction: column; gap: 12px; }
.activity-item { display: flex; align-items: center; gap: 12px; }
.activity-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.activity-icon.deposit { background: rgba(16,185,129,0.15); color: #34d399; }
.activity-icon.withdrawal { background: rgba(239,68,68,0.15); color: #f87171; }
.activity-icon.transfer { background: rgba(99,102,241,0.15); color: #818cf8; }
.activity-body { flex: 1; }
.activity-title { font-size: 13.5px; color: #f1f5f9; font-weight: 500; }
.activity-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 1px; }
.activity-amount { font-size: 14px; font-weight: 600; }
.activity-amount.positive { color: #34d399; }
.activity-amount.negative { color: #f87171; }

.pending-list { display: flex; flex-direction: column; gap: 12px; }
.pending-item { display: flex; align-items: center; gap: 12px; }
.pending-icon { width: 32px; height: 32px; border-radius: 9px; background: rgba(245,158,11,0.12); color: #fbbf24; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pending-body { flex: 1; }
.pending-title { font-size: 13.5px; font-weight: 600; color: #f1f5f9; }
.pending-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 1px; }
.pending-btn { font-size: 12px; font-weight: 600; color: #818cf8; text-decoration: none; padding: 5px 12px; border: 1px solid rgba(99,102,241,0.3); border-radius: 7px; transition: all 0.18s; }
.pending-btn:hover { background: rgba(99,102,241,0.15); color: #a5b4fc; }

.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

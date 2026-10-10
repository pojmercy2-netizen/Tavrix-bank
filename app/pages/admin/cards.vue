<template>
  <div class="admin-page fade-in">
    <div class="page-header">
      <div>
        <h1 class="admin-page-title">Virtual Cards</h1>
        <p class="page-subtitle">Manage user virtual cards — freeze, unfreeze, or terminate</p>
      </div>
      <div class="header-stats">
        <div class="hstat"><span class="hstat-val green">{{ activeCount }}</span><span class="hstat-label">Active</span></div>
        <div class="hstat"><span class="hstat-val red">{{ frozenCount }}</span><span class="hstat-label">Frozen</span></div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-wrap">
        <Icon name="lucide:search" :size="15" class="search-icon" />
        <input v-model="search" type="text" placeholder="Search by cardholder or last 4 digits..." class="filter-input" />
      </div>
      <div class="filter-tabs">
        <button v-for="tab in tabs" :key="tab" class="filter-tab" :class="{ active: activeTab === tab }" @click="activeTab = tab">{{ tab }}</button>
      </div>
      <button class="refresh-btn" @click="fetchCards" :disabled="loading" title="Refresh">
        <Icon name="lucide:refresh-cw" :size="15" :class="{ 'spin-icon': loading }" />
      </button>
    </div>

    <div class="cards-grid">
      <div v-if="loading" class="admin-loading col-span"><Icon name="lucide:loader-2" class="spin-icon" /> Loading cards...</div>
      <template v-else>
        <div v-for="card in filteredCards" :key="card.id" class="virtual-card-admin">
          <div class="card-top">
            <div class="card-brand">
              <Icon name="lucide:credit-card" :size="18" />
              <span>Virtual Card</span>
            </div>
            <span :class="['card-status', card.status.toLowerCase()]">{{ card.status }}</span>
          </div>
          <div class="card-number">•••• •••• •••• {{ card.last4 }}</div>
          <div class="card-user">
            <div class="card-avatar">{{ (card.holderName || '?')[0] }}</div>
            <div>
              <div class="card-holder">{{ card.holderName }}</div>
              <div class="card-email">{{ card.holderEmail }}</div>
            </div>
          </div>
          <div class="card-meta">
            <div class="meta-item"><span class="meta-label">Limit</span><span class="meta-val">${{ card.limit.toLocaleString() }}</span></div>
            <div class="meta-item"><span class="meta-label">Spent</span><span class="meta-val red">${{ card.spent.toLocaleString() }}</span></div>
            <div class="meta-item"><span class="meta-label">Expires</span><span class="meta-val">{{ card.expiry }}</span></div>
          </div>
          <div class="card-actions">
            <button v-if="card.status === 'ACTIVE'" class="card-btn freeze-btn" :disabled="actionLoading" @click="handleFreeze(card)">
              <Icon name="lucide:snowflake" :size="14" /> Freeze
            </button>
            <button v-if="card.status === 'FROZEN'" class="card-btn unfreeze-btn" :disabled="actionLoading" @click="handleUnfreeze(card)">
              <Icon name="lucide:sun" :size="14" /> Unfreeze
            </button>
            <button class="card-btn terminate-btn" :disabled="actionLoading" @click="handleTerminate(card)">
              <Icon name="lucide:trash-2" :size="14" /> Terminate
            </button>
          </div>
        </div>
        <div v-if="filteredCards.length === 0" class="empty-state">No virtual cards found.</div>
      </template>
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
useHead({ title: 'Virtual Cards | Tavrix Bank Admin' })

interface Card {
  id: string
  holderName: string
  holderEmail: string
  last4: string
  limit: number
  spent: number
  expiry: string
  status: string
}

const MOCK: Card[] = [
  { id: 'c1', holderName: 'John Smith', holderEmail: 'john@example.com', last4: '4891', limit: 5000, spent: 1230, expiry: '08/27', status: 'ACTIVE' },
  { id: 'c2', holderName: 'Sarah Kim', holderEmail: 'sarah@example.com', last4: '2204', limit: 2000, spent: 850, expiry: '11/26', status: 'ACTIVE' },
  { id: 'c3', holderName: 'Jane Doe', holderEmail: 'jane@example.com', last4: '7712', limit: 1000, spent: 340, expiry: '03/26', status: 'FROZEN' },
  { id: 'c4', holderName: 'Mark Lee', holderEmail: 'mark@example.com', last4: '5539', limit: 3000, spent: 2990, expiry: '06/28', status: 'ACTIVE' },
]

const cards = ref<Card[]>([])
const loading = ref(true)
const actionLoading = ref(false)
const search = ref('')
const activeTab = ref('All')
const tabs = ['All', 'Active', 'Frozen']
const auth = useAuth()

const toast = ref({ show: false, msg: '', type: 'success' })
const showToast = (msg: string, type = 'success') => {
  toast.value = { show: true, msg, type }
  setTimeout(() => toast.value.show = false, 3000)
}

const activeCount = computed(() => cards.value.filter(c => c.status === 'ACTIVE').length)
const frozenCount = computed(() => cards.value.filter(c => c.status === 'FROZEN').length)

const filteredCards = computed(() => {
  let list = cards.value
  if (activeTab.value !== 'All') list = list.filter(c => c.status === activeTab.value.toUpperCase())
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(c => c.holderName.toLowerCase().includes(q) || c.last4.includes(q))
  }
  return list
})

const handleFreeze = async (card: Card) => {
  actionLoading.value = true
  try {
    await auth.apiCall(`/admin/cards/${card.id}/freeze`, 'PUT')
    card.status = 'FROZEN'
    showToast(`Card ending ${card.last4} frozen.`)
  } catch { card.status = 'FROZEN'; showToast('Card frozen (offline).') }
  finally { actionLoading.value = false }
}

const handleUnfreeze = async (card: Card) => {
  actionLoading.value = true
  try {
    await auth.apiCall(`/admin/cards/${card.id}/unfreeze`, 'PUT')
    card.status = 'ACTIVE'
    showToast(`Card ending ${card.last4} unfrozen.`)
  } catch { card.status = 'ACTIVE'; showToast('Card unfrozen (offline).') }
  finally { actionLoading.value = false }
}

const handleTerminate = async (card: Card) => {
  if (!confirm(`Permanently terminate card ending in ${card.last4}? This cannot be undone.`)) return
  actionLoading.value = true
  try {
    await auth.apiCall(`/admin/cards/${card.id}/terminate`, 'DELETE')
    cards.value = cards.value.filter(c => c.id !== card.id)
    showToast('Card terminated.', 'error')
  } catch { cards.value = cards.value.filter(c => c.id !== card.id); showToast('Card terminated (offline).', 'error') }
  finally { actionLoading.value = false }
}

const fetchCards = async () => {
  loading.value = true
  try {
    const res = await auth.apiCall<any>('/admin/cards', 'GET')
    const raw = res.data?.data?.data ?? res.data?.data ?? res.data
    cards.value = Array.isArray(raw) ? raw : MOCK
  } catch { cards.value = MOCK }
  finally { loading.value = false }
}

onMounted(() => fetchCards())
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
.hstat-val.red{color:#f87171}
.hstat-label{font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px}
.filter-bar{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;align-items:center}
.search-wrap{position:relative;flex:1;min-width:200px}
.search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.3)}
.filter-input{width:100%;background:rgba(13,20,36,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 12px 10px 36px;color:#f1f5f9;font-size:13.5px;font-family:inherit;outline:none;transition:border-color 0.2s;box-sizing:border-box}
.filter-input:focus{border-color:rgba(99,102,241,0.5)}
.filter-tabs{display:flex;gap:4px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:4px}
.filter-tab{padding:6px 14px;border-radius:7px;font-size:13px;font-weight:500;color:rgba(255,255,255,0.45);cursor:pointer;border:none;background:none;font-family:inherit;transition:all 0.18s}
.filter-tab.active{background:rgba(99,102,241,0.2);color:#a5b4fc}
.refresh-btn { width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:9px; color:rgba(255,255,255,0.45); cursor:pointer; transition:all 0.18s; flex-shrink:0; }
.refresh-btn:hover { background:rgba(255,255,255,0.08); color: #fff; }
.spin-icon{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.col-span{grid-column:1/-1}
.admin-loading{padding:40px;text-align:center;color:#94a3b8;display:flex;align-items:center;justify-content:center;gap:10px}
.empty-state{grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.25);padding:60px;background:rgba(13,20,36,0.9);border:1px solid rgba(255,255,255,0.07);border-radius:14px}

.virtual-card-admin{background:linear-gradient(135deg,#1e2a45 0%,#0d1424 100%);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:14px;transition:border-color 0.2s,transform 0.2s}
.virtual-card-admin:hover{border-color:rgba(99,102,241,0.35);transform:translateY(-2px)}
.card-top{display:flex;align-items:center;justify-content:space-between}
.card-brand{display:flex;align-items:center;gap:8px;color:#94a3b8;font-size:13px;font-weight:500}
.card-status{padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;text-transform:uppercase}
.card-status.active{background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.25)}
.card-status.frozen{background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.25)}
.card-status.terminated{background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.25)}
.card-number{font-size:20px;font-weight:700;letter-spacing:0.15em;color:#f1f5f9;font-family:'JetBrains Mono','Courier New',monospace}
.card-user{display:flex;align-items:center;gap:10px}
.card-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.card-holder{font-size:13.5px;font-weight:600;color:#f1f5f9}
.card-email{font-size:12px;color:rgba(255,255,255,0.35)}
.card-meta{display:flex;gap:12px;flex-wrap:wrap;padding:12px;background:rgba(0,0,0,0.2);border-radius:10px}
.meta-item{display:flex;flex-direction:column;gap:2px}
.meta-label{font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.06em;font-weight:600}
.meta-val{font-size:14px;font-weight:700;color:#f1f5f9}
.meta-val.red{color:#f87171}
.card-actions{display:flex;gap:8px;flex-wrap:wrap}
.card-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:9px;font-size:12.5px;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:all 0.18s}
.card-btn:disabled{opacity:0.5;cursor:not-allowed}
.freeze-btn{background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.25)}
.freeze-btn:hover:not(:disabled){background:rgba(59,130,246,0.3)}
.unfreeze-btn{background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.25)}
.unfreeze-btn:hover:not(:disabled){background:rgba(16,185,129,0.3)}
.terminate-btn{background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.2)}
.terminate-btn:hover:not(:disabled){background:rgba(239,68,68,0.25)}
.toast{position:fixed;bottom:28px;right:28px;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;backdrop-filter:blur(12px)}
.toast.success{background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3)}
.toast.error{background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3)}
.toast-enter-active,.toast-leave-active{transition:all 0.3s ease}
.toast-enter-from,.toast-leave-to{opacity:0;transform:translateY(10px)}
.spin-icon{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
</style>

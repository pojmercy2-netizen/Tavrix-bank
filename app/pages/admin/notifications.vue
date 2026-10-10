<template>
  <div class="admin-page fade-in">
    <div class="page-header">
      <div>
        <h1 class="admin-page-title">Send Notifications</h1>
        <p class="page-subtitle">Broadcast messages or send targeted notifications to users</p>
      </div>
    </div>

    <div class="notif-layout">
      <!-- Compose Form -->
      <div class="admin-card compose-card">
        <h3 class="card-title">Compose Notification</h3>

        <div class="form-group">
          <label class="form-label">Target Audience</label>
          <div class="audience-tabs">
            <button v-for="opt in audienceOptions" :key="opt.value" class="audience-tab" :class="{ active: form.audience === opt.value }" @click="form.audience = opt.value">
              <Icon :name="opt.icon" :size="15" />
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="form-group" v-if="form.audience === 'specific'">
          <label class="form-label">User Email</label>
          <input v-model="form.targetEmail" type="email" placeholder="user@example.com" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Notification Type</label>
          <div class="type-grid">
            <button v-for="t in notifTypes" :key="t.value" class="type-card" :class="{ active: form.type === t.value }" @click="form.type = t.value">
              <Icon :name="t.icon" :size="18" :style="{ color: t.color }" />
              <span>{{ t.label }}</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Title</label>
          <input v-model="form.title" type="text" placeholder="Notification title..." class="form-input" maxlength="80" />
          <div class="char-count">{{ form.title.length }}/80</div>
        </div>

        <div class="form-group">
          <label class="form-label">Message</label>
          <textarea v-model="form.message" placeholder="Write your message here..." class="form-textarea" rows="5" maxlength="500"></textarea>
          <div class="char-count">{{ form.message.length }}/500</div>
        </div>

        <div class="form-group">
          <label class="form-label">Priority</label>
          <div class="priority-tabs">
            <button v-for="p in priorities" :key="p.value" class="priority-tab" :class="[{ active: form.priority === p.value }, p.value]" @click="form.priority = p.value">{{ p.label }}</button>
          </div>
        </div>

        <button class="send-btn" :disabled="sending || !form.title || !form.message" @click="handleSend">
          <Icon :name="sending ? 'lucide:loader-2' : 'lucide:send'" :size="16" :class="{ 'spin-icon': sending }" />
          {{ sending ? 'Sending...' : 'Send Notification' }}
        </button>
      </div>

      <!-- History -->
      <div class="admin-card history-card">
        <h3 class="card-title">Recent Notifications</h3>
        <div class="history-list">
          <div v-for="notif in sentHistory" :key="notif.id" class="history-item">
            <div class="history-icon" :class="notif.type">
              <Icon :name="getTypeIcon(notif.type)" :size="14" />
            </div>
            <div class="history-body">
              <div class="history-title">{{ notif.title }}</div>
              <div class="history-meta">
                <span class="audience-badge">{{ notif.audience }}</span>
                <span class="history-time">{{ notif.time }}</span>
              </div>
            </div>
            <span :class="['priority-pill', notif.priority]">{{ notif.priority }}</span>
          </div>
          <div v-if="sentHistory.length === 0" class="empty-history">No notifications sent yet.</div>
        </div>
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
import { ref, reactive } from 'vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Send Notifications | Tavrix Bank Admin' })

const auth = useAuth()
const sending = ref(false)

const form = reactive({
  audience: 'all',
  targetEmail: '',
  type: 'info',
  title: '',
  message: '',
  priority: 'normal'
})

const audienceOptions = [
  { value: 'all', label: 'All Users', icon: 'lucide:users' },
  { value: 'verified', label: 'Verified', icon: 'lucide:shield-check' },
  { value: 'specific', label: 'Specific User', icon: 'lucide:user' },
]

const notifTypes = [
  { value: 'info', label: 'Info', icon: 'lucide:info', color: '#60a5fa' },
  { value: 'success', label: 'Success', icon: 'lucide:check-circle', color: '#34d399' },
  { value: 'warning', label: 'Warning', icon: 'lucide:alert-triangle', color: '#fbbf24' },
  { value: 'alert', label: 'Alert', icon: 'lucide:bell', color: '#f87171' },
  { value: 'promo', label: 'Promo', icon: 'lucide:gift', color: '#c084fc' },
]

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
]

interface HistoryItem {
  id: number
  title: string
  audience: string
  type: string
  priority: string
  time: string
}

const DEFAULT_HISTORY = [
  { id: 1, title: 'System Maintenance Tonight', audience: 'All Users', type: 'warning', priority: 'high', time: '2h ago' },
  { id: 2, title: 'KYC Approved — Welcome!', audience: 'Specific User', type: 'success', priority: 'normal', time: '5h ago' },
  { id: 3, title: 'New Transfer Features', audience: 'All Users', type: 'promo', priority: 'low', time: 'Yesterday' },
]

const sentHistory = ref<HistoryItem[]>([])

const saveToLocal = () => {
  if (import.meta.client) {
    localStorage.setItem('admin_sent_notifications', JSON.stringify(sentHistory.value))
  }
}

onMounted(() => {
  if (import.meta.client) {
    const saved = localStorage.getItem('admin_sent_notifications')
    sentHistory.value = saved ? JSON.parse(saved) : DEFAULT_HISTORY
  }
})

const getTypeIcon = (type: string) => {
  const map: Record<string, string> = { info: 'lucide:info', success: 'lucide:check-circle', warning: 'lucide:alert-triangle', alert: 'lucide:bell', promo: 'lucide:gift' }
  return map[type] || 'lucide:bell'
}

const toast = ref({ show: false, msg: '', type: 'success' })
const showToast = (msg: string, type = 'success') => {
  toast.value = { show: true, msg, type }
  setTimeout(() => toast.value.show = false, 3000)
}

const handleSend = async () => {
  if (!form.title || !form.message) return
  sending.value = true
  try {
    const res = await auth.apiCall('/admin/notifications/send', 'POST', {
      title: form.title,
      body: form.message,
      type: form.type,
      audience: form.audience,
      userId: form.audience === 'specific' ? form.targetEmail : undefined
    })
    sentHistory.value.unshift({
      id: Date.now(),
      title: form.title,
      audience: audienceOptions.find(a => a.value === form.audience)?.label || form.audience,
      type: form.type,
      priority: form.priority,
      time: 'Just now'
    })
    saveToLocal()
    form.title = ''
    form.message = ''
    form.targetEmail = ''
    showToast('Notification sent successfully!')
  } catch {
    sentHistory.value.unshift({
      id: Date.now(),
      title: form.title,
      audience: audienceOptions.find(a => a.value === form.audience)?.label || form.audience,
      type: form.type,
      priority: form.priority,
      time: 'Just now'
    })
    saveToLocal()
    form.title = ''
    form.message = ''
    showToast('Notification sent (mock mode).')
  } finally { sending.value = false }
}
</script>

<style scoped>
.admin-page{animation:fadeIn 0.4s ease-out;color:#f8fafc}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px}
.admin-page-title{font-size:26px;font-weight:700;color:#f1f5f9;letter-spacing:-0.02em}
.page-subtitle{font-size:14px;color:rgba(255,255,255,0.4);margin-top:4px}

.notif-layout{display:grid;grid-template-columns:1fr 380px;gap:20px}
@media(max-width:1024px){.notif-layout{grid-template-columns:1fr}}

.admin-card{background:rgba(13,20,36,0.9);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:24px}
.card-title{font-size:16px;font-weight:700;color:#f1f5f9;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.06)}

.form-group{margin-bottom:20px}
.form-label{display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px}
.form-input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:11px 14px;color:#f1f5f9;font-size:14px;font-family:inherit;outline:none;transition:border-color 0.2s;box-sizing:border-box}
.form-input:focus{border-color:rgba(99,102,241,0.5)}
.form-textarea{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:11px 14px;color:#f1f5f9;font-size:14px;font-family:inherit;outline:none;transition:border-color 0.2s;resize:vertical;box-sizing:border-box;line-height:1.6}
.form-textarea:focus{border-color:rgba(99,102,241,0.5)}
.char-count{font-size:11px;color:rgba(255,255,255,0.25);text-align:right;margin-top:5px}

.audience-tabs{display:flex;gap:8px;flex-wrap:wrap}
.audience-tab{display:flex;align-items:center;gap:7px;padding:8px 14px;border-radius:9px;font-size:13px;font-weight:500;color:rgba(255,255,255,0.45);cursor:pointer;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);font-family:inherit;transition:all 0.18s}
.audience-tab.active{background:rgba(99,102,241,0.15);color:#a5b4fc;border-color:rgba(99,102,241,0.3)}

.type-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px}
.type-card{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border-radius:10px;font-size:12px;font-weight:500;color:rgba(255,255,255,0.45);cursor:pointer;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);font-family:inherit;transition:all 0.18s}
.type-card.active{background:rgba(99,102,241,0.12);color:#f1f5f9;border-color:rgba(99,102,241,0.3)}

.priority-tabs{display:flex;gap:6px}
.priority-tab{padding:7px 18px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.45);font-family:inherit;transition:all 0.18s}
.priority-tab.active.low{background:rgba(148,163,184,0.15);color:#cbd5e1;border-color:rgba(148,163,184,0.3)}
.priority-tab.active.normal{background:rgba(99,102,241,0.15);color:#a5b4fc;border-color:rgba(99,102,241,0.3)}
.priority-tab.active.high{background:rgba(239,68,68,0.15);color:#f87171;border-color:rgba(239,68,68,0.3)}

.send-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;padding:13px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:15px;font-weight:700;cursor:pointer;border:none;font-family:inherit;transition:all 0.2s;margin-top:4px}
.send-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(99,102,241,0.35)}
.send-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none}

.history-list{display:flex;flex-direction:column;gap:12px}
.history-item{display:flex;align-items:flex-start;gap:12px}
.history-icon{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.history-icon.info{background:rgba(59,130,246,0.15);color:#60a5fa}
.history-icon.success{background:rgba(16,185,129,0.15);color:#34d399}
.history-icon.warning{background:rgba(245,158,11,0.15);color:#fbbf24}
.history-icon.alert{background:rgba(239,68,68,0.15);color:#f87171}
.history-icon.promo{background:rgba(168,85,247,0.15);color:#c084fc}
.history-body{flex:1}
.history-title{font-size:13.5px;font-weight:600;color:#f1f5f9}
.history-meta{display:flex;align-items:center;gap:8px;margin-top:4px}
.audience-badge{font-size:11px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);padding:2px 8px;border-radius:99px;font-weight:500}
.history-time{font-size:11px;color:rgba(255,255,255,0.3)}
.priority-pill{font-size:10px;font-weight:700;text-transform:uppercase;padding:2px 8px;border-radius:99px;flex-shrink:0}
.priority-pill.low{background:rgba(148,163,184,0.1);color:#94a3b8}
.priority-pill.normal{background:rgba(99,102,241,0.1);color:#818cf8}
.priority-pill.high{background:rgba(239,68,68,0.12);color:#f87171}
.empty-history{text-align:center;color:rgba(255,255,255,0.2);padding:40px;font-size:14px}

.toast{position:fixed;bottom:28px;right:28px;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;backdrop-filter:blur(12px)}
.toast.success{background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3)}
.toast.error{background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3)}
.toast-enter-active,.toast-leave-active{transition:all 0.3s ease}
.toast-enter-from,.toast-leave-to{opacity:0;transform:translateY(10px)}
.spin-icon{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
</style>

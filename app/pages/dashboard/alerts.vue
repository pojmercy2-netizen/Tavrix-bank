<template>
  <div class="alerts-page">
    <!-- Page Header -->
    <div class="alerts-header">
      <div class="alerts-header-left">
        <h2 class="alerts-title">
          Notifications
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
        </h2>
        <p class="alerts-subtitle">Messages and alerts from Tavrix Bank.</p>
      </div>
      <div class="alerts-header-actions">
        <button class="filter-btn" :class="{ active: filter === 'all' }" @click="filter = 'all'">All</button>
        <button class="filter-btn" :class="{ active: filter === 'unread' }" @click="filter = 'unread'">
          Unread
          <span v-if="unreadCount > 0" class="filter-count">{{ unreadCount }}</span>
        </button>
        <button
          v-if="unreadCount > 0"
          class="mark-all-btn"
          :disabled="markingAll"
          @click="markAllRead"
        >
          <Icon :name="markingAll ? 'lucide:loader-2' : 'lucide:check-check'" :size="14" :class="{ 'spin-icon': markingAll }" />
          Mark all read
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p>Loading notifications…</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredAlerts.length === 0" class="state-box">
      <div class="empty-icon">
        <Icon name="lucide:bell-off" :size="40" />
      </div>
      <h3>{{ filter === 'unread' ? 'No unread notifications' : 'No notifications yet' }}</h3>
      <p>{{ filter === 'unread' ? 'You\'re all caught up!' : 'When Tavrix Bank sends you a message, it will appear here.' }}</p>
      <button v-if="filter === 'unread'" class="view-all-btn" @click="filter = 'all'">View all notifications</button>
    </div>

    <!-- Notification List -->
    <div v-else class="notif-list">
      <TransitionGroup name="notif-item">
        <div
          v-for="notif in filteredAlerts"
          :key="notif.id"
          class="notif-card"
          :class="{ unread: notif.unread, [notif.type]: true }"
          @click="openDetail(notif)"
        >
          <div class="notif-icon-wrap" :class="notif.type">
            <Icon :name="notif.icon" :size="18" />
          </div>

          <div class="notif-body">
            <div class="notif-top">
              <span class="notif-type-label" :class="notif.type">{{ typeLabel(notif.type) }}</span>
              <span class="notif-time">{{ notif.time }}</span>
            </div>
            <div class="notif-title">{{ notif.title }}</div>
            <div class="notif-preview">{{ notif.body }}</div>
          </div>

          <div class="notif-right">
            <span v-if="notif.unread" class="dot-unread"></span>
            <Icon name="lucide:chevron-right" :size="16" class="chevron" />
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Detail Slide-Over -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="selected" class="detail-overlay" @click.self="closeDetail"></div>
      </Transition>
      <Transition name="slide-panel">
        <div v-if="selected" class="detail-panel">
          <div class="detail-header">
            <div class="detail-icon-wrap" :class="selected.type">
              <Icon :name="selected.icon" :size="22" />
            </div>
            <div class="detail-header-text">
              <span class="detail-type-label" :class="selected.type">{{ typeLabel(selected.type) }}</span>
              <span class="detail-time">{{ selected.time }}</span>
            </div>
            <button class="close-btn" @click="closeDetail" aria-label="Close">
              <Icon name="lucide:x" :size="18" />
            </button>
          </div>

          <h3 class="detail-title">{{ selected.title }}</h3>
          <p class="detail-body">{{ selected.body }}</p>

          <div class="detail-footer">
            <button class="detail-close-btn" @click="closeDetail">Close</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Notifications | Tavrix Bank' })

const auth = useAuth()

/* ------------------------------------------------------------------ types */
interface Notif {
  id: string
  title: string
  body: string
  type: string
  icon: string
  time: string
  unread: boolean
}

/* ------------------------------------------------------------------ state */
const alerts = ref<Notif[]>([])
const loading = ref(true)
const markingAll = ref(false)
const filter = ref<'all' | 'unread'>('all')
const selected = ref<Notif | null>(null)

/* --------------------------------------------------------------- computed */
const unreadCount = computed(() => alerts.value.filter(a => a.unread).length)
const filteredAlerts = computed(() =>
  filter.value === 'unread' ? alerts.value.filter(a => a.unread) : alerts.value
)

/* ---------------------------------------------------------------- helpers */
const typeConfig: Record<string, { icon: string }> = {
  info:    { icon: 'lucide:info' },
  success: { icon: 'lucide:check-circle-2' },
  warning: { icon: 'lucide:alert-triangle' },
  alert:   { icon: 'lucide:bell-ring' },
  error:   { icon: 'lucide:shield-alert' },
  promo:   { icon: 'lucide:gift' },
}

const typeLabel = (type: string) => {
  const labels: Record<string, string> = {
    info: 'Information', success: 'Success', warning: 'Warning',
    alert: 'Alert', error: 'Security', promo: 'Promotion'
  }
  return labels[type] ?? type.toUpperCase()
}

const mapNotif = (n: any): Notif => {
  const cfg = typeConfig[n.type] ?? typeConfig.info
  return {
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type ?? 'info',
    icon: cfg.icon,
    unread: !n.isRead && !n.is_read,
    time: new Date(n.created_at || n.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }
}

/* -------------------------------------------------------------------- API */
const loadNotifications = async () => {
  try {
    const res = await auth.apiCall<any>('/dashboard/notifications', 'GET')
    if (res?.success && res?.data) {
      const list: any[] = Array.isArray(res.data) ? res.data : res.data?.data ?? []
      alerts.value = list.map(mapNotif)
    }
  } catch { /* silent */ }
  finally { loading.value = false }
}

const markAllRead = async () => {
  if (markingAll.value) return
  markingAll.value = true
  try {
    await auth.apiCall<any>('/dashboard/notifications/read-all', 'PUT')
    alerts.value = alerts.value.map(a => ({ ...a, unread: false }))
    if (import.meta.client) {
      window.dispatchEvent(new CustomEvent('notifications:updated'))
    }
  } catch { /* silent */ }
  finally { markingAll.value = false }
}

const openDetail = async (notif: Notif) => {
  selected.value = notif
  if (notif.unread) {
    notif.unread = false
    try {
      await auth.apiCall<any>(`/dashboard/notifications/${notif.id}/read`, 'PUT')
      if (import.meta.client) {
        window.dispatchEvent(new CustomEvent('notifications:updated'))
      }
    } catch { /* silent */ }
  }
}

const closeDetail = () => { selected.value = null }

/* ------------------------------------------------- polling every 60s */
let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await loadNotifications()
  pollTimer = setInterval(loadNotifications, 60_000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
/* ---------------------------------------------------------------- layout */
.alerts-page {
  max-width: 780px;
  margin: 0 auto;
}

.alerts-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 28px;
}

.alerts-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}

.dark .alerts-title { color: var(--color-text-light); }

.unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 99px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.alerts-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.alerts-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  transition: all 0.18s;
}

.filter-btn.active,
.filter-btn:hover {
  background: var(--color-secondary);
  color: #fff;
  border-color: var(--color-secondary);
}

.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 99px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

.mark-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  transition: all 0.18s;
}

.mark-all-btn:hover:not(:disabled) {
  background: rgba(16,185,129,0.1);
  border-color: #10b981;
  color: #10b981;
}

.mark-all-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* --------------------------------------------------------- loading / empty */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  gap: 14px;
  color: var(--color-text-muted);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-secondary);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(0,102,255,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary);
}

.state-box h3 {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-main);
}

.state-box p { font-size: 14px; max-width: 280px; }

.view-all-btn {
  margin-top: 4px;
  padding: 9px 20px;
  border-radius: 99px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: var(--color-secondary);
  color: #fff;
  border: none;
  transition: opacity 0.18s;
}

.view-all-btn:hover { opacity: 0.85; }

/* --------------------------------------------------------- notification list */
.notif-list { display: flex; flex-direction: column; gap: 10px; }

.notif-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
  position: relative;
  overflow: hidden;
}

.notif-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.notif-card.unread {
  border-color: rgba(99,102,241,0.25);
  background: rgba(99,102,241,0.03);
}

.dark .notif-card { background: var(--color-background-dark-card); border-color: var(--color-border-dark); }
.dark .notif-card.unread { background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.25); }

/* icon */
.notif-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.notif-icon-wrap.info    { background: rgba(14,165,233,0.12); color: #0ea5e9; }
.notif-icon-wrap.success { background: rgba(16,185,129,0.12); color: #10b981; }
.notif-icon-wrap.warning { background: rgba(245,158,11,0.12); color: #f59e0b; }
.notif-icon-wrap.alert   { background: rgba(239,68,68,0.12);  color: #ef4444; }
.notif-icon-wrap.error   { background: rgba(239,68,68,0.12);  color: #ef4444; }
.notif-icon-wrap.promo   { background: rgba(168,85,247,0.12); color: #a855f7; }

/* body */
.notif-body { flex: 1; min-width: 0; }

.notif-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.notif-type-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  border-radius: 99px;
}
.notif-type-label.info    { background: rgba(14,165,233,0.1);  color: #0ea5e9; }
.notif-type-label.success { background: rgba(16,185,129,0.1);  color: #10b981; }
.notif-type-label.warning { background: rgba(245,158,11,0.1);  color: #f59e0b; }
.notif-type-label.alert   { background: rgba(239,68,68,0.1);   color: #ef4444; }
.notif-type-label.error   { background: rgba(239,68,68,0.1);   color: #ef4444; }
.notif-type-label.promo   { background: rgba(168,85,247,0.1);  color: #a855f7; }

.notif-time { font-size: 11px; color: var(--color-text-muted); margin-left: auto; }

.notif-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .notif-title { color: var(--color-text-light); }

.notif-preview {
  font-size: 13px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

/* right col */
.notif-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dot-unread {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 6px rgba(99,102,241,0.6);
}

.chevron { color: var(--color-text-muted); }

/* ------------------------------------------------------- detail panel */
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(3px);
  z-index: 1000;
}

.detail-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 420px;
  max-width: 100vw;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  z-index: 1001;
  padding: 32px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: -12px 0 48px rgba(0,0,0,0.15);
}

.dark .detail-panel {
  background: #0f172a;
  border-color: rgba(255,255,255,0.08);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.detail-icon-wrap.info    { background: rgba(14,165,233,0.12);  color: #0ea5e9; }
.detail-icon-wrap.success { background: rgba(16,185,129,0.12);  color: #10b981; }
.detail-icon-wrap.warning { background: rgba(245,158,11,0.12);  color: #f59e0b; }
.detail-icon-wrap.alert   { background: rgba(239,68,68,0.12);   color: #ef4444; }
.detail-icon-wrap.error   { background: rgba(239,68,68,0.12);   color: #ef4444; }
.detail-icon-wrap.promo   { background: rgba(168,85,247,0.12);  color: #a855f7; }

.detail-header-text { flex: 1; }

.detail-type-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  border-radius: 99px;
  display: inline-block;
}
.detail-type-label.info    { background: rgba(14,165,233,0.1);  color: #0ea5e9; }
.detail-type-label.success { background: rgba(16,185,129,0.1);  color: #10b981; }
.detail-type-label.warning { background: rgba(245,158,11,0.1);  color: #f59e0b; }
.detail-type-label.alert   { background: rgba(239,68,68,0.1);   color: #ef4444; }
.detail-type-label.error   { background: rgba(239,68,68,0.1);   color: #ef4444; }
.detail-type-label.promo   { background: rgba(168,85,247,0.1);  color: #a855f7; }

.detail-time { display: block; font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s;
  flex-shrink: 0;
}
.close-btn:hover { background: rgba(239,68,68,0.08); color: #ef4444; border-color: rgba(239,68,68,0.2); }

.detail-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-main);
  line-height: 1.3;
}
.dark .detail-title { color: var(--color-text-light); }

.detail-body {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.7;
}
.dark .detail-body { color: #94a3b8; }

.detail-footer { margin-top: auto; }

.detail-close-btn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
}
.detail-close-btn:hover { background: rgba(0,0,0,0.04); color: var(--color-text-main); }

/* --------------------------------------------------- transitions */
.notif-item-enter-active,
.notif-item-leave-active { transition: all 0.3s ease; }
.notif-item-enter-from,
.notif-item-leave-to { opacity: 0; transform: translateY(-8px); }

.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

.slide-panel-enter-active, .slide-panel-leave-active { transition: transform 0.3s cubic-bezier(.4,0,.2,1); }
.slide-panel-enter-from, .slide-panel-leave-to { transform: translateX(100%); }

@keyframes spin { to { transform: rotate(360deg); } }
.spin-icon { animation: spin 0.9s linear infinite; }

@media (max-width: 600px) {
  .alerts-header { flex-direction: column; }
  .detail-panel { width: 100vw; }
}
</style>

<template>
  <div class="dashboard-layout" :class="{ 'sidebar-open': isSidebarOpen }">
    <!-- Mobile overlay -->
    <div
      v-if="isSidebarOpen"
      class="sidebar-overlay"
      @click="closeSidebar"
    />

    <!-- Sidebar -->
    <aside class="dashboard-sidebar" :class="{ open: isSidebarOpen }">
      <div class="sidebar-header">
        <NuxtLink to="/" class="sidebar-logo">
          <img src="/logo.png" alt="Tavrix Bank Logo" class="logo-img" />
        </NuxtLink>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="sidebar-link"
          :class="{ active: isActive(item.path, item.exact) }"
          @click="closeSidebar"
        >
          <Icon :name="item.icon" class="sidebar-icon" />
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="sidebar-badge">{{ item.badge }}</span>
        </NuxtLink>

        <button class="sidebar-link logout-btn" @click="handleLogout">
          <Icon name="lucide:log-out" class="sidebar-icon" />
          <span>Log Out</span>
        </button>
      </nav>

      <div class="sidebar-help">
        <span class="help-title">Need help?</span>
        <a href="tel:1-800-USA-BANK" class="help-link">
          <Icon name="lucide:phone" :size="16" />
          1-800-USA-BANK
        </a>
        <button class="help-link" @click="handleChat">
          <Icon name="lucide:message-square" :size="16" />
          Live chat
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="dashboard-main">
      <!-- Topbar -->
      <header class="dashboard-topbar">
        <div class="topbar-left">
          <button class="mobile-sidebar-toggle" @click="toggleSidebar" aria-label="Open menu">
            <Icon name="lucide:menu" :size="24" />
          </button>
          <div class="topbar-greeting desktop-only">
            <h1>{{ greeting }}, {{ firstName }}</h1>
            <p>Welcome back to your account.</p>
          </div>
        </div>

        <div class="topbar-logo-mobile">
          <NuxtLink to="/dashboard">
            <img src="/logo.png" alt="Auxtrusunion Bank Logo" class="mobile-logo-img" />
          </NuxtLink>
        </div>

        <div class="topbar-actions">

          <NuxtLink to="/dashboard/alerts" class="topbar-action-item bell-btn">
            <Icon name="lucide:bell" :size="20" class="topbar-icon" />
            <span v-if="unreadNotifCount > 0" class="bell-badge">{{ unreadNotifCount > 9 ? '9+' : unreadNotifCount }}</span>
          </NuxtLink>
          <NuxtLink to="/dashboard/settings" class="user-profile">
            <div class="user-avatar-circle">
              <Icon name="lucide:user" class="w-5 h-5 text-slate-400" />
            </div>
            <Icon name="lucide:chevron-down" :size="12" class="text-slate-400" />
            <span class="user-name desktop-only ml-1">{{ fullName }}</span>
          </NuxtLink>
          <button class="topbar-action-item logout-action desktop-only" @click="handleLogout" title="Log out">
            <Icon name="lucide:log-out" :size="20" class="topbar-icon" />
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="dashboard-content">
        <slot />
      </div>

      <!-- Footer -->
      <footer class="dashboard-footer">
        <div class="footer-left">
          © 2012 – {{ new Date().getFullYear() }} Tavrix Bank. All rights reserved.
        </div>
        <div class="footer-right">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
          <a href="#">Security</a>
          <span>Member FDIC</span>
        </div>
      </footer>
    </main>

    <!-- Mobile Bottom Navigation Bar -->
    <nav class="mobile-bottom-nav">
      <!-- Home Tab -->
      <NuxtLink 
        to="/dashboard" 
        class="bottom-nav-item" 
        :class="{ active: route.path === '/dashboard' }"
      >
        <div class="nav-icon-wrapper">
          <Icon name="lucide:home" class="w-5 h-5" />
        </div>
        <span>Home</span>
      </NuxtLink>

      <!-- Activity Tab -->
      <NuxtLink 
        to="/dashboard/accounts" 
        class="bottom-nav-item" 
        :class="{ active: route.path.startsWith('/dashboard/accounts') }"
      >
        <div class="nav-icon-wrapper">
          <Icon name="lucide:arrow-right-left" class="w-5 h-5" />
        </div>
        <span>Activity</span>
      </NuxtLink>

      <!-- Transfer Tab (Prominent central button) -->
      <div class="bottom-nav-item center-btn-item">
        <NuxtLink to="/dashboard/transfer" class="center-nav-btn">
          <Icon name="lucide:send" class="w-5 h-5 text-white" />
        </NuxtLink>
        <span>Transfer</span>
      </div>

      <!-- Cards Tab -->
      <NuxtLink 
        to="/dashboard/cards" 
        class="bottom-nav-item" 
        :class="{ active: route.path.startsWith('/dashboard/cards') }"
      >
        <div class="nav-icon-wrapper">
          <Icon name="lucide:credit-card" class="w-5 h-5" />
        </div>
        <span>Cards</span>
      </NuxtLink>

      <!-- Account Tab -->
      <NuxtLink 
        to="/dashboard/settings" 
        class="bottom-nav-item" 
        :class="{ active: route.path.startsWith('/dashboard/settings') }"
      >
        <div class="nav-icon-wrapper">
          <Icon name="lucide:user" class="w-5 h-5" />
        </div>
        <span>Account</span>
      </NuxtLink>
    </nav>
    <GTranslate />
    <WhatsAppWidget />
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
const route = useRoute()
const router = useRouter()
const isSidebarOpen = ref(false)

const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value; setBodyScroll(isSidebarOpen.value) }
const closeSidebar = () => { isSidebarOpen.value = false; setBodyScroll(false) }

const setBodyScroll = (locked: boolean) => {
  if (import.meta.client) {
    document.body.style.overflow = locked ? 'hidden' : ''
  }
}

const handleLogout = () => {
  if (import.meta.client) {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('user')
  }
  router.push('/login')
}

const handleChat = () => {
  closeSidebar()
  alert('Connecting to live chat agent...')
}

const fullName = ref('John Smith')
const firstName = computed(() => fullName.value.split(' ')[0])
const initials = computed(() =>
  fullName.value.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
)

/* ---- notification badge ---- */
const auth = useAuth()
const unreadNotifCount = ref(0)

const fetchUnreadCount = async () => {
  try {
    const res = await auth.apiCall<any>('/dashboard/notifications', 'GET')
    if (res?.success && res?.data) {
      const list: any[] = Array.isArray(res.data) ? res.data : res.data?.data ?? []
      unreadNotifCount.value = list.filter((n: any) => !n.isRead && !n.is_read).length
    }
  } catch { /* silent */ }
}

let notifPollTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  if (user?.fullName) {
    fullName.value = user.fullName
  }
  fetchUnreadCount()
  notifPollTimer = setInterval(fetchUnreadCount, 60_000)
  if (import.meta.client) {
    window.addEventListener('notifications:updated', fetchUnreadCount)
  }
})

onUnmounted(() => {
  if (notifPollTimer) clearInterval(notifPollTimer)
  if (import.meta.client) {
    window.removeEventListener('notifications:updated', fetchUnreadCount)
  }
})

const hour = new Date().getHours()
const greeting = computed(() => {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

interface NavItem {
  path: string
  label: string
  icon: string
  exact?: boolean
  badge?: string | number
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'lucide:home', exact: true },
  { path: '/dashboard/accounts', label: 'Accounts', icon: 'lucide:wallet-cards' },
  { path: '/dashboard/transactions', label: 'Transactions', icon: 'lucide:arrow-right-left' },
  { path: '/dashboard/cards', label: 'Cards', icon: 'lucide:credit-card' },
  { path: '/dashboard/transfer', label: 'Transfer & Pay', icon: 'lucide:arrow-right-left' },
  { path: '/dashboard/bill-pay', label: 'Bill Pay', icon: 'lucide:file-text' },
  { path: '/dashboard/deposits', label: 'Deposits', icon: 'lucide:banknote' },
  { path: '/dashboard/loans', label: 'Loans', icon: 'lucide:landmark' },

  { path: '/dashboard/alerts', label: 'Alerts', icon: 'lucide:bell' },
  { path: '/dashboard/settings', label: 'Settings', icon: 'lucide:settings' }
]

const isActive = (path: string, exact = false) => {
  if (exact) return route.path === path
  return route.path.startsWith(path)
}

// Clear scroll lock on navigation in case sidebar was open
watch(() => route.path, () => {
  closeSidebar()
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--color-background-page);
  position: relative;
}

@media (max-width: 1023px) {
  .dashboard-layout {
    height: auto;
    overflow: visible;
  }
}

/* Sidebar */
.dashboard-sidebar {
  width: 260px;
  height: 100vh;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow-y: auto;
  overflow-x: hidden;
}

.dashboard-sidebar.open {
  transform: translateX(0);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 49;
  backdrop-filter: blur(2px);
}

@media (min-width: 1024px) {
  .dashboard-sidebar {
    transform: translateX(0);
    position: sticky;
    top: 0;
    height: 100vh;
    flex-shrink: 0;
  }
  .sidebar-overlay { display: none; }
}

.sidebar-header {
  padding: 12px 12px 10px;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-surface);
}

.sidebar-logo {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 48px;
  width: auto;
  max-width: 180px;
  object-fit: contain;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-family: var(--font-sans);
}

.sidebar-link:hover {
  background: var(--color-background-page);
  color: var(--color-text-main);
}

.sidebar-link.active {
  background: rgba(0, 102, 255, 0.08);
  color: var(--color-secondary);
  border: 1px solid rgba(0, 102, 255, 0.2);
}

.sidebar-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar-badge {
  margin-left: auto;
  background: var(--color-secondary);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  min-width: 20px;
  text-align: center;
}

.logout-btn {
  margin-top: 8px;
  color: var(--color-text-muted);
}

.sidebar-help {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-faint);
  font-weight: 600;
}

.help-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 13px;
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: none;
  font-family: var(--font-sans);
  padding: 4px 0;
}
.help-link:hover { color: var(--color-text-main); }

/* Main Content */
.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
  height: 100vh;
}

@media (max-width: 1023px) {
  .dashboard-main {
    height: auto;
    overflow-y: visible;
    min-height: 100vh;
    padding-bottom: 80px; /* Space for bottom navigation bar */
  }
  .desktop-only {
    display: none !important;
  }
  .topbar-logo-mobile {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
  }
  .mobile-logo-img {
    height: 44px;
    width: auto;
    max-width: 180px;
    object-fit: contain;
    transition: all 0.2s ease;
  }
  @media (max-width: 640px) {
    .mobile-logo-img {
      height: 40px;
      max-width: 160px;
    }
  }
  @media (max-width: 400px) {
    .mobile-logo-img {
      height: 36px;
      max-width: 140px;
    }
  }

  /* ── Make topbar scroll with the page on mobile ── */
  .dashboard-topbar {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    width: 100%;
    z-index: 50;
  }
}

@media (min-width: 1024px) {
  .topbar-logo-mobile {
    display: none !important;
  }
}

/* Topbar */
.dashboard-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 40;
  gap: 16px;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.mobile-sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  color: var(--color-text-muted);
  transition: background 0.2s;
  flex-shrink: 0;
}
.mobile-sidebar-toggle:hover { background: var(--color-background-page); }

@media (min-width: 1024px) {
  .mobile-sidebar-toggle { display: none; }
}

.topbar-greeting h1 {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-main);
  white-space: nowrap;
}
.topbar-greeting p {
  font-size: 12px;
  color: var(--color-text-muted);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.topbar-action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: none;
  font-family: var(--font-sans);
  transition: all 0.2s;
  position: relative;
}
.topbar-action-item:hover {
  background: var(--color-background-page);
  color: var(--color-text-main);
}

.topbar-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--color-error);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .topbar-action-item span:not(.topbar-badge) { display: none; }
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;
  border: 1px solid var(--color-border);
}
.user-profile:hover { background: var(--color-background-page); }

.user-avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-main);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .user-info { display: none; }
  .topbar-greeting p { display: none; }
}

@media (max-width: 480px) {
  .logout-action { display: none; }
  .topbar-action-item { padding: 8px; }
  .dashboard-topbar { gap: 6px; }

  /* Shrink user profile button */
  .user-profile {
    padding: 4px 6px;
    gap: 4px;
    border-radius: 6px;
  }
  .user-avatar-circle {
    width: 26px;
    height: 26px;
  }
}

@media (max-width: 400px) {
  .topbar-greeting { display: none; }
}

.logout-action {
  display: flex;
  padding: 8px;
}

/* Content */
.dashboard-content {
  flex: 1;
  padding: 28px 24px;
}

@media (max-width: 1023px) {
  /* Push content below the fixed topbar - relative now, normal padding */
  .dashboard-content { padding-top: 24px; }
}

@media (max-width: 768px) {
  .dashboard-content { padding: 20px 16px; }
  .dashboard-topbar { padding: 12px 16px; }
}

/* Footer */
.dashboard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 12px;
  color: var(--color-text-muted);
  flex-wrap: wrap;
  gap: 8px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.footer-right a {
  color: var(--color-text-muted);
  text-decoration: none;
}
.footer-right a:hover { color: var(--color-secondary); }

@media (max-width: 640px) {
  .dashboard-footer { flex-direction: column; text-align: center; }
}
</style>

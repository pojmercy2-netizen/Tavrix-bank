<template>
  <div class="admin-layout">
    <!-- Overlay (mobile) -->
    <div v-if="isSidebarOpen && isMobile" class="sidebar-overlay" @click="closeSidebar" />

    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ open: isSidebarOpen, collapsed: !isSidebarOpen && !isMobile }">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <Icon name="lucide:zap" :size="18" />
        </div>
        <span v-if="isSidebarOpen || isMobile" class="logo-text">Tavrix <span class="logo-accent">Admin</span></span>
        <button class="sidebar-close mobile-only" @click="closeSidebar">
          <Icon name="lucide:x" :size="18" />
        </button>
      </div>

      <!-- Nav -->
      <nav class="admin-nav">
        <div v-for="group in navGroups" :key="group.label" class="nav-group">
          <div v-if="isSidebarOpen || isMobile" class="nav-group-label">{{ group.label }}</div>
          <NuxtLink
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            class="admin-nav-item"
            :class="{ active: isActive(item.path) }"
            :title="!isSidebarOpen && !isMobile ? item.label : ''"
            @click="isMobile && closeSidebar()"
          >
            <Icon :name="item.icon" class="nav-icon" />
            <span v-if="isSidebarOpen || isMobile" class="nav-label">{{ item.label }}</span>
            <span v-if="(isSidebarOpen || isMobile) && item.badge" class="nav-badge">{{ item.badge }}</span>
          </NuxtLink>
        </div>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <button class="admin-logout-btn" @click="handleLogout">
          <Icon name="lucide:log-out" class="nav-icon" />
          <span v-if="isSidebarOpen || isMobile">Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="admin-main">
      <!-- Topbar -->
      <header class="admin-topbar">
        <button class="toggle-btn" @click="toggleSidebar" title="Toggle Sidebar">
          <Icon :name="isSidebarOpen ? 'lucide:panel-left-close' : 'lucide:panel-left-open'" :size="20" />
        </button>

        <div class="topbar-breadcrumb">
          <span class="breadcrumb-root">Admin</span>
          <Icon name="lucide:chevron-right" :size="14" class="breadcrumb-sep" />
          <span class="breadcrumb-current">{{ currentPageLabel }}</span>
        </div>

        <div class="topbar-right">
          <button class="topbar-icon-btn" title="Send Notifications" @click="router.push('/admin/notifications')">
            <Icon name="lucide:bell" :size="18" />
            <span class="notif-dot" />
          </button>
          <div class="admin-profile-pill" @click="router.push('/admin/user-management')" title="User Management">
            <div class="admin-avatar">{{ adminInitial }}</div>
            <div class="admin-info">
              <div class="admin-name">{{ adminName }}</div>
              <div class="admin-role">{{ adminRole }}</div>
            </div>
          </div>
        </div>
      </header>

      <div class="admin-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const isSidebarOpen = ref(true)
const isMobile = ref(false)

const checkMobile = () => {
  if (!import.meta.client) return
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) isSidebarOpen.value = false
  else isSidebarOpen.value = true
}

const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
const closeSidebar = () => { isSidebarOpen.value = false }

const isActive = (path: string) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/admin', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
    ]
  },
  {
    label: 'User Management',
    items: [
      { path: '/admin/users', label: 'All Users', icon: 'lucide:users' },
      { path: '/admin/create-user', label: 'Create User', icon: 'lucide:user-plus' },
      { path: '/admin/user-management', label: 'Account Control', icon: 'lucide:user-cog' },
      { path: '/admin/kyc', label: 'KYC Approvals', icon: 'lucide:shield-check', badge: '3' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { path: '/admin/transactions', label: 'Transactions', icon: 'lucide:arrow-left-right' },
      { path: '/admin/deposits', label: 'Deposits', icon: 'lucide:download' },
      { path: '/admin/transfers', label: 'Transfers', icon: 'lucide:send' },
      { path: '/admin/loans', label: 'Loan Approvals', icon: 'lucide:hand-coins' },
      { path: '/admin/wallets', label: 'Wallet Addresses', icon: 'lucide:wallet' },
    ]
  },
  {
    label: 'Platform',
    items: [
      { path: '/admin/cards', label: 'Virtual Cards', icon: 'lucide:credit-card' },
      { path: '/admin/notifications', label: 'Notifications', icon: 'lucide:megaphone' },
      { path: '/admin/settings', label: 'Platform Settings', icon: 'lucide:settings' },
    ]
  },
]

const currentPageLabel = computed(() => {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.path === '/admin' && route.path === '/admin') return item.label
      if (item.path !== '/admin' && route.path.startsWith(item.path)) return item.label
    }
  }
  return 'Admin'
})

// Real admin user from localStorage
const adminName = ref('Admin User')
const adminRole = ref('Super Admin')
const adminInitial = computed(() => adminName.value?.[0]?.toUpperCase() || 'A')

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  const userData = localStorage.getItem('user')
  const token = localStorage.getItem('authToken')
  if (userData && token) {
    try {
      const user = JSON.parse(userData)
      // Populate real admin name in topbar
      adminName.value = user.fullName || user.full_name || 'Admin'
      adminRole.value = user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Admin'
      const isMockToken = token.startsWith('mock_token_')
      if (!isMockToken && !user.isAdmin && user.role !== 'admin' && user.role !== 'superadmin') {
        router.push('/dashboard')
      }
    } catch {
      router.push('/admin/login')
    }
  } else {
    router.push('/admin/login')
  }
})

onUnmounted(() => {
  if (import.meta.client) window.removeEventListener('resize', checkMobile)
})

const handleLogout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userId')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #0a0f1a;
  font-family: 'Inter', sans-serif;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 49;
  backdrop-filter: blur(2px);
}

.admin-sidebar {
  width: 240px;
  background: #0d1424;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
  flex-shrink: 0;
  z-index: 50;
}

.admin-sidebar.collapsed {
  width: 64px;
}

@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    width: 260px;
    transform: translateX(-110%);
    height: 100%;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  .admin-sidebar.open {
    transform: translateX(0);
  }
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  min-height: 64px;
}

.logo-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99,102,241,0.35);
}

.logo-text {
  font-size: 15px;
  font-weight: 700;
  color: #f1f5f9;
  white-space: nowrap;
  letter-spacing: -0.02em;
}

.logo-accent {
  background: linear-gradient(90deg, #6366f1, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-close {
  margin-left: auto;
  color: rgba(255,255,255,0.4);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: none;
}

@media (max-width: 768px) {
  .sidebar-close { display: flex; }
}

.admin-nav {
  flex: 1;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-group {
  margin-bottom: 6px;
}

.nav-group-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
  padding: 4px 10px 4px;
  white-space: nowrap;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 9px;
  color: rgba(255,255,255,0.5);
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.18s ease;
  position: relative;
  white-space: nowrap;
  border: 1px solid transparent;
}

.admin-nav-item:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.9);
}

.admin-nav-item.active {
  background: rgba(99,102,241,0.15);
  color: #a5b4fc;
  border-color: rgba(99,102,241,0.25);
}

.nav-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  background: rgba(239,68,68,0.2);
  color: #fca5a5;
  border: 1px solid rgba(239,68,68,0.3);
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 99px;
}

.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.admin-logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 9px;
  color: rgba(255,255,255,0.4);
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.18s;
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
  white-space: nowrap;
}

.admin-logout-btn:hover {
  background: rgba(239,68,68,0.12);
  color: #fca5a5;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
  height: 100vh;
  background: #0a0f1a;
}

.admin-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  height: 64px;
  background: #0d1424;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: sticky;
  top: 0;
  z-index: 40;
  flex-shrink: 0;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: rgba(255,255,255,0.45);
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.18s;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.9);
}

.topbar-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.breadcrumb-root {
  font-size: 13px;
  color: rgba(255,255,255,0.3);
  font-weight: 500;
}

.breadcrumb-sep {
  color: rgba(255,255,255,0.2);
}

.breadcrumb-current {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar-icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s;
}

.topbar-icon-btn:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}

.notif-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  border: 1.5px solid #0d1424;
}

.admin-profile-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 12px 5px 5px;
  border-radius: 99px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  cursor: pointer;
  transition: background 0.18s;
}

.admin-profile-pill:hover {
  background: rgba(255,255,255,0.07);
}

.admin-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.admin-info {
  display: flex;
  flex-direction: column;
}

.admin-name {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  line-height: 1.2;
}

.admin-role {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  line-height: 1.2;
}

.admin-content {
  flex: 1;
  padding: 28px 24px;
}

@media (max-width: 768px) {
  .admin-content { padding: 20px 16px; }
  .admin-topbar { padding: 0 16px; }
  .admin-info { display: none; }
}
</style>

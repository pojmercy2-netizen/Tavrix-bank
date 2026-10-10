<template>
  <nav class="navbar" :class="{ 'navbar-scrolled': scrolled }">
    <div class="navbar-container">

      <!-- Logo -->
      <NuxtLink to="/" class="navbar-logo" @click="closeMobileMenu">
        <img src="/logo.png" alt="Tavrix Bank" class="logo-img" />
      </NuxtLink>

      <!-- Desktop Nav Links -->
      <ul class="navbar-links desktop-only">
        <li v-for="link in navLinks" :key="link.label" class="nav-item">
          <a v-if="link.hash" class="nav-link" href="#" @click.prevent="scrollToSection(link.hash)">
            {{ link.label }}
          </a>
          <NuxtLink v-else :to="link.path" class="nav-link">
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>

      <!-- Desktop Actions -->
      <div class="navbar-actions desktop-only">
        <NuxtLink to="/login" class="btn navbar-login-btn">Log In</NuxtLink>
        <NuxtLink to="/register" class="btn btn-primary navbar-register-btn">Open Account</NuxtLink>
      </div>

      <!-- Mobile Right (theme + hamburger) -->
      <div class="mobile-right">
        <button
          class="mobile-menu-btn"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Toggle mobile menu"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <Icon v-if="isMobileMenuOpen" name="lucide:x" :size="24" />
          <Icon v-else name="lucide:menu" :size="24" />
        </button>
      </div>

      <!-- Mobile Overlay -->
      <div class="mobile-menu-overlay" :class="{ open: isMobileMenuOpen }">
        <div class="mobile-menu-content">
          <ul class="mobile-nav-links">
            <li v-for="link in navLinks" :key="link.label">
              <a v-if="link.hash" href="#" @click.prevent="scrollToSection(link.hash); closeMobileMenu()">
                {{ link.label }}
              </a>
              <NuxtLink v-else :to="link.path" @click="closeMobileMenu">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
          <div class="mobile-nav-actions">
            <NuxtLink to="/login" class="mobile-btn navbar-login-btn" @click="closeMobileMenu">Log In</NuxtLink>
            <NuxtLink to="/register" class="mobile-btn btn-primary" @click="closeMobileMenu">Open an Account</NuxtLink>
          </div>
        </div>
      </div>

    </div>
  </nav>
</template>

<script setup lang="ts">
const { y: scrollY } = useWindowScroll()
const scrolled = computed(() => scrollY.value > 100)
const isMobileMenuOpen = ref(false)
const closeMobileMenu = () => { isMobileMenuOpen.value = false }

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/', hash: 'services', label: 'Services' },
  { path: '/personal', label: 'Personal' },
  { path: '/business', label: 'Business' },
  { path: '/loans', label: 'Loans' },
  { path: '/investments', label: 'Investments' },
  { path: '/about', label: 'About' },
  { path: '/', hash: 'faq', label: 'FAQ' },
  { path: '/', hash: 'contact', label: 'Contact' }
]

const router = useRouter()
const route = useRoute()

const scrollToSection = (hash: string) => {
  closeMobileMenu()
  if (route.path === '/') {
    const el = document.getElementById(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    router.push({ path: '/', hash: `#${hash}` })
  }
}
</script>

<style scoped>
/* ── Theme Tokens ── */
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  transition: background 0.3s, box-shadow 0.3s, backdrop-filter 0.3s;

  --lc:   rgba(30, 41, 59, 0.82);
  --lh:   #0055e0;
  --lhbg: rgba(0, 85, 224, 0.07);
  --sbg:  rgba(255, 255, 255, 0.96);
  --bbr:  #0055e0;
  --bc:   #0055e0;
  --mob:  #ffffff;
}

/* ── Scrolled state ── */
.navbar-scrolled {
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
  animation: slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.navbar-scrolled .nav-link {
  color: rgba(30, 41, 59, 0.82) !important;
}

.navbar-scrolled .navbar-login-btn {
  color: #0055e0 !important;
  border-color: #0055e0 !important;
}

/* ── Container ── */
.navbar-container {
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 28px;
  height: 68px;
  display: flex;
  align-items: center;
}

/* ── Logo ── */
.navbar-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
  margin-right: 20px;
}
.logo-img {
  height: 52px;
  width: auto;
  max-width: 220px;
  object-fit: contain;
  display: block;
}

/* ── Desktop nav links ── */
.navbar-links {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1 1 0;
  min-width: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav-item { flex-shrink: 0; }
.nav-link {
  display: block;
  padding: 6px 10px;
  border-radius: 7px;
  color: var(--lc);
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  text-decoration: none;
  transition: color 0.16s, background 0.16s;
  line-height: 1;
}
.nav-link:hover {
  color: var(--lh);
  background: var(--lhbg);
}

/* ── Desktop actions ── */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 12px;
}
.navbar-login-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--bbr);
  color: var(--bc);
  background: transparent;
  font-size: 13.5px;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 8px;
  white-space: nowrap;
  text-decoration: none;
  transition: background 0.18s, border-color 0.18s;
  cursor: pointer;
  font-family: inherit;
}
.navbar-login-btn:hover { background: var(--lhbg); }
.navbar-register-btn {
  font-size: 13.5px;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 8px;
  white-space: nowrap;
}

/* ── Mobile controls ── */
.mobile-right {
  display: none;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}
.mobile-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  color: var(--lc);
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.18s;
}
.mobile-menu-btn:hover { background: var(--lhbg); }

/* ── Mobile overlay ── */
.mobile-menu-overlay {
  display: none;
  position: fixed;
  top: 68px; left: 0; right: 0; bottom: 0;
  background: var(--mob);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow-y: auto;
  z-index: 999;
}
.mobile-menu-overlay.open { transform: translateX(0); }

.mobile-menu-content {
  padding: 20px 18px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.mobile-nav-links {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 2px;
}
.mobile-nav-links li a {
  display: block;
  padding: 12px 14px;
  font-size: 16px;
  font-weight: 500;
  color: var(--lc);
  border-radius: 9px;
  text-decoration: none;
  transition: color 0.16s, background 0.16s;
}
.mobile-nav-links li a:hover {
  color: var(--lh);
  background: var(--lhbg);
}
.mobile-nav-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid rgba(0,0,0,0.07);
}
.mobile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 13px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  text-decoration: none;
  text-align: center;
  transition: all 0.18s;
  font-family: inherit;
  cursor: pointer;
}
.mobile-btn.btn-primary {
  background: linear-gradient(135deg, #0055e0, #0033aa);
  color: #fff;
  border: none;
}
.mobile-btn.btn-primary:hover { opacity: 0.9; }

/* ── Responsive ── */
.desktop-only { display: flex; }

/* 1100px: tighten spacing */
@media (max-width: 1100px) {
  .nav-link { font-size: 13px; padding: 6px 7px; }
  .navbar-login-btn,
  .navbar-register-btn { font-size: 13px; padding: 6px 13px; }
  .logo-img { height: 48px; }
  .navbar-container { padding: 0 18px; height: 64px; }
}

/* 900px: go mobile */
@media (max-width: 900px) {
  .desktop-only { display: none !important; }
  .mobile-right { display: flex; }
  .mobile-menu-overlay { display: block; }
  .navbar-container { padding: 0 14px; height: 60px; }
  .logo-img { height: 44px; }
  .mobile-menu-overlay { top: 60px; }
}

/* 480px */
@media (max-width: 480px) {
  .logo-img { height: 38px; }
  .navbar-container { height: 56px; }
  .mobile-menu-overlay { top: 56px; }
}
</style>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-brand">
          <div class="footer-logo">
            <div class="logo-icon">
              <img src="/logo.png" alt="Tavrix Bank Logo" class="logo-img" />
            </div>
          </div>
          <p class="footer-desc">
            Empowering your financial future with smart, secure, and intuitive banking solutions.
          </p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Website">
              <Icon name="lucide:globe" :size="20" />
            </a>
            <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer" class="social-link whatsapp-social" aria-label="WhatsApp Support">
              <Icon name="logos:whatsapp-icon" :size="20" />
            </a>
            <a :href="'mailto:' + supportEmail" class="social-link" aria-label="Support Email">
              <Icon name="lucide:mail" :size="20" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-column">
          <h4>Quick Links</h4>
          <div class="footer-links">
            <NuxtLink to="/about" class="footer-link">About Us</NuxtLink>
            <NuxtLink to="/about" class="footer-link">Careers</NuxtLink>
            <NuxtLink to="/about" class="footer-link">News & Press</NuxtLink>
            <NuxtLink to="/about" class="footer-link">
              <Icon name="lucide:map-pin" :size="14" />
              Branch Locator
            </NuxtLink>
          </div>
        </div>

        <!-- Products -->
        <div class="footer-column">
          <h4>Products</h4>
          <div class="footer-links">
            <NuxtLink to="/personal" class="footer-link">Checking & Savings</NuxtLink>
            <NuxtLink to="/personal" class="footer-link">Credit Cards</NuxtLink>
            <NuxtLink to="/loans" class="footer-link">Home Loans</NuxtLink>
            <NuxtLink to="/investments" class="footer-link">Investments</NuxtLink>
          </div>
        </div>

        <!-- Support -->
        <div class="footer-column">
          <h4>Support</h4>
          <div class="footer-links">
            <NuxtLink to="/#faq" class="footer-link">Help Center</NuxtLink>
            <NuxtLink to="/#contact" class="footer-link">Contact Us</NuxtLink>
            <NuxtLink to="/register" class="footer-link">Security Center</NuxtLink>
            <NuxtLink to="/register" class="footer-link">Fraud Protection</NuxtLink>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2012 – {{ currentYear }} Tavrix Bank. All rights reserved.</p>
        <div class="footer-bottom-links">
          <NuxtLink to="/register">Terms & Conditions</NuxtLink>
          <NuxtLink to="/register">Privacy Policy</NuxtLink>
          <NuxtLink to="/register">Accessibility</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const currentYear = new Date().getFullYear()

const supportEmail = ref('support@tavrixbank.com')
const whatsappNumber = ref('+16064625390')

const formattedWhatsapp = computed(() => whatsappNumber.value.replace(/[^0-9]/g, ''))
const whatsappUrl = computed(() => {
  const text = encodeURIComponent('Hello! I need support with my Tavrix Bank account.')
  return `https://wa.me/${formattedWhatsapp.value}?text=${text}`
})

const { data: initialSettings } = await useAsyncData('footer-settings', () => $fetch<any>('/api/settings'), {
  default: () => null
})

if (initialSettings.value?.data) {
  const data = initialSettings.value.data?.data ?? initialSettings.value.data
  if (data?.supportEmail) supportEmail.value = data.supportEmail
  const num = data?.whatsappNumber || data?.supportPhone
  if (num) whatsappNumber.value = num
}

onMounted(async () => {
  try {
    const res = await $fetch<any>('/api/settings')
    if (res?.success && res?.data) {
      const data = res.data?.data ?? res.data
      if (data.supportEmail) supportEmail.value = data.supportEmail
      const num = data.whatsappNumber || data.supportPhone
      if (num) whatsappNumber.value = num
    }
  } catch {
    // fallback quietly
  }
})
</script>

<style scoped>
/* ============================================================
   FOOTER
   Uses CSS variables throughout — automatically adapts to
   light/dark mode via the .dark block in main.css.
   ============================================================ */
.footer {
  background: var(--color-footer-bg);
  color: var(--color-text-muted);
  padding: 60px 0 0;
  border-top: 1px solid var(--color-border);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
  padding-bottom: 48px;
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}

@media (max-width: 480px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-logo {
  display: flex;
  align-items: center;
}

.logo-icon {
  width: 140px;
  height: 40px;
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .logo-icon {
    width: 120px;
    height: 34px;
  }
}

@media (max-width: 480px) {
  .logo-icon {
    width: 100px;
    height: 28px;
  }
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.footer-desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-muted);
  max-width: 280px;
}

.social-links {
  display: flex;
  gap: 10px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: rgba(0, 102, 255, 0.06);
  border: 1px solid var(--color-border);
  color: var(--color-secondary);
  transition: all 0.2s;
  text-decoration: none;
}

.social-link:hover {
  background: var(--color-secondary);
  color: #fff;
  border-color: transparent;
  transform: translateY(-2px);
}

.footer-column h4 {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-main);
  margin-bottom: 16px;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--color-secondary);
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-top: 1px solid var(--color-border);
  font-size: 13px;
  color: var(--color-text-faint);
  flex-wrap: wrap;
  gap: 12px;
}

.footer-bottom-links {
  display: flex;
  gap: 20px;
}

.footer-bottom-links a {
  color: var(--color-text-faint);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-bottom-links a:hover {
  color: var(--color-secondary);
}

@media (max-width: 480px) {
  .footer-bottom { flex-direction: column; }
  .footer-bottom-links { gap: 12px; }
}
</style>

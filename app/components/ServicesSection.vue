<template>
  <section id="services" class="services-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Our <span class="text-gradient">Services</span></h2>
        <p class="section-subtitle">
          Experience next-generation banking with secure, intuitive tools designed to help you manage, grow, and transfer your wealth.
        </p>
      </div>

      <!-- Banking Image Banner -->
      <div class="services-image-banner">
        <img src="/banking-services.jpeg" alt="Tavrix Bank banking services overview" class="services-banner-img" />
        <div class="services-banner-overlay">
          <div class="banner-badge">
            <Icon name="lucide:shield-check" :size="16" class="banner-badge-icon" />
            <span>Trusted by over 500,000 customers worldwide</span>
          </div>
          <p class="banner-overlay-text">Secure. Seamless. Always available.</p>
          <NuxtLink to="/register" class="btn btn-primary banner-cta-btn">
            Open an Account
            <Icon name="lucide:arrow-right" :size="16" />
          </NuxtLink>
        </div>
      </div>

      <div class="services-grid">
        <div v-for="(service, index) in services" :key="index" class="service-card">
          <div class="card-glow" />
          <div class="service-icon-wrapper">
            <Icon :name="service.icon" :size="26" class="service-icon" />
          </div>
          <div class="service-content">
            <h3 class="service-title">{{ service.title }}</h3>
            <p class="service-description">{{ service.description }}</p>
          </div>
          <NuxtLink :to="service.to" class="service-link">
            <span>{{ service.linkText }}</span>
            <Icon name="lucide:arrow-right" :size="16" class="service-link-icon" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const services = [
  {
    icon: 'lucide:piggy-bank',
    title: 'Savings Account',
    description: 'Grow your funds faster with our high-yield savings accounts offering industry-leading APYs and automated saving plans.',
    linkText: 'Start Saving',
    to: '/personal'
  },
  {
    icon: 'lucide:wallet',
    title: 'Current Accounts',
    description: 'Everyday checking with no monthly maintenance fees, zero minimum balance requirements, and free ATM access globally.',
    linkText: 'Open Account',
    to: '/personal'
  },
  {
    icon: 'lucide:credit-card',
    title: 'Virtual Cards',
    description: 'Create secure virtual cards instantly for online shopping, subscriptions, and added fraud protection.',
    linkText: 'Generate Card',
    to: '/register'
  },
  {
    icon: 'lucide:arrow-left-right',
    title: 'Money Transfers',
    description: 'Send and receive money internationally or locally in seconds with low-cost, fully transparent transfers.',
    linkText: 'Transfer Now',
    to: '/register'
  },
  {
    icon: 'lucide:receipt',
    title: 'Bill Payments',
    description: 'Consolidate and automate all your recurring utilities, subscriptions, and invoices inside one powerful dashboard.',
    linkText: 'Setup Bill Pay',
    to: '/register'
  },
  {
    icon: 'lucide:banknote',
    title: 'Flexible Loans',
    description: 'Access mortgages, auto loans, and personal financing at highly competitive interest rates and terms tailored to you.',
    linkText: 'View Rates',
    to: '/loans'
  },
  {
    icon: 'lucide:trending-up',
    title: 'Investments',
    description: 'Build a secure financial future with commission-free stock trading, smart robo-advisors, and retirement accounts.',
    linkText: 'Start Investing',
    to: '/investments'
  },
  {
    icon: 'lucide:globe',
    title: 'Foreign Exchange',
    description: 'Convert and manage multi-currency balances at real-time interbank rates without any markup or hidden charges.',
    linkText: 'Exchange Currencies',
    to: '/register'
  }
]
</script>

<style scoped>
.services-section {
  padding: 100px 0;
  background-color: var(--color-background-subtle);
  position: relative;
  overflow: hidden;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .services-section { padding: 64px 0; }
  .section-header { margin-bottom: 40px; }
}

@media (max-width: 480px) {
  .services-section { padding: 48px 0; }
  .section-header { margin-bottom: 28px; }
}

/* Image Banner */
.services-image-banner {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 60px;
  height: 320px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--color-border);
}

.dark .services-image-banner {
  border-color: rgba(255, 255, 255, 0.07);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
}

.services-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.6s ease;
}

.services-image-banner:hover .services-banner-img {
  transform: scale(1.03);
}

.services-banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(10, 25, 47, 0.82) 0%,
    rgba(10, 25, 47, 0.55) 55%,
    rgba(10, 25, 47, 0.05) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  padding: 48px 56px;
}

.banner-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 102, 255, 0.2);
  border: 1px solid rgba(0, 102, 255, 0.4);
  color: #93c5fd;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 999px;
  width: fit-content;
  backdrop-filter: blur(4px);
}

.banner-badge-icon {
  color: #60a5fa;
}

.banner-overlay-text {
  font-size: clamp(20px, 3vw, 32px);
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  letter-spacing: -0.02em;
  max-width: 420px;
}

.banner-cta-btn {
  width: fit-content;
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 0 24px rgba(0, 102, 255, 0.5);
}

@media (max-width: 768px) {
  .services-image-banner {
    height: 240px;
  }
  .services-banner-overlay {
    padding: 32px 28px;
  }
  .banner-badge {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .services-image-banner {
    height: 200px;
  }
  .services-banner-overlay {
    padding: 24px 20px;
    gap: 12px;
  }
  .banner-cta-btn {
    display: none;
  }
}

.dark .services-section {
  background-color: var(--color-background-subtle);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.section-header {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 60px auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.02em;
}

.dark .section-title {
  color: #ffffff;
}

.text-gradient {
  background: linear-gradient(135deg, #0066FF, #00d2ff, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .text-gradient {
  background: linear-gradient(135deg, #60a5fa, #a78bfa, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 16px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.dark .section-subtitle {
  color: rgba(255, 255, 255, 0.65);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 1100px) {
  .services-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 850px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 550px) {
  .services-grid {
    grid-template-columns: 1fr;
  }
}

.service-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}

.dark .service-card {
  background: rgba(17, 34, 64, 0.45);
  border-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 40px rgba(0, 102, 255, 0.08);
  border-color: rgba(0, 102, 255, 0.3);
}

.dark .service-card:hover {
  box-shadow: 0 16px 40px rgba(0, 102, 255, 0.15), 0 0 30px rgba(99, 102, 241, 0.1);
  border-color: rgba(96, 165, 250, 0.3);
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle 120px at var(--x, 50%) var(--y, 50%), rgba(0, 102, 255, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.service-card:hover .card-glow {
  opacity: 1;
}

.service-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(0, 102, 255, 0.08), rgba(0, 102, 255, 0.03));
  border: 1px solid rgba(0, 102, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.dark .service-icon-wrapper {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.12), rgba(96, 165, 250, 0.03));
  border-color: rgba(96, 165, 250, 0.2);
}

.service-card:hover .service-icon-wrapper {
  transform: scale(1.08) rotate(3deg);
}

.service-icon {
  color: var(--color-secondary);
}

.dark .service-icon {
  color: #60a5fa;
}

.service-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
}

.service-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
  letter-spacing: -0.01em;
}

.dark .service-title {
  color: #ffffff;
}

.service-description {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.55;
}

.dark .service-description {
  color: rgba(255, 255, 255, 0.6);
}

.service-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-secondary);
  text-decoration: none;
  transition: gap 0.2s ease, color 0.2s ease;
  margin-top: 12px;
  align-self: flex-start;
}

.dark .service-link {
  color: #60a5fa;
}

.service-link:hover {
  gap: 12px;
  color: var(--color-secondary-hover);
}

.dark .service-link:hover {
  color: #818cf8;
}

.service-link-icon {
  transition: transform 0.2s ease;
}

.service-link:hover .service-link-icon {
  transform: translateX(2px);
}
</style>

<template>
  <section class="cta-section">
    <!-- Background elements -->
    <div class="cta-bg">
      <div class="cta-orb cta-orb-1" />
      <div class="cta-orb cta-orb-2" />
      <div class="cta-grid" />
    </div>

    <div class="container">
      <div class="cta-inner">
        <!-- Badge -->
        <div class="cta-badge">
          <Icon name="lucide:zap" :size="14" class="badge-zap" />
          <span>Start banking smarter today</span>
        </div>

        <!-- Headline -->
        <h2 class="cta-title">
          Your financial future <br />
          starts <span class="cta-highlight">right now.</span>
        </h2>

        <p class="cta-desc">
          Join over 500,000 people who trust Tavrix Bank for everyday banking, global transfers, smart investing, and more — all in one beautifully simple app.
        </p>

        <!-- Actions -->
        <div class="cta-actions">
          <NuxtLink to="/register" class="btn cta-btn-primary">
            Open Your Free Account
            <Icon name="lucide:arrow-right" :size="18" />
          </NuxtLink>
          <NuxtLink to="/about" class="btn cta-btn-ghost">
            Learn More About Us
          </NuxtLink>
        </div>

        <!-- Trust row -->
        <div class="cta-trust">
          <div v-for="(trust, i) in trustItems" :key="i" class="cta-trust-item">
            <Icon :name="trust.icon" :size="15" class="trust-icon" />
            <span>{{ trust.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const trustItems = [
  { icon: 'lucide:shield-check', label: 'FDIC Insured' },
  { icon: 'lucide:lock', label: '256-bit Encryption' },
  { icon: 'lucide:clock', label: '24/7 Support' },
  { icon: 'lucide:star', label: 'Rated 4.9 / 5' }
]
</script>

<style scoped>
/* ============================================================
   CTA SECTION
   Background & borders use CSS variables that auto-switch with
   the .dark class — no per-component dark-mode overrides needed.
   ============================================================ */
.cta-section {
  position: relative;
  padding: 120px 0;
  background: var(--color-section-gradient-b);
  overflow: hidden;
  border-top: 1px solid var(--color-section-border);
  border-bottom: 1px solid var(--color-section-border);
}

@media (max-width: 768px) {
  .cta-section { padding: 80px 0; }
}

@media (max-width: 480px) {
  .cta-section { padding: 60px 0; }
  .cta-actions { flex-direction: column; align-items: stretch; width: 100%; }
  .cta-btn-primary, .cta-btn-ghost { width: 100%; justify-content: center; }
}

/* Background */
.cta-bg { position: absolute; inset: 0; }

.cta-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
}

.cta-orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 102, 255, 0.12) 0%, transparent 70%);
  top: -200px;
  left: -100px;
  animation: ctaOrb 12s ease-in-out infinite;
}

.cta-orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  bottom: -200px;
  right: -100px;
  animation: ctaOrb 15s ease-in-out infinite reverse;
}

.cta-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 102, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 102, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}

@keyframes ctaOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(30px, -40px) scale(1.1); }
}

/* Content */
.cta-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 28px;
  max-width: 760px;
  margin: 0 auto;
}

.cta-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 102, 255, 0.08);
  border: 1px solid rgba(0, 102, 255, 0.2);
  color: var(--color-secondary);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 999px;
  backdrop-filter: blur(6px);
}

.badge-zap { color: #f59e0b; }

.cta-title {
  font-size: clamp(32px, 5vw, 60px);
  font-weight: 900;
  color: var(--color-text-main);
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.cta-highlight {
  background: linear-gradient(135deg, #0066FF, #00d2ff, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cta-desc {
  font-size: 17px;
  color: var(--color-text-muted);
  line-height: 1.65;
  max-width: 600px;
}

.cta-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}

.cta-btn-primary {
  background: var(--color-secondary);
  color: #ffffff;
  padding: 16px 36px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 102, 255, 0.25);
}

.cta-btn-primary:hover {
  background: var(--color-secondary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(0, 102, 255, 0.4);
}

.cta-btn-ghost {
  border: 1.5px solid var(--color-border);
  color: var(--color-text-main);
  background: transparent;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.cta-btn-ghost:hover {
  border-color: var(--color-secondary);
  color: var(--color-secondary);
  background: rgba(0, 102, 255, 0.05);
}

/* Trust row */
.cta-trust {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
  width: 100%;
}

.cta-trust-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.trust-icon { color: var(--color-secondary); }
</style>

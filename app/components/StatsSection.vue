<template>
  <section class="stats-section">
    <!-- Decorative background blobs -->
    <div class="stats-blob stats-blob-1" />
    <div class="stats-blob stats-blob-2" />

    <div class="container">
      <div class="stats-header">
        <span class="stats-eyebrow">By the Numbers</span>
        <h2 class="stats-title">Trusted by hundreds of thousands worldwide</h2>
      </div>

      <div class="stats-grid">
        <div v-for="(stat, i) in stats" :key="i" class="stat-card">
          <div class="stat-icon-wrap">
            <Icon :name="stat.icon" :size="24" class="stat-icon" />
          </div>
          <div class="stat-value">
            <span class="stat-number">{{ stat.value }}</span>
            <span class="stat-suffix">{{ stat.suffix }}</span>
          </div>
          <p class="stat-label">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const stats = [
  { icon: 'lucide:users', value: '500K+', suffix: '', label: 'Active Customers' },
  { icon: 'lucide:globe', value: '120+', suffix: '', label: 'Countries Supported' },
  { icon: 'lucide:banknote', value: '$14', suffix: 'B+', label: 'Assets Under Management' },
  { icon: 'lucide:clock', value: '99.9', suffix: '%', label: 'Platform Uptime SLA' },
  { icon: 'lucide:shield-check', value: '0', suffix: '', label: 'Security Breaches' },
  { icon: 'lucide:star', value: '4.9', suffix: '/5', label: 'Average App Rating' },
]
</script>

<style scoped>
/* ============================================================
   STATS SECTION
   Background & borders use CSS variables that auto-switch with
   the .dark class — no per-component dark-mode overrides needed.
   ============================================================ */
.stats-section {
  position: relative;
  padding: 100px 0;
  background: var(--color-section-gradient-a);
  overflow: hidden;
  border-top: 1px solid var(--color-section-border);
  border-bottom: 1px solid var(--color-section-border);
}

@media (max-width: 768px) {
  .stats-section { padding: 64px 0; }
  .stats-header { margin-bottom: 40px; }
}

@media (max-width: 480px) {
  .stats-section { padding: 48px 0; }
  .stats-header { margin-bottom: 28px; }
  .stats-title { font-size: 20px; }
}

/* Decorative blobs */
.stats-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
}

.stats-blob-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(0, 102, 255, 0.12) 0%, transparent 70%);
  top: -200px;
  right: -100px;
  animation: blobFloat 10s ease-in-out infinite;
}

.stats-blob-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  bottom: -150px;
  left: -80px;
  animation: blobFloat 13s ease-in-out infinite reverse;
}

@keyframes blobFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(20px, -30px) scale(1.08); }
}

/* Header */
.stats-header {
  text-align: center;
  margin-bottom: 64px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.stats-title {
  font-size: clamp(22px, 3.5vw, 36px);
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.02em;
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.2;
}

/* Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 700px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 400px) {
  .stats-grid { grid-template-columns: 1fr; }
}

/* Card */
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.stat-card:hover {
  border-color: rgba(0, 102, 255, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 102, 255, 0.1);
}

/* Icon */
.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(0, 102, 255, 0.08);
  border: 1px solid rgba(0, 102, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  color: var(--color-secondary);
}

/* Values */
.stat-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.stat-number {
  font-size: clamp(26px, 3vw, 38px);
  font-weight: 900;
  color: var(--color-text-main);
  line-height: 1;
  letter-spacing: -0.02em;
}

.stat-suffix {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-secondary);
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  line-height: 1.4;
}
</style>

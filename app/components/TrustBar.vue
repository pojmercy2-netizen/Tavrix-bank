<template>
  <section class="trustbar">
    <div class="container">
      <div class="trustbar-grid">
        <div v-for="(item, index) in trustItems" :key="index" class="trust-item">
          <div class="trust-icon-container">
            <Icon :name="item.icon" :size="28" class="trust-icon" />
          </div>
          <div class="trust-content">
            <h4 class="trust-title">{{ item.title }}</h4>
            <p class="trust-desc" v-html="item.desc" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const trustItems = [
  {
    icon: 'lucide:shield',
    title: 'Banking You Can Trust',
    desc: 'Member FDIC<br><span style="color:var(--color-text-faint);font-size:12px">Equal Housing Lender</span>'
  },
  {
    icon: 'lucide:lock',
    title: 'Top-Tier Security',
    desc: 'Advanced encryption and<br>fraud protection 24/7.'
  },
  {
    icon: 'lucide:headphones',
    title: 'Here for You',
    desc: '24/7 support by phone,<br>chat or email.'
  },
  {
    icon: 'lucide:smartphone',
    title: 'Bank Anywhere',
    desc: 'Mobile app with all the tools<br>you need on the go.'
  }
]
</script>

<style scoped>
.trustbar {
  padding: 40px 0;
  background: var(--trustbar-bg);
  border-top: 1px solid var(--trustbar-border);
  border-bottom: 1px solid var(--trustbar-border);
  
  --trustbar-bg: var(--color-surface);
  --trustbar-border: var(--color-border);
  --trust-title-color: var(--color-text-main);
  --trust-desc-color: var(--color-text-muted);
  --trust-item-bg: var(--color-background-subtle);
  --trust-item-bg-hover: var(--color-border);
  --trust-item-border: var(--color-border);
  --trust-icon-color: var(--color-secondary);
}

@media (max-width: 640px) {
  .trustbar { padding: 28px 0; }
}

:global(.dark) .trustbar {
  --trustbar-bg: #0A192F;
  --trustbar-border: rgba(255, 255, 255, 0.06);
  --trust-title-color: #ffffff;
  --trust-desc-color: rgba(255, 255, 255, 0.55);
  --trust-item-bg: rgba(255, 255, 255, 0.03);
  --trust-item-bg-hover: rgba(255, 255, 255, 0.06);
  --trust-item-border: rgba(255, 255, 255, 0.08);
  --trust-icon-color: #60a5fa;
}

.trustbar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  align-items: center;
}

@media (max-width: 900px) {
  .trustbar-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
}

@media (max-width: 480px) {
  .trustbar-grid { grid-template-columns: 1fr; gap: 16px; }
}

.trust-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--trust-item-border);
  background: var(--trust-item-bg);
  transition: all 0.2s;
}
.trust-item:hover {
  background: var(--trust-item-bg-hover);
  border-color: rgba(0, 102, 255, 0.3);
}

.trust-icon-container {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(0,102,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.trust-icon {
  color: var(--trust-icon-color);
}

.trust-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trust-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--trust-title-color);
}

.trust-desc {
  font-size: 13px;
  color: var(--trust-desc-color);
  line-height: 1.5;
}
</style>

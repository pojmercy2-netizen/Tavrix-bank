<template>
  <section class="features">
    <div class="container">
      <div class="features-grid">
        <div v-for="(feature, index) in features" :key="index" class="feature-card">
          <div class="feature-icon-wrapper">
            <Icon :name="feature.icon" :size="28" class="feature-icon" />
          </div>
          <div class="feature-content">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
            <NuxtLink :to="feature.to" class="feature-link">
              {{ feature.link }}
              <Icon name="lucide:arrow-right" :size="16" class="feature-link-icon" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  {
    icon: 'lucide:credit-card',
    title: 'Everyday Banking',
    description: 'Easy checking, savings and tools to help you stay on track.',
    link: 'Learn More',
    to: '/personal'
  },
  {
    icon: 'lucide:home',
    title: 'Loans & Mortgages',
    description: 'Competitive rates and flexible options for what matters most.',
    link: 'Learn More',
    to: '/loans'
  },
  {
    icon: 'lucide:trending-up',
    title: 'Invest & Grow',
    description: 'Smart investment solutions for your financial future.',
    link: 'Learn More',
    to: '/investments'
  },
  {
    icon: 'lucide:shield-check',
    title: 'Secure & Reliable',
    description: 'Bank with confidence using industry-leading security.',
    link: 'Learn More',
    to: '/about'
  }
]
</script>

<style scoped>
.features {
  padding: 80px 0;
  background: var(--color-background-light);
}

@media (max-width: 768px) {
  .features { padding: 60px 0; }
}

@media (max-width: 480px) {
  .features { padding: 48px 0; }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 900px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .features-grid { grid-template-columns: 1fr; gap: 16px; }
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px;
  background: var(--color-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
  border-color: rgba(0,102,255,0.2);
}

.feature-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0,102,255,0.1), rgba(0,102,255,0.05));
  border: 1px solid rgba(0,102,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon {
  color: var(--color-secondary);
}

.feature-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.feature-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-main);
}

.feature-description {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.55;
  flex: 1;
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-secondary);
  text-decoration: none;
  transition: gap 0.2s;
  margin-top: auto;
}

.feature-link:hover { gap: 10px; }

.feature-link-icon {
  transition: transform 0.2s;
}
.feature-link:hover .feature-link-icon {
  transform: translateX(3px);
}
</style>

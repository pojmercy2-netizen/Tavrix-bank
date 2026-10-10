<template>
  <section class="testimonials-section">
    <div class="container">
      <div class="section-header">
        <span class="section-eyebrow">Testimonials</span>
        <h2 class="section-title">What our customers <span class="text-gradient">are saying</span></h2>
        <p class="section-subtitle">Real stories from real people who trust Tavrix Bank with their financial future.</p>
      </div>

      <div class="testimonials-grid">
        <div v-for="(t, i) in testimonials" :key="i" class="testimonial-card" :class="{ featured: t.featured }">
          <div class="quote-icon">
            <Icon name="lucide:quote" :size="28" />
          </div>
          <div class="stars">
            <Icon v-for="s in 5" :key="s" name="lucide:star" :size="15" class="star" />
          </div>
          <p class="testimonial-text">{{ t.quote }}</p>
          <div class="testimonial-author">
            <div class="author-avatar" :style="{ background: t.color }">
              <span class="avatar-initials">{{ t.initials }}</span>
            </div>
            <div class="author-info">
              <p class="author-name">{{ t.name }}</p>
              <p class="author-role">{{ t.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const testimonials = [
  {
    quote: "Switching to Tavrix Bank was the best financial decision I've made. The virtual card feature alone has saved me from countless fraud attempts.",
    name: 'Amara Osei',
    role: 'Freelance Designer, Lagos',
    initials: 'AO',
    color: 'linear-gradient(135deg, #0066FF, #6366f1)',
    featured: true
  },
  {
    quote: "I transferred money internationally for the first time without any hidden fees. The exchange rates are transparent and the speed is incredible.",
    name: 'James Whitmore',
    role: 'Software Engineer, London',
    initials: 'JW',
    color: 'linear-gradient(135deg, #10b981, #06b6d4)',
    featured: false
  },
  {
    quote: "The savings account APY is unmatched and the dashboard makes it so easy to track my financial goals every single day.",
    name: 'Priya Sharma',
    role: 'Product Manager, Toronto',
    initials: 'PS',
    color: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    featured: false
  },
  {
    quote: "Got my personal loan approved in under 24 hours with a better rate than my local bank ever offered. Absolutely seamless process.",
    name: 'Carlos Mendoza',
    role: 'Small Business Owner, Miami',
    initials: 'CM',
    color: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    featured: false
  },
  {
    quote: "The investment tools are professional-grade but still super easy to use. My portfolio has grown 22% in just one year with their robo-advisor.",
    name: 'Yuki Tanaka',
    role: 'Data Analyst, Tokyo',
    initials: 'YT',
    color: 'linear-gradient(135deg, #06b6d4, #0066FF)',
    featured: false
  },
  {
    quote: "Bill pay automation has completely changed how I manage my household finances. I never miss a payment and my credit score has improved drastically.",
    name: 'Sophie Bernard',
    role: 'Teacher, Paris',
    initials: 'SB',
    color: 'linear-gradient(135deg, #34d399, #6366f1)',
    featured: false
  }
]
</script>

<style scoped>
.testimonials-section {
  padding: 100px 0;
  background: var(--color-background-light);
  border-top: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .testimonials-section { padding: 64px 0; }
  .section-header { margin-bottom: 40px; }
}

@media (max-width: 480px) {
  .testimonials-section { padding: 48px 0; }
  .section-header { margin-bottom: 28px; }
}

.dark .testimonials-section {
  background: var(--color-background-light);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.section-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 64px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.dark .section-eyebrow {
  color: #60a5fa;
}

.section-title {
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.dark .section-title {
  color: #ffffff;
}

.text-gradient {
  background: linear-gradient(135deg, #0066FF, #6366f1, #06b6d4);
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

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .testimonials-grid { grid-template-columns: 1fr; }
}

.testimonial-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: all 0.3s ease;
}

.dark .testimonial-card {
  background: rgba(17, 34, 64, 0.5);
  border-color: rgba(255, 255, 255, 0.06);
}

.testimonial-card.featured {
  background: linear-gradient(135deg, rgba(0, 102, 255, 0.06), rgba(99, 102, 241, 0.04));
  border-color: rgba(0, 102, 255, 0.25);
}

.dark .testimonial-card.featured {
  background: linear-gradient(135deg, rgba(0, 102, 255, 0.12), rgba(99, 102, 241, 0.08));
  border-color: rgba(96, 165, 250, 0.25);
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 102, 255, 0.3);
}

.dark .testimonial-card:hover {
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
  border-color: rgba(96, 165, 250, 0.3);
}

.quote-icon {
  color: var(--color-secondary);
  opacity: 0.3;
}

.dark .quote-icon {
  color: #60a5fa;
}

.stars {
  display: flex;
  gap: 3px;
}

.star {
  color: #f59e0b;
  fill: #f59e0b;
}

.testimonial-text {
  font-size: 15px;
  color: var(--color-text-muted);
  line-height: 1.65;
  flex: 1;
  font-style: italic;
}

.dark .testimonial-text {
  color: rgba(255, 255, 255, 0.65);
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.dark .testimonial-author {
  border-top-color: rgba(255, 255, 255, 0.06);
}

.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-initials {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.02em;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-main);
}

.dark .author-name {
  color: #ffffff;
}

.author-role {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>

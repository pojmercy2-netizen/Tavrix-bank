<template>
  <section class="about-section">
    <div class="container">
      <div class="about-inner">
        <!-- Image -->
        <div class="about-image-wrap">
          <div class="about-image-frame">
            <img src="/about-us.png" alt="Tavrix Bank team at work" class="about-image" />
            <div class="about-image-overlay" />
          </div>
          <!-- Floating stat pill -->
          <div class="about-stat-pill">
            <div class="pill-icon-wrap">
              <Icon name="lucide:award" :size="18" class="pill-icon" />
            </div>
            <div>
              <p class="pill-value">Est. 2012</p>
              <p class="pill-label">Trusted for 6+ years</p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="about-content">
          <span class="about-eyebrow">About Tavrix Bank</span>
          <h2 class="about-title">Banking built around <span class="text-gradient">your life</span></h2>
          <p class="about-desc">
            Tavrix Bank was founded in 2012 with a single mission: to make premium banking accessible to everyone, everywhere. We believe that financial empowerment shouldn't be reserved for the privileged few — it should be a right.
          </p>
          <p class="about-desc">
            Our team of over 1,200 dedicated professionals operates across 40+ countries, combining world-class technology with a genuine passion for customer wellbeing. We are fully licensed, regulated, and FDIC insured.
          </p>

          <ul class="about-pillars">
            <li v-for="(pillar, i) in pillars" :key="i" class="pillar-item">
              <div class="pillar-icon-wrap">
                <Icon :name="pillar.icon" :size="18" class="pillar-icon" />
              </div>
              <div>
                <p class="pillar-title">{{ pillar.title }}</p>
                <p class="pillar-desc">{{ pillar.desc }}</p>
              </div>
            </li>
          </ul>

          <NuxtLink to="/about" class="btn btn-primary about-cta">
            Learn Our Story
            <Icon name="lucide:arrow-right" :size="16" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const pillars = [
  { icon: 'lucide:shield', title: 'Security First', desc: 'Military-grade encryption on every transaction and account.' },
  { icon: 'lucide:heart-handshake', title: 'Customer Obsessed', desc: '24/7 human support — no bots, no hold music.' },
  { icon: 'lucide:leaf', title: 'Responsible Finance', desc: 'Committed to ESG principles and sustainable banking.' }
]
</script>

<style scoped>
.about-section {
  padding: 100px 0;
  background: var(--color-background-subtle);
  border-top: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .about-section { padding: 64px 0; }
}

@media (max-width: 480px) {
  .about-section { padding: 48px 0; }
}

.dark .about-section {
  background: var(--color-background-subtle);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.about-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 72px;
  align-items: center;
}

@media (max-width: 900px) {
  .about-inner {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .about-image-wrap { padding-bottom: 28px; }
}

@media (max-width: 480px) {
  .about-inner { gap: 32px; }
  .about-image-wrap { padding-bottom: 20px; }
}

/* Image side */
.about-image-wrap {
  position: relative;
}

.about-image-frame {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
  aspect-ratio: 4/3;
  position: relative;
}

.dark .about-image-frame {
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
}

.about-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

.about-image-frame:hover .about-image {
  transform: scale(1.04);
}

.about-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10, 25, 47, 0.4) 0%, transparent 60%);
}

.about-stat-pill {
  position: absolute;
  bottom: -20px;
  right: -20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

.dark .about-stat-pill {
  background: rgba(17, 34, 64, 0.85);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

@media (max-width: 640px) {
  .about-stat-pill {
    right: 10px;
    bottom: 10px;
    padding: 12px 14px;
    gap: 10px;
  }
  .pill-value { font-size: 13px; }
  .pill-label { font-size: 11px; }
}

.pill-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(0, 102, 255, 0.12), rgba(0, 102, 255, 0.05));
  border: 1px solid rgba(0, 102, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pill-icon { color: var(--color-secondary); }
.dark .pill-icon { color: #60a5fa; }

.pill-value {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-text-main);
}

.dark .pill-value { color: #ffffff; }

.pill-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* Content side */
.about-content {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.about-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.dark .about-eyebrow { color: #60a5fa; }

.about-title {
  font-size: clamp(26px, 3.5vw, 40px);
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.dark .about-title { color: #ffffff; }

.text-gradient {
  background: linear-gradient(135deg, #0066FF, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .text-gradient {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.about-desc {
  font-size: 15px;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.about-pillars {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.pillar-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.pillar-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(0, 102, 255, 0.08);
  border: 1px solid rgba(0, 102, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.dark .pillar-icon-wrap {
  background: rgba(96, 165, 250, 0.1);
  border-color: rgba(96, 165, 250, 0.2);
}

.pillar-icon { color: var(--color-secondary); }
.dark .pillar-icon { color: #60a5fa; }

.pillar-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 2px;
}

.dark .pillar-title { color: #ffffff; }

.pillar-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.about-cta {
  width: fit-content;
  padding: 13px 30px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 6px;
}
</style>

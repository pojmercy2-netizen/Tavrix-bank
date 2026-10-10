<template>
  <section
    class="hero"
    ref="heroRef"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- Background -->
    <div class="hero-background">
      <div class="mesh-gradient">
        <div class="mesh-color mesh-1" />
        <div class="mesh-color mesh-2" />
        <div class="mesh-color mesh-3" />
        <div class="mesh-color mesh-4" />
      </div>
      <div class="hero-grid-overlay" />
      <div class="hero-gradient-orb orb-1" />
      <div class="hero-gradient-orb orb-2" />
    </div>

    <div class="container hero-container">
      <div class="hero-inner">
        <!-- Content -->
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-highlight">New</span>
            <span class="badge-text">Earn 5.00% APY on Savings</span>
          </div>
          <h1 class="hero-title">
            Bank smarter.<br />
            <span class="text-gradient">Live better.</span>
          </h1>
          <p class="hero-description">
            Secure, premium banking solutions designed to help you<br class="hidden-mobile" />
            manage today and build for tomorrow.
          </p>
          <div class="hero-actions">
            <NuxtLink to="/register" class="btn btn-primary hero-btn btn-glow">
              Open an Account
              <Icon name="lucide:arrow-right" :size="18" />
            </NuxtLink>
            <NuxtLink to="/personal" class="btn hero-btn-secondary hero-btn-outline">
              Explore Products
            </NuxtLink>
          </div>
        </div>

        <!-- Visual Card -->
        <div class="hero-visual" aria-hidden="true">
          <div
            class="hero-card"
            :class="{ hovering: isHovering }"
            :style="{
              transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(40px)`
            }"
          >
            <div class="hero-card-glow" />
            <div class="hero-card-inner">
              <span class="hero-card-label">Tavrix Bank</span>
              <h2 class="hero-card-heading">Next-level digital finance</h2>
              <div class="hero-card-stats">
                <div>
                  <strong>24/7</strong>
                  <p>Support</p>
                </div>
                <div>
                  <strong>1.9%</strong>
                  <p>APY</p>
                </div>
              </div>
            </div>
          </div>
          <div
            class="hero-shape hero-shape-small"
            :style="{
              transform: `translateZ(70px) rotate(22deg) translateX(${rotate.y * -0.5}px) translateY(${rotate.x * -0.5}px)`
            }"
          />
          <div
            class="hero-shape hero-shape-large"
            :style="{
              transform: `translateZ(10px) rotate(-18deg) translateX(${rotate.y * 0.5}px) translateY(${rotate.x * 0.5}px)`
            }"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const heroRef = ref<HTMLElement | null>(null)
const rotate = ref({ x: 18, y: -16 })
const isHovering = ref(false)

const handleMouseMove = (e: MouseEvent) => {
  if (!heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  rotate.value = {
    x: ((y - centerY) / centerY) * -20,
    y: ((x - centerX) / centerX) * 20
  }
  isHovering.value = true
}

const handleMouseLeave = () => {
  rotate.value = { x: 18, y: -16 }
  isHovering.value = false
}
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--color-background-subtle);
  
  --hero-text-main: var(--color-text-main);
  --hero-text-muted: var(--color-text-muted);
  --hero-grid-color: rgba(0, 0, 0, 0.03);
  --hero-badge-bg: rgba(0, 0, 0, 0.04);
  --hero-badge-border: rgba(0, 0, 0, 0.08);
  --hero-badge-text: var(--color-text-main);
  --hero-card-bg: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4));
  --hero-card-border: rgba(0, 102, 255, 0.1);
  --hero-card-heading: var(--color-text-main);
  --hero-card-label: var(--color-text-muted);
  --hero-card-stat-val: var(--color-text-main);
  --hero-card-stat-lbl: var(--color-text-muted);
  --hero-card-border-top: rgba(0, 0, 0, 0.06);
  --hero-btn-border: var(--color-secondary);
  --hero-btn-color: var(--color-secondary);
  --hero-btn-border-hover: var(--color-secondary-hover);
  --hero-btn-bg-hover: rgba(0, 102, 255, 0.06);
  --hero-btn-color-hover: var(--color-secondary-hover);
  --hero-mesh-opacity: 0.12;
}

:global(.dark) .hero {
  --hero-text-main: #ffffff;
  --hero-text-muted: rgba(255,255,255,0.65);
  --hero-grid-color: rgba(255,255,255,0.03);
  --hero-badge-bg: rgba(255,255,255,0.08);
  --hero-badge-border: rgba(255,255,255,0.15);
  --hero-badge-text: rgba(255,255,255,0.8);
  --hero-card-bg: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04));
  --hero-card-border: rgba(255,255,255,0.18);
  --hero-card-heading: #ffffff;
  --hero-card-label: rgba(255,255,255,0.5);
  --hero-card-stat-val: #ffffff;
  --hero-card-stat-lbl: rgba(255,255,255,0.5);
  --hero-card-border-top: rgba(255,255,255,0.1);
  --hero-btn-border: rgba(255, 255, 255, 0.4);
  --hero-btn-color: #ffffff;
  --hero-btn-border-hover: rgba(255, 255, 255, 0.8);
  --hero-btn-bg-hover: rgba(255, 255, 255, 0.12);
  --hero-btn-color-hover: #ffffff;
  --hero-mesh-opacity: 0.25;
}

/* Background layers */
.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.mesh-gradient {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.mesh-color {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: var(--hero-mesh-opacity);
}
.mesh-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #0066FF 0%, transparent 70%);
  top: -200px; right: -100px;
  animation: float1 8s ease-in-out infinite;
}
.mesh-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #6366f1 0%, transparent 70%);
  bottom: -100px; left: -50px;
  animation: float2 10s ease-in-out infinite;
}
.mesh-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
  top: 50%; left: 50%;
  animation: float3 12s ease-in-out infinite;
}
.mesh-4 {
  width: 250px; height: 250px;
  background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
  top: 20%; right: 30%;
  animation: float1 9s ease-in-out infinite reverse;
}

@keyframes float1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 30px) scale(1.1); }
}
@keyframes float2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -20px) scale(0.9); }
}
@keyframes float3 {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.15); }
}

.hero-grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--hero-grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--hero-grid-color) 1px, transparent 1px);
  background-size: 60px 60px;
}

.hero-gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.12;
}
.orb-1 {
  width: 800px; height: 800px;
  background: var(--color-secondary);
  top: -300px; right: -200px;
}
.orb-2 {
  width: 500px; height: 500px;
  background: #6366f1;
  bottom: -200px; left: -100px;
}

/* Content */
.hero-container {
  position: relative;
  z-index: 1;
  padding-top: 100px;
  padding-bottom: 60px;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

@media (max-width: 900px) {
  .hero-inner {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
  }
  .hero-actions { justify-content: center; }
  .hero-visual { display: none; }
}

@media (max-width: 640px) {
  .hero-container {
    padding-top: 80px;
    padding-bottom: 48px;
  }
  .hero-content { gap: 18px; }
  .hero-btn {
    padding: 12px 22px;
    font-size: 14px;
  }
  .hero-btn-outline {
    padding: 12px 22px;
    font-size: 14px;
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 6px 6px;
  background: var(--hero-badge-bg);
  border: 1px solid var(--hero-badge-border);
  border-radius: 999px;
  width: fit-content;
}

@media (max-width: 900px) {
  .hero-badge { margin: 0 auto; }
}

@media (max-width: 480px) {
  .hero-actions { flex-direction: column; align-items: center; }
  .hero-btn, .hero-btn-outline { width: 100%; justify-content: center; }
}

.badge-highlight {
  background: var(--color-secondary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-text {
  font-size: 13px;
  color: var(--hero-badge-text);
  font-weight: 500;
}

.hero-title {
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 800;
  line-height: 1.1;
  color: var(--hero-text-main);
  letter-spacing: -0.03em;
}

.text-gradient {
  background: linear-gradient(135deg, #60a5fa, #a78bfa, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 17px;
  color: var(--hero-text-muted);
  line-height: 1.65;
}

.hidden-mobile {
  display: block;
}
@media (max-width: 480px) {
  .hidden-mobile { display: none; }
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
}

.btn-glow {
  box-shadow: 0 0 30px rgba(0,102,255,0.5);
}
.btn-glow:hover {
  box-shadow: 0 0 40px rgba(0,102,255,0.7);
}

.hero-btn-outline {
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
}

.hero-btn-secondary {
  border: 1.5px solid var(--hero-btn-border);
  color: var(--hero-btn-color);
  background: transparent;
}
.hero-btn-secondary:hover {
  border-color: var(--hero-btn-border-hover);
  background: var(--hero-btn-bg-hover);
  color: var(--hero-btn-color-hover);
}

/* 3D Card */
.hero-visual {
  perspective: 1000px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 320px;
}

.hero-card {
  width: 320px;
  max-width: 100%;
  background: var(--hero-card-bg);
  border: 1px solid var(--hero-card-border);
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(20px);
  transition: transform 0.1s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
}

.hero-card.hovering {
  box-shadow: 0 30px 60px rgba(0,0,0,0.3), 0 0 80px rgba(0,102,255,0.15);
}

.hero-card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top right, rgba(0,102,255,0.2), transparent 60%);
  pointer-events: none;
}

.hero-card-inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.hero-card-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--hero-card-label);
}

.hero-card-heading {
  font-size: 20px;
  font-weight: 700;
  color: var(--hero-card-heading);
  line-height: 1.3;
}

.hero-card-stats {
  display: flex;
  gap: 32px;
  padding-top: 8px;
  border-top: 1px solid var(--hero-card-border-top);
}

.hero-card-stats div strong {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: var(--hero-card-stat-val);
}

.hero-card-stats div p {
  font-size: 12px;
  color: var(--hero-card-stat-lbl);
  margin-top: 2px;
}

/* Floating shapes */
.hero-shape {
  position: absolute;
  border-radius: 16px;
  transition: transform 0.1s ease;
}

.hero-shape-small {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, rgba(0,102,255,0.5), rgba(99,102,241,0.3));
  border: 1px solid rgba(255,255,255,0.15);
  top: 10px;
  right: -20px;
  backdrop-filter: blur(8px);
}

.hero-shape-large {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, rgba(52,211,153,0.2), rgba(0,102,255,0.15));
  border: 1px solid rgba(255,255,255,0.1);
  bottom: -20px;
  left: -30px;
  backdrop-filter: blur(6px);
}
</style>

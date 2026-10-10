<template>
  <div
    v-if="visible"
    :class="['page-loader-overlay', { 'loader-exit': exiting }]"
    aria-live="polite"
    aria-label="Loading page"
  >
    <!-- Brand lockup -->
    <div class="page-loader-brand">
      <img src="/logo.png" alt="Tavrix Bank Bank" class="page-loader-logo" />
    </div>

    <!-- Progress bar -->
    <div class="page-loader-bar-track">
      <div class="page-loader-bar-fill" />
    </div>

    <!-- Status text -->
    <p class="page-loader-status">{{ statusMessages[statusIdx] }}</p>

    <!-- Bouncing dots -->
    <div class="page-loader-dots">
      <div class="page-loader-dot" />
      <div class="page-loader-dot" />
      <div class="page-loader-dot" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const statusMessages = [
  'Securing your session',
  'Loading assets',
  'Almost there'
]

const visible = ref(true)
const exiting = ref(false)
const statusIdx = ref(0)
let timer1: ReturnType<typeof setTimeout>
let timer2: ReturnType<typeof setTimeout>
let interval: ReturnType<typeof setInterval>

onMounted(() => {
  // Cycle status messages
  interval = setInterval(() => {
    statusIdx.value = (statusIdx.value + 1) % statusMessages.length
  }, 200)

  // Simulated load completion timer
  timer1 = setTimeout(() => {
    clearInterval(interval)
    exiting.value = true

    // Unmount after exit animation (300ms)
    timer2 = setTimeout(() => {
      visible.value = false
    }, 300)
  }, 600)
})

onBeforeUnmount(() => {
  clearInterval(interval)
  clearTimeout(timer1)
  clearTimeout(timer2)
})
</script>

<style scoped>
/* ── PageLoader ──────────────────────────────────────────────── */
.page-loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffffff 0%, #f0f6ff 60%, #e8f0fe 100%);
  gap: 32px;

  /* entrance */
  animation: loader-fade-in 0.15s ease-out both;
}

/* exit class toggled by JS */
.page-loader-overlay.loader-exit {
  animation: loader-fade-out 0.3s ease-in both;
  pointer-events: none;
}

.page-loader-logo {
  height: 80px;
  width: auto;
  max-width: 320px;
  object-fit: contain;
}

/* ── Progress bar ────────────────────────────────────────────── */
.page-loader-bar-track {
  width: 220px;
  height: 3px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 100px;
  overflow: hidden;
  animation: loader-slide-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.page-loader-bar-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #0066FF, #00c6ff);
  border-radius: 100px;
  animation: loader-bar-progress 0.35s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
  box-shadow: 0 0 10px rgba(0, 198, 255, 0.6);
}

/* ── Status text ─────────────────────────────────────────────── */
.page-loader-status {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(10, 25, 47, 0.4);
  animation: loader-slide-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.18s both,
             loader-text-cycle 1.8s ease-in-out 0.4s infinite;
}

/* ── Decorative orbiting dots ────────────────────────────────── */
.page-loader-dots {
  display: flex;
  gap: 8px;
  animation: loader-slide-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both;
}

.page-loader-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(0, 102, 255, 0.7);
  animation: loader-dot-bounce 1.2s ease-in-out infinite;
}

.page-loader-dot:nth-child(1) { animation-delay: 0s; }
.page-loader-dot:nth-child(2) { animation-delay: 0.18s; }
.page-loader-dot:nth-child(3) { animation-delay: 0.36s; }

/* ── Keyframes ───────────────────────────────────────────────── */
@keyframes loader-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes loader-fade-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}

@keyframes loader-slide-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0);     }
}

@keyframes loader-bar-progress {
  0%   { width: 0%;   }
  60%  { width: 85%;  }
  100% { width: 100%; }
}

@keyframes loader-pulse {
  0%, 100% { box-shadow: 0 0 24px rgba(0, 102, 255, 0.4); }
  50%       { box-shadow: 0 0 44px rgba(0, 198, 255, 0.7); }
}

@keyframes loader-dot-bounce {
  0%, 80%, 100% { transform: scale(1);   opacity: 0.5; }
  40%            { transform: scale(1.5); opacity: 1;   }
}

@keyframes loader-text-cycle {
  0%, 100% { opacity: 0.35; }
  50%       { opacity: 0.6;  }
}
</style>

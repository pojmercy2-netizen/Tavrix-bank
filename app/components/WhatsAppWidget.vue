<template>
  <div class="whatsapp-widget-container" :class="{ 'in-dashboard': isDashboard }">
    <a
      :href="whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="whatsapp-btn"
      aria-label="Chat with Support on WhatsApp"
    >
      <!-- Ripple Effect -->
      <span class="ripple-glow"></span>
      <span class="ripple-glow secondary"></span>

      <!-- Icon -->
      <Icon name="logos:whatsapp-icon" class="whatsapp-icon" />

      <!-- Tooltip / Label -->
      <span class="widget-tooltip">
        <span class="tooltip-status"></span>
        Chat Support
      </span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const route = useRoute()

// Detect if we are inside the dashboard to adjust mobile layout offset
const isDashboard = computed(() => route.path.startsWith('/dashboard'))

const rawPhone = ref('+16064625390')

// Strip non-digits to get a clean number for wa.me/ link
const formattedPhone = computed(() => {
  return rawPhone.value.replace(/[^0-9]/g, '')
})

const whatsappUrl = computed(() => {
  const text = encodeURIComponent('Hello! I need support with my Tavrix Bank account.')
  return `https://wa.me/${formattedPhone.value}?text=${text}`
})

const { data: initialSettings } = await useAsyncData('whatsapp-settings', () => $fetch<any>('/api/settings'), {
  default: () => null
})

if (initialSettings.value?.data) {
  const payload = initialSettings.value.data?.data ?? initialSettings.value.data
  const targetNum = payload?.whatsappNumber || payload?.supportPhone
  if (targetNum) {
    rawPhone.value = targetNum
  }
}

const fetchSettings = async () => {
  try {
    const res = await $fetch<any>('/api/settings')
    if (res?.success && res?.data) {
      const data = res.data?.data ?? res.data
      const targetNum = data.whatsappNumber || data.supportPhone
      if (targetNum) {
        rawPhone.value = targetNum
      }
    }
  } catch {
    // Fallback quietly to default
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.whatsapp-widget-container {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.whatsapp-btn {
  position: relative;
  width: 58px;
  height: 58px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(18, 140, 126, 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  text-decoration: none;
}

.whatsapp-icon {
  width: 32px;
  height: 32px;
  transition: transform 0.3s ease;
  z-index: 2;
}

/* Tooltip / Bubble */
.widget-tooltip {
  position: absolute;
  left: 74px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tooltip-status {
  width: 8px;
  height: 8px;
  background-color: #25D366;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 6px #25D366;
}

/* Hover States */
.whatsapp-btn:hover {
  transform: scale(1.08) translateY(-2px);
  box-shadow: 0 6px 20px rgba(18, 140, 126, 0.6);
}

.whatsapp-btn:hover .whatsapp-icon {
  transform: rotate(8deg) scale(1.05);
}

.whatsapp-btn:hover .widget-tooltip {
  opacity: 1;
  transform: translateX(0);
}

/* Ripple animations */
.ripple-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: rgba(37, 211, 102, 0.4);
  animation: pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  z-index: 0;
}

.ripple-glow.secondary {
  animation-delay: 1.25s;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.4);
    opacity: 0;
  }
  100% {
    transform: scale(0.95);
    opacity: 0;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .whatsapp-widget-container {
    bottom: 20px;
    left: 20px;
  }

  .whatsapp-btn {
    width: 52px;
    height: 52px;
  }

  .whatsapp-icon {
    width: 28px;
    height: 28px;
  }

  /* Adjust offset if user is inside the dashboard layout to avoid covering bottom tabs */
  .whatsapp-widget-container.in-dashboard {
    bottom: 84px;
    left: 20px;
  }

  .widget-tooltip {
    display: none; /* Hide tooltip on small mobile screens to keep view clean */
  }
}
</style>

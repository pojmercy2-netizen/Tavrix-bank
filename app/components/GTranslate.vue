<template>
  <div class="gtranslate_wrapper" :class="{ 'in-dashboard': isDashboard }"></div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

const route = useRoute()
const isDashboard = computed(() => route.path.startsWith('/dashboard'))

onMounted(() => {
  if (typeof window === 'undefined') return

  const initGTranslate = () => {
    (window as any).gtranslateSettings = {
      default_language: 'en',
      wrapper_selector: '.gtranslate_wrapper',
      flag_style: '3d',
      switcher_horizontal_position: 'inline'
    }

    if (!document.querySelector('script[src*="gtranslate"]')) {
      const script = document.createElement('script')
      script.src = 'https://cdn.gtranslate.net/widgets/latest/float.js'
      script.defer = true
      document.body.appendChild(script)
    }
  }

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(initGTranslate)
  } else {
    setTimeout(initGTranslate, 1200)
  }
})
</script>

<style>
/* Position the GTranslate float widget neatly above the WhatsApp button */
.gtranslate_wrapper {
  position: fixed !important;
  bottom: 92px !important;
  left: 24px !important;
  z-index: 9998 !important;
  right: auto !important;
}

#gt_float_wrapper {
  position: static !important;
  bottom: auto !important;
  left: auto !important;
  right: auto !important;
  top: auto !important;
  z-index: auto !important;
}

/* Reduced, compact styling for GTranslate float widget */
.gt_float_switcher {
  font-family: inherit !important;
  font-size: 13px !important;
  line-height: 16px !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.gt_float_switcher img {
  width: 20px !important;
  height: auto !important;
  margin: 0 5px 0 0 !important;
  border-radius: 2px !important;
  vertical-align: middle !important;
}

.gt_float_switcher .gt-selected .gt-current-lang {
  padding: 5px 9px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #1e293b !important;
  display: flex !important;
  align-items: center !important;
}

.gt_float_switcher .gt-selected .gt-current-lang span.gt-lang-code {
  position: static !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px !important;
  text-transform: uppercase !important;
}

.gt_float_switcher .gt-selected .gt-current-lang span.gt_float_switcher-arrow {
  width: 12px !important;
  height: 16px !important;
  background-size: 9px !important;
  margin-left: 3px !important;
}

.gt_float_switcher .gt_options {
  max-height: 220px !important;
  min-width: 145px !important;
  border-radius: 8px 8px 0 0 !important;
  background: #ffffff !important;
}

.gt_float_switcher .gt_options a {
  padding: 6px 10px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  color: #334155 !important;
  display: flex !important;
  align-items: center !important;
  white-space: nowrap !important;
  text-decoration: none !important;
  transition: background-color 0.15s, color 0.15s !important;
}

.gt_float_switcher .gt_options a:hover {
  background-color: #f1f5f9 !important;
  color: #0055e0 !important;
}

.gt_float_switcher .gt_options a img {
  width: 18px !important;
  margin: 0 7px 0 0 !important;
  flex-shrink: 0 !important;
}

@media (max-width: 768px) {
  .gtranslate_wrapper {
    bottom: 84px !important;
    left: 20px !important;
  }
  .gtranslate_wrapper.in-dashboard {
    bottom: 148px !important;
    left: 20px !important;
  }
}
</style>

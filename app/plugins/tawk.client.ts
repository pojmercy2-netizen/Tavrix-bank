export default defineNuxtPlugin(() => {
  // Only run on the client side (file is already .client.ts but guard just in case)
  if (typeof window === 'undefined') return

  // Avoid loading twice on hot-reload
  if (document.querySelector('script[src*="tawk.to"]')) return

  // Initialise Tawk globals
  ;(window as any).Tawk_API = (window as any).Tawk_API || {}
  ;(window as any).Tawk_LoadStart = new Date()

  const s1 = document.createElement('script')
  const s0 = document.getElementsByTagName('script')[0]

  s1.async = true
  s1.src = 'https://embed.tawk.to/6a4a38f58f99461d47cf6e21/1jsout0ho'
  s1.charset = 'UTF-8'
  s1.setAttribute('crossorigin', '*')

  s0.parentNode?.insertBefore(s1, s0)
})

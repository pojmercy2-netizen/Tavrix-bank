export default defineNuxtPlugin(() => {
  // Only run on the client side (file is already .client.ts but guard just in case)
  if (typeof window === 'undefined') return

  // Avoid loading twice on hot-reload
  if (document.querySelector('script[src*="tawk.to"]')) return

  const loadTawk = () => {
    if (document.querySelector('script[src*="tawk.to"]')) return

      // Initialise Tawk globals
      ; (window as any).Tawk_API = (window as any).Tawk_API || {}
      ; (window as any).Tawk_LoadStart = new Date()

    const s1 = document.createElement('script')
    s1.async = true
    s1.src = 'https://embed.tawk.to/6acc677aa9a1ef34c6bd58e3/1k4n78e23'
    s1.charset = 'UTF-8'
    s1.setAttribute('crossorigin', '*')

    const s0 = document.getElementsByTagName('script')[0]
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0)
    } else {
      document.head.appendChild(s1)
    }
  }

  // Defer loading until after main thread and critical assets have settled
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      setTimeout(loadTawk, 2000)
    })
  } else {
    window.addEventListener('load', () => {
      setTimeout(loadTawk, 2000)
    })
  }
})

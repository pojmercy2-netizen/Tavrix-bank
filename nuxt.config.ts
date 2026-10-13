// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  devtools: {
    enabled: false
  },

  runtimeConfig: {
    // Server-only secrets (never exposed to client)
    databaseUrl: process.env.DATABASE_URL || '',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'tavrix-access-secret-change-me',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'tavrix-refresh-secret-change-me',
    jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    jwtRefreshExpiryRememberMe: process.env.JWT_REFRESH_EXPIRY_REMEMBER_ME || '30d',
    // Public (safe to expose)
    public: {
      appName: 'Tavrix Bank'
    }
  },

  routeRules: {
    '/resources': { redirect: '/' },
    '/resources/**': { redirect: '/' },
    '/api/settings': { cache: false },
    '/api/health': { swr: 30 }
  },

  nitro: {
    compressPublicAssets: true
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2025-01-15',

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'tavrix-color-mode-v2'
  },

  app: {
    head: {
      title: 'Tavrix Bank — Bank Smarter. Live Better.',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Tavrix Bank is a secure, premium digital banking platform designed to help you manage today and build for tomorrow.' },
        { name: 'theme-color', content: '#0A192F' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' }
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})

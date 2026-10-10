export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const token = localStorage.getItem('authToken')
  const userStr = localStorage.getItem('user')
  let user: any = null
  if (userStr) {
    try {
      user = JSON.parse(userStr)
    } catch {
      user = null
    }
  }

  // 1. If accessing user dashboard paths
  if (to.path.startsWith('/dashboard')) {
    if (!token || !user) {
      return navigateTo('/login')
    }
  }

  // 2. If accessing admin paths
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!token || !user || !user.isAdmin) {
      return navigateTo('/admin/login')
    }
  }
})

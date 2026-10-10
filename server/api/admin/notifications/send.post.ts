// Compatibility alias: admin/notifications.vue calls POST /admin/notifications/send
// Lazy dynamic import avoids Nitro/Rollup TDZ bundling issues with same-chunk re-exports
export default defineEventHandler(async (event) => {
  const mod = await import('./index.post')
  return (mod.default as any)(event)
})

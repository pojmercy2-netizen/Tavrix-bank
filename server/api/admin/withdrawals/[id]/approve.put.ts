// Compatibility alias: admin/transactions.vue calls PUT /admin/withdrawals/:id/approve
// Lazy dynamic import avoids Nitro/Rollup TDZ bundling issues with same-chunk re-exports
export default defineEventHandler(async (event) => {
  const mod = await import('../../transactions/[id]/approve.put')
  return (mod.default as any)(event)
})

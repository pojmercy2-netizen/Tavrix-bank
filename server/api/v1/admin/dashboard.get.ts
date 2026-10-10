export default defineEventHandler(async (event) => {
  const mod = await import('../../admin/dashboard.get')
  return (mod.default as any)(event)
})

export default defineEventHandler(async (event) => {
  const mod = await import('../../../admin/users/index.get')
  return (mod.default as any)(event)
})

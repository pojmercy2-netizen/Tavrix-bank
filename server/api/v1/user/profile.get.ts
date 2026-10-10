export default defineEventHandler(async (event) => {
  const mod = await import('../../dashboard/profile/index.get')
  return (mod.default as any)(event)
})

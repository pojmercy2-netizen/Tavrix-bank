export default defineEventHandler(async (event) => {
  const mod = await import('../../dashboard/account/balance.get')
  return (mod.default as any)(event)
})

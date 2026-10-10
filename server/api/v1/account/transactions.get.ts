export default defineEventHandler(async (event) => {
  const mod = await import('../../dashboard/account/transactions.get')
  return (mod.default as any)(event)
})

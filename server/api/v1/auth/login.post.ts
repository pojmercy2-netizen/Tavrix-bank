export default defineEventHandler(async (event) => {
  const mod = await import('../../auth/login.post')
  return (mod.default as any)(event)
})

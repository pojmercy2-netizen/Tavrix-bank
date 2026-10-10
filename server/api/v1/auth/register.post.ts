export default defineEventHandler(async (event) => {
  const mod = await import('../../auth/register.post')
  return (mod.default as any)(event)
})

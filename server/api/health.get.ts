export default defineEventHandler(() => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Tavrix Bank API Service'
  }
})

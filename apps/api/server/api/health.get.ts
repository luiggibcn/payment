// apps/api/server/api/health.get.ts
export default defineEventHandler(() => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

export default defineEventHandler(async (event) => {
  const player = await getDoc('players', getRouterParam(event, 'id') || '')
  const m = /^data:(image\/[a-z]+);base64,(.+)$/.exec(String(player?.photo || ''))
  if (!m) throw createError({ statusCode: 404, message: 'No photo' })
  setHeader(event, 'Content-Type', m[1]!)
  // URLs carry ?v=<createdAt> and a registration photo never changes, so cache hard.
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return Buffer.from(m[2]!, 'base64')
})

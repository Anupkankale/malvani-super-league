// Organiser-only write, matching LeagueStore.update().
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const collection = assertCollection(getRouterParam(event, 'collection'))
  const id = getRouterParam(event, 'id') || ''
  if (!/^[\w-]{1,64}$/.test(id)) throw createError({ statusCode: 400, message: 'Invalid id' })
  const body = await readBody(event)
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw createError({ statusCode: 400, message: 'Invalid body' })
  await patchDoc(collection, id, body)
  return { ok: true }
})

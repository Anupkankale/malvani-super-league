// Organiser-only write, matching LeagueStore.remove().
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const collection = assertCollection(getRouterParam(event, 'collection'))
  const id = getRouterParam(event, 'id') || ''
  if (!/^[\w-]{1,64}$/.test(id)) throw createError({ statusCode: 400, message: 'Invalid id' })
  await deleteDoc(collection, id)
  return { ok: true }
})

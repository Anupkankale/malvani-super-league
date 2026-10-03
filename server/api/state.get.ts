// Everything the site shows, in one response. Clients poll with ?v=<last version> and get
// { unchanged: true } (one row read) until something is written.
export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const v = await getVersion()
  if (Number(getQuery(event).v) === v) return { unchanged: true }

  const isAdmin = !!(await getUserSession(event)).user
  const [teams, players, meta] = await Promise.all([listDocs('teams'), listDocs('players'), listDocs('meta')])

  return {
    v,
    teams,
    meta,
    // Photos are served separately (cacheable); mobile numbers are for organisers only.
    players: players.map(({ photo, mobile, ...p }) => ({
      ...p,
      ...(isAdmin ? { mobile } : {}),
      photo: photo ? `api/photos/${p.id}?v=${p.createdAt || 0}` : '',
    })),
  }
})

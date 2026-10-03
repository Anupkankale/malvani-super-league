// Player registration. Public callers always create a pending entry; a signed-in organiser
// can add players straight into the auction pool.
export default defineEventHandler(async (event) => {
  const isAdmin = !!(await getUserSession(event)).user
  const body = await readBody<Record<string, any>>(event)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, message: 'Invalid request.' })

  const settingsDoc = await getDoc('meta', 'settings')
  const settings = { ...DEFAULT_SETTINGS, ...(settingsDoc || {}) }
  if (!isAdmin && !settings.registrationOpen)
    throw createError({ statusCode: 403, message: 'Registration is closed for this season.' })

  const players = await listDocs('players')
  const errors = validatePlayer(body as PlayerForm, players as Player[], isAdmin)
  const photo = String(body.photo || '')
  if (!errors.photo && (!photo.startsWith('data:image/jpeg;base64,') || photo.length * 0.75 > PHOTO_MAX_BYTES))
    errors.photo = 'That photo could not be used. Try another one.'
  if (Object.keys(errors).length) throw createError({ statusCode: 400, message: 'Check the form.', data: { errors } })

  let regNo = makeRegNo()
  while (players.some((p) => p.regNo === regNo)) regNo = 'MSL-' + Math.random().toString(36).slice(2, 7).toUpperCase()

  const id = newId()
  const rec = {
    name: String(body.name).trim(),
    mobile: String(body.mobile).trim(),
    age: Number(body.age),
    role: String(body.role),
    battingStyle: BAT.includes(body.battingStyle) ? body.battingStyle : BAT[0],
    bowlingStyle: BOWL.includes(body.bowlingStyle) ? body.bowlingStyle : BOWL[BOWL.length - 1],
    previousTeam: String(body.previousTeam || '').trim().slice(0, 80),
    photo,
    regNo,
    status: isAdmin ? 'approved' : 'pending',
    basePrice: Number(settings.basePrice),
    createdAt: Date.now(),
  }
  await putDoc('players', id, rec)
  return { ...rec, id }
})

import { createHash, timingSafeEqual } from 'node:crypto'

const digest = (s: string) => createHash('sha256').update(s).digest()

export default defineEventHandler(async (event) => {
  const { adminUsername, adminPassword } = useRuntimeConfig(event)
  if (!adminPassword) throw createError({ statusCode: 500, message: 'NUXT_ADMIN_PASSWORD is not set on the server.' })

  const { username, password } = (await readBody<{ username?: string; password?: string }>(event)) || {}
  const ok =
    timingSafeEqual(digest(String(username ?? '').trim()), digest(adminUsername)) &&
    timingSafeEqual(digest(String(password ?? '')), digest(adminPassword))
  if (!ok) throw createError({ statusCode: 401, message: 'Wrong username or password. Try again.' })

  await setUserSession(event, { user: { name: adminUsername } })
  return { ok: true }
})

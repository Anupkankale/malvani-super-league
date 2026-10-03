import type { Auction, Player, Settings, Team, TeamStat } from '#shared/utils/league'

type Collection = 'teams' | 'players' | 'meta'
type Row = { id: string } & Record<string, any>

/** Storage adapter used by every page and component; backed by the server/api routes. */
export interface LeagueStore {
  mode: 'shared'
  subscribe(collection: Collection, cb: (rows: Row[]) => void): () => void
  set(collection: Collection, id: string, data: Record<string, any>): Promise<void>
  update(collection: Collection, id: string, patch: Record<string, any>): Promise<void>
  remove(collection: Collection, id: string): Promise<void>
  /** Saves a new player registration and returns the stored record (with its final regNo). */
  register(rec: Omit<Player, 'id'> & { agree?: boolean }): Promise<Player>
  /** Re-reads data now; `force` skips the unchanged-version shortcut (e.g. after login). */
  refresh(force?: boolean): Promise<void>
}

const FAST_POLL_MS = 3000
const SLOW_POLL_MS = 10000

function createApiStore(fast: () => boolean): LeagueStore {
  const listeners = new Map<Collection, Set<(rows: Row[]) => void>>()
  const data: Record<Collection, Row[]> = { teams: [], players: [], meta: [] }
  let version = -1
  let timer: ReturnType<typeof setTimeout> | undefined
  let inflight: Promise<void> | null = null

  const emit = (c: Collection) => listeners.get(c)?.forEach((cb) => cb(data[c]))

  async function poll(force = false) {
    const res = await $fetch<any>('api/state', { query: force ? {} : { v: version } })
    if (res.unchanged) return
    version = res.v
    for (const c of ['teams', 'players', 'meta'] as const) {
      data[c] = res[c]
      emit(c)
    }
  }

  // One poller for all collections: fast while an auction is live, on the Auction page,
  // or for a signed-in organiser; slow otherwise; paused while the tab is hidden.
  function schedule() {
    clearTimeout(timer)
    if (document.hidden) return
    timer = setTimeout(() => refresh(), fast() ? FAST_POLL_MS : SLOW_POLL_MS)
  }

  // Every read (timer, navigation, after a write) restarts the timer, so the interval
  // always matches the current page and auction state.
  function refresh(force = false): Promise<void> {
    if (inflight && !force) return inflight
    clearTimeout(timer)
    inflight = poll(force)
      .catch(() => {}) // offline or server hiccup: keep showing the last data and try again
      .finally(() => {
        inflight = null
        schedule()
      })
    return inflight
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh()
    else clearTimeout(timer)
  })
  refresh(true)

  // After a write, re-read straight away so the organiser sees it without waiting.
  const write = async (req: Promise<unknown>) => {
    await req
    await refresh(true)
  }
  const url = (c: Collection, id: string) => `api/admin/${c}/${encodeURIComponent(id)}`
  // Plain-typed fetch: Nitro's typed-route inference can't resolve these dynamic URLs.
  const send = $fetch as (url: string, opts: { method: 'PUT' | 'PATCH' | 'DELETE'; body?: object }) => Promise<unknown>

  return {
    mode: 'shared',
    subscribe(c, cb) {
      if (!listeners.has(c)) listeners.set(c, new Set())
      listeners.get(c)!.add(cb)
      cb(data[c])
      return () => listeners.get(c)!.delete(cb)
    },
    set: (c, id, d) => write(send(url(c, id), { method: 'PUT', body: d })),
    update: (c, id, p) => write(send(url(c, id), { method: 'PATCH', body: p })),
    remove: (c, id) => write(send(url(c, id), { method: 'DELETE' })),
    async register(rec) {
      const saved = await $fetch<Player>('api/players', { method: 'POST', body: rec })
      refresh(true)
      return saved
    },
    refresh: (force) => refresh(force),
  }
}

function createStore(): LeagueStore {
  const router = useRouter()
  const api = createApiStore(
    () => auction.value.status === 'live' || isAdmin.value || router.currentRoute.value.path === '/auction',
  )
  router.afterEach(() => api.refresh()) // fresh data on every page change
  return api
}

// Module-level singleton: the app is client-only (ssr: false), so one store per tab.
let store: LeagueStore | null = null
const teamsRaw = shallowRef<Team[]>([])
const players = shallowRef<Player[]>([])
const meta = shallowRef<Row[]>([])
// Mirrors the server session (nuxt-auth-utils); kept in sync in useLeague().
const isAdmin = ref(false)

function init() {
  if (store) return
  store = createStore()
  store.subscribe('teams', (r) => (teamsRaw.value = r as Team[]))
  store.subscribe('players', (r) => (players.value = r as Player[]))
  store.subscribe('meta', (r) => (meta.value = r))
}

const settings = computed<Settings>(() => ({
  ...DEFAULT_SETTINGS,
  ...((meta.value.find((m) => m.id === 'settings') as Partial<Settings>) || {}),
}))

const auction = computed<Auction>(
  () => (meta.value.find((m) => m.id === 'auction') as unknown as Auction) || { status: 'idle' },
)

const teams = computed(() => [...teamsRaw.value].sort((a, b) => a.name.localeCompare(b.name)))

const stats = computed<TeamStat[]>(() =>
  teams.value.map((team) => {
    const bought = players.value.filter((p) => p.status === 'sold' && p.soldTo === team.id)
    const spent = bought.reduce((s, p) => s + Number(p.soldPrice || 0), 0)
    return { team, count: bought.length, spent, left: Number(team.purse ?? settings.value.purse) - spent }
  }),
)

export function useLeague() {
  const session = useUserSession()
  isAdmin.value = session.loggedIn.value
  init()

  /** Signs the organiser in on the server; throws (401) on a wrong username or password. */
  async function login(username: string, password: string) {
    await $fetch('api/auth/login', { method: 'POST', body: { username, password } })
    await session.fetch()
    isAdmin.value = true
    await store!.refresh(true) // reload with organiser-only fields (mobile numbers)
  }

  async function logout() {
    await session.clear()
    isAdmin.value = false
    await store!.refresh(true)
  }

  return {
    store: store!,
    teams,
    players,
    settings,
    auction,
    stats,
    isAdmin: computed(() => session.loggedIn.value),
    login,
    logout,
    isLive: computed(() => auction.value.status === 'live'),
  }
}

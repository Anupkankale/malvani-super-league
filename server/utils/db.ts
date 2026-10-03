import { mkdirSync } from 'node:fs'
import { createClient, type Client, type InStatement } from '@libsql/client'

export const COLLECTIONS = ['teams', 'players', 'meta'] as const
export type Collection = (typeof COLLECTIONS)[number]
export type Doc = { id: string } & Record<string, any>

let client: Client | null = null
let ready: Promise<void> | null = null

function getClient() {
  if (client) return client
  const url = process.env.TURSO_DATABASE_URL
  if (url) {
    client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
  } else {
    // Local dev: a plain SQLite file, no account needed.
    mkdirSync('.data', { recursive: true })
    client = createClient({ url: 'file:.data/msl.db' })
  }
  return client
}

const bump: InStatement = 'UPDATE version SET v = v + 1 WHERE id = 1'

/** Returns the client after creating tables and, on the very first run, seeding demo data. */
export async function useDb() {
  const db = getClient()
  ready ||= (async () => {
    await db.batch(
      [
        'CREATE TABLE IF NOT EXISTS docs (collection TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY (collection, id))',
        'CREATE TABLE IF NOT EXISTS version (id INTEGER PRIMARY KEY CHECK (id = 1), v INTEGER NOT NULL)',
      ],
      'write',
    )
    const first = await db.execute('INSERT OR IGNORE INTO version (id, v) VALUES (1, 1)')
    if (first.rowsAffected === 1) {
      const seed: [Collection, string, object][] = [
        ...DEMO_TEAMS.map(({ id, ...t }) => ['teams', id, { ...t, purse: DEFAULT_SETTINGS.purse }] as [Collection, string, object]),
        ['meta', 'settings', DEFAULT_SETTINGS],
        ['meta', 'auction', { status: 'idle' }],
      ]
      await db.batch(
        seed.map(([c, id, d]) => ({
          sql: 'INSERT OR IGNORE INTO docs (collection, id, data) VALUES (?, ?, ?)',
          args: [c, id, JSON.stringify(d)],
        })),
        'write',
      )
    }
  })().catch((e) => {
    ready = null // retry on the next request
    throw e
  })
  await ready
  return db
}

export async function getVersion() {
  const db = await useDb()
  const r = await db.execute('SELECT v FROM version WHERE id = 1')
  return Number(r.rows[0]?.v ?? 0)
}

export async function listDocs(collection: Collection): Promise<Doc[]> {
  const db = await useDb()
  const r = await db.execute({ sql: 'SELECT id, data FROM docs WHERE collection = ?', args: [collection] })
  return r.rows.map((row) => ({ ...JSON.parse(String(row.data)), id: String(row.id) }))
}

export async function getDoc(collection: Collection, id: string): Promise<Doc | null> {
  const db = await useDb()
  const r = await db.execute({ sql: 'SELECT data FROM docs WHERE collection = ? AND id = ?', args: [collection, id] })
  return r.rows[0] ? { ...JSON.parse(String(r.rows[0].data)), id } : null
}

export async function putDoc(collection: Collection, id: string, data: object) {
  const db = await useDb()
  const { id: _drop, ...rest } = data as Doc
  await db.batch(
    [
      {
        sql: 'INSERT INTO docs (collection, id, data) VALUES (?, ?, ?) ON CONFLICT (collection, id) DO UPDATE SET data = excluded.data',
        args: [collection, id, JSON.stringify(rest)],
      },
      bump,
    ],
    'write',
  )
}

/** Shallow-merges `patch` into the stored document (same semantics as the old localStorage store). */
export async function patchDoc(collection: Collection, id: string, patch: object) {
  const db = await useDb()
  const tx = await db.transaction('write')
  try {
    const r = await tx.execute({ sql: 'SELECT data FROM docs WHERE collection = ? AND id = ?', args: [collection, id] })
    const current = r.rows[0] ? JSON.parse(String(r.rows[0].data)) : {}
    const { id: _drop, ...rest } = patch as Doc
    await tx.execute({
      sql: 'INSERT INTO docs (collection, id, data) VALUES (?, ?, ?) ON CONFLICT (collection, id) DO UPDATE SET data = excluded.data',
      args: [collection, id, JSON.stringify({ ...current, ...rest })],
    })
    await tx.execute(bump)
    await tx.commit()
  } finally {
    tx.close()
  }
}

export async function deleteDoc(collection: Collection, id: string) {
  const db = await useDb()
  await db.batch([{ sql: 'DELETE FROM docs WHERE collection = ? AND id = ?', args: [collection, id] }, bump], 'write')
}

export function assertCollection(c: unknown): Collection {
  if (!COLLECTIONS.includes(c as Collection)) throw createError({ statusCode: 404, message: 'Unknown collection' })
  return c as Collection
}

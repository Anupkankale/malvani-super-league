# Malvani Super League (Nuxt)

Nuxt 4 port of the original single-file React site in `../Malvanisuperleague/index.html`.
Player registration, a live auction board, and an admin panel for running the auction —
with a small backend (Nuxt server routes + SQLite/Turso) so every phone sees the same data.

## Run locally

```bash
cp .env.example .env   # then set NUXT_ADMIN_PASSWORD and NUXT_SESSION_PASSWORD
npm install
npm run dev            # http://localhost:3000
```

Locally the database is a file, `.data/msl.db`, created and seeded with the 6 demo teams on first
request. Delete it (with the dev server stopped) to start fresh.

## Deploy for free (Vercel + Turso)

1. **Database** — create a free [Turso](https://turso.tech) account, then:
   ```bash
   turso db create msl
   turso db show msl --url        # -> TURSO_DATABASE_URL (libsql://…)
   turso db tokens create msl     # -> TURSO_AUTH_TOKEN
   ```
2. **Hosting** — push this folder to GitHub and import the repo at [vercel.com/new](https://vercel.com/new)
   (Hobby plan, free). Vercel detects Nuxt automatically.
3. **Environment variables** (Vercel → Project → Settings → Environment Variables):

   | Name | Value |
   |---|---|
   | `TURSO_DATABASE_URL` | from step 1 |
   | `TURSO_AUTH_TOKEN` | from step 1 |
   | `NUXT_ADMIN_USERNAME` | `admin` (or your choice) |
   | `NUXT_ADMIN_PASSWORD` | a strong password |
   | `NUXT_SESSION_PASSWORD` | 32+ random characters, e.g. `openssl rand -hex 24` |

4. Redeploy. The first request creates the tables and demo teams.
5. Update `SITE_URL` in `nuxt.config.ts` to your Vercel URL so share previews point at it.

## How the backend works

| Route | Who | What |
|---|---|---|
| `GET /api/state?v=N` | everyone | All teams, players and settings. Returns `{unchanged:true}` if nothing changed since version N. Mobile numbers only for the organiser. |
| `POST /api/players` | everyone | Registration. Validated on the server (same rules as the form, plus duplicate mobile and "registration closed"). |
| `GET /api/photos/:id` | everyone | Player photo, cached by the browser. |
| `POST /api/auth/login`, `/logout` | — | Organiser login; sets an encrypted httpOnly cookie. |
| `PUT/PATCH/DELETE /api/admin/:collection/:id` | organiser only | All admin changes (approve, bids, teams, settings). |

The browser polls `/api/state` every 3 s on the Auction page, during a live auction, or when the
organiser is signed in, and every 10 s otherwise (paused when the tab is hidden), so bids appear on
every phone within a few seconds.

Code: `server/` (API + `server/utils/db.ts`), `shared/utils/league.ts` (types, constants and
validation used by both sides), `app/composables/useLeague.ts` (client store).

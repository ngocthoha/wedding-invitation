# Session Handoff

## Current Objective

- Goal: Full-stack local recreation of `https://ngaychungdoi.com/` (Frontend on `http://localhost:3000`, Backend API on `http://localhost:3008`) with a validated 5-subsystem agent harness.
- Current status: **ALL FEATURES COMPLETE** — `feat-001` through `feat-008` done and verified.
- Branch / commit: `main` (`2d6cd60`) pushed to `https://github.com/ngocthoha/wedding-invitation.git`
- Deployment: Connected to Vercel project `wedding-invitation` (auto-build triggered on push to `main`). Guide at `docs/DEPLOYMENT_GUIDE.md`.

## Completed This Session (2026-11-18 21:49)

- [x] `feat-008`: Supabase Database Migration & Vercel Serverless Deployment Adapter — DONE
  - Provisioned and seeded Supabase project `wedding-invitation` (`rwudhtiqamsdietodurx`) with 7 tables (`app_state`, `users`, `templates`, `cards`, `guests`, `rsvps`, `guestbook`)
  - Created `apps/api/src/supabase-store.js`, `supabase/migrations/20261118000000_init_wedding_schema.sql`, `api/index.js`, `vercel.json`, and `.env.example`
  - Updated `apps/api/src/index.js` and `apps/web/src/server.js` for Vercel serverless + Supabase persistence with local `db.json` fallback

## Verification Evidence

| Check | Command | Result | Notes |
|---|---|---|---|
| Static Syntax Check | `npm run check` | PASS (exit 0) | Checks API, Web Server, Client Engine, and Verify script |
| E2E FE + BE Verification | `npm test` | PASS (exit 0) | Verifies assets, `:3008` REST API, and `:3000` 3D routes |
| Harness Validation | `npm run validate:harness` | PASS (100/100) | All 5 subsystems (`instructions`, `state`, `verification`, `scope`, `lifecycle`) score 5/5 |
| REA Full Desktop Scenario | `rea:capture_browser_scenario` | PASS (19/19 steps) | Evidence ID `ev_5ba20cbe0fd90db2ada211790172f7541976b060f0b2ced7502180656d91a124` |
| REA Wedding Card & 3D Envelope Scenario | `rea:capture_browser_scenario` | PASS (8/8 steps) | Evidence ID `ev_4dc186147324f5e92217aee4996b7820e634d3f14c6366246abf9b52491a8a96` |

## Files Changed

- `AGENTS.md`
- `feature_list.json`
- `progress.md`
- `session-handoff.md`
- `init.sh`
- `scripts/verify-harness.mjs`
- `package.json`
- `apps/api/src/index.js`
- `apps/api/src/seed-data.js`
- `apps/web/src/server.js`
- `apps/web/public/app-client.js`

## Decisions Made

- Kept zero external runtime dependencies for `apps/api` and `apps/web` so `node` can start both servers instantaneously and deterministically.
- Built `scripts/verify-harness.mjs` to automatically spawn ephemeral API/Web instances if ports `3008`/`3000` are not already listening, making `./init.sh` self-contained.

## Blockers / Risks

- None.

## Next Session Startup

1. Read `AGENTS.md`.
2. Read `feature_list.json` and `progress.md`.
3. Review this handoff (`session-handoff.md`).
4. Run `./init.sh` before editing.

## Recommended Next Step

- Pick `feat-007` ("Interactive Card Builder Live Section Reordering & Custom Photo Upload") from `feature_list.json` and implement drag-and-drop section ordering in `/builder/:id`.

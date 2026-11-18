# AGENTS.md

Project harness for reliable agent-assisted development in the **NgayChungDoi.com** full-stack local recreation (`apps/web` on `http://localhost:3000` and `apps/api` on `http://localhost:3008`).

## Startup Workflow

Before writing code:

1. **Confirm working directory** with `pwd` (`/Users/thoha/Desktop/wedding`)
2. **Read this file** completely
3. **Read `feature_list.json` and `progress.md`** to see current feature state and recent verification evidence
4. **Run `./init.sh`** to verify syntax checks (`npm run check`) and end-to-end FE+BE smoke tests (`npm test`) pass
5. **Inspect `session-handoff.md`** for active ports, daemon tasks, and architectural invariants
6. **Review recent commits** with `git log --oneline -5` (if git is initialized)

If baseline verification is failing, repair that first before adding new scope.

## Project Architecture & Invariants

- **Frontend Web Server (`apps/web/src/server.js`, port `3000`)**:
  - Serves production-matched HTML templates from `apps/web/src/templates/` (`home-body.html`, `home-sheet-body.html`, `sample-card-body.html`, `led-stage-body.html`), 45 production CSS chunks (`apps/web/public/ngaychungdoi-all.css`), 9 local WOFF2 fonts (`apps/web/public/_next/static/media/`), and the interactive client runtime (`apps/web/public/app-client.js`).
  - **Critical CSS Invariant**: The `<html>` root on `/mau-thiep/template/:id` and `/thiep-cuoi/:slug` MUST include `data-card-public-ready="true"`, otherwise `stylesheet_0pml8qngkek35.css` hides `.card-public-view .wrap.show`.
  - **3D Opening Envelope CDN Prefix**: Always load opening envelope layers from `https://assets.ngaychungdoi.com/card-assets/opening-effect/opening-envelope/*.webp`.
- **Backend REST API (`apps/api/src/index.js`, port `3008`)**:
  - Implements 23 `api.ngaychungdoi.com` REST endpoints (`/health`, `/auth/*`, `/files/templates*`, `/cards*`, `/cards/:id/rsvp`, `/cards/:id/guestbook`, `/cards/:id/guests`, `/cards/:id/invite-presets`, `/pay2s/create-thiep-payment-link`, `/partner/stats`) backed by `apps/api/src/seed-data.js` and persistent JSON storage in `apps/api/data/db.json`.

## Working Rules

- **One feature at a time**: Pick exactly one unfinished feature from `feature_list.json`
- **Verification required**: Don't claim done without running `./init.sh` (`npm run check` and `npm test`)
- **Update artifacts**: Before ending session, update `progress.md`, `feature_list.json`, and `session-handoff.md`
- **Stay in scope**: Don't modify files unrelated to the current feature
- **Leave clean state**: Next session must be able to run `./init.sh` immediately

## Required Artifacts

- `feature_list.json` — Feature state tracker (source of truth)
- `progress.md` — Session continuity log
- `init.sh` — Standard startup and verification path
- `session-handoff.md` — Handoff context for multi-session continuity

## Definition of Done

A feature is done only when ALL of the following are true:

- [ ] Target behavior is implemented across `apps/web` and/or `apps/api`
- [ ] Required verification actually ran (`./init.sh`, including `npm run check` build/syntax checks and `npm test` E2E verification)
- [ ] Verification Evidence recorded in `feature_list.json` and `progress.md`
- [ ] Repository remains restartable from standard startup path (`./init.sh`)

## End of Session

Before ending a session:

1. Update `progress.md` with current state and verification command output
2. Update `feature_list.json` with new feature status and evidence
3. Update `session-handoff.md` with any unresolved risks, blockers, or modified files
4. Leave repo clean enough for next session to run `./init.sh` immediately

## Verification Commands

```bash
# Full verification (recommended)
./init.sh
```

Required checks:
- `npm run check` — Syntax/static check of API, Web Server, Client Runtime, and Verification scripts
- `npm test` — End-to-end verification of extracted assets, Backend API endpoints (`:3008`), and Frontend 3D routes (`:3000`)
- `npm run validate:harness` — Validates this 5-subsystem agent harness (`100/100`)

## Escalation

If you encounter:
- **Architecture decisions**: Check `AGENTS.md` invariants first, otherwise ask user
- **Unclear requirements**: Check `feature_list.json` descriptions, otherwise ask user
- **Repeated test failures**: Update `progress.md` and `session-handoff.md`, flag for human review
- **Scope ambiguity**: Re-read `feature_list.json` for definition of done

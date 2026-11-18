# NgayChungDoi Wedding Invitation Platform

A full-stack recreation of the [NgayChungDoi.com](https://ngaychungdoi.com) digital wedding invitation and event management platform.

Features high-fidelity production-matched styling, 3D interactive opening envelope effects, live RSVP and guestbook management, responsive wedding card builder/editor, and dual storage supporting both local JSON and cloud Supabase PostgreSQL.

---

## ✨ Features

- **3D Coverflow Hero Showcase**: Interactive 3D wedding card presentation on the homepage.
- **Card Builder / Editor (`/card/create/form`)**: 23 collapsible editing sections with live mobile phone preview, photo uploads, event schedules, story timelines, and gift bank info.
- **3D Interactive Envelope Reveal (`/mau-thiep/template/:id`)**:
  - Royal red wax seal break (`囍`) animation
  - 5-layer 3D opening envelope sequence
  - Complete 12-section wedding invitation card reveal
- **LED Stage & Nebula Display (`/man-hinh-led-dam-cuoi`)**: Fullscreen 3D LED stage view with canvas nebula particles for wedding reception backdrops.
- **Template Catalog (`/mau-thiep`)**: Browse 20 curated wedding card templates categorized by style (Modern, Minimalist, Traditional, Vintage, Luxury).
- **Guest & Invitation Management**: Guest list creation, personalized invite link presets, RSVP tracking, and guestbook wishes.
- **Dual Persistence Architecture**:
  - **Local Development**: Fast zero-dependency persistent JSON storage (`apps/api/data/db.json`).
  - **Production / Cloud**: Supabase PostgreSQL database integration with automated PostgREST sync (`apps/api/src/supabase-store.js`).
- **Serverless Ready**: Configured for instant deployment on [Vercel](https://vercel.com) via `vercel.json` and `api/index.js`.

---

## 🏗️ Architecture

```
├── api/
│   └── index.js                   # Vercel serverless API & Web entrypoint
├── apps/
│   ├── api/                       # REST API service (Port 3008)
│   │   └── src/
│   │       ├── index.js           # Express API router (23 endpoints)
│   │       ├── seed-data.js       # Production seed fixtures (templates, users, cards)
│   │       └── supabase-store.js  # Supabase PostgREST sync adapter
│   └── web/                       # Frontend Web server & client runtime (Port 3000)
│       ├── public/                # 45 CSS chunks, 9 WOFF2 fonts, client runtime (app-client.js)
│       └── src/
│           ├── server.js          # SSR server rendering templates & editor views
│           ├── card-editor-view.js# Full-featured card editor UI component
│           └── templates/         # HTML template layouts
├── supabase/
│   └── migrations/                # PostgreSQL schema & initial seed data
├── scripts/
│   ├── sync-public-assets.mjs     # Production asset extraction script
│   └── verify-harness.mjs         # End-to-end verification and testing suite
├── vercel.json                    # Vercel routing & serverless build configuration
├── AGENTS.md                      # Agent harness instructions & architectural invariants
└── init.sh                        # One-command project startup & verification entrypoint
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
git clone https://github.com/ngocthoha/wedding-invitation.git
cd wedding-invitation
npm install
```

### Run Locally

1. **Start Backend API** (Port `3008`):
   ```bash
   npm run start:api
   ```

2. **Start Frontend Web Server** (Port `3000`):
   ```bash
   npm run start:web
   ```

3. Visit [http://localhost:3000](http://localhost:3000) in your browser:
   - **Homepage**: [http://localhost:3000](http://localhost:3000)
   - **Template Catalog**: [http://localhost:3000/mau-thiep](http://localhost:3000/mau-thiep)
   - **Card Editor**: [http://localhost:3000/card/create/form?template=bmmd8nf8vm1i](http://localhost:3000/card/create/form?template=bmmd8nf8vm1i)
   - **Sample 3D Card**: [http://localhost:3000/mau-thiep/template/bmmd8nf8vm1i](http://localhost:3000/mau-thiep/template/bmmd8nf8vm1i)
   - **LED Stage**: [http://localhost:3000/man-hinh-led-dam-cuoi](http://localhost:3000/man-hinh-led-dam-cuoi)

---

## 🧪 Verification & Testing

Run the full verification suite (syntax checks, asset audit, database contracts, frontend SSR, and live HTTP tests):

```bash
./init.sh
```

Or individual commands:

```bash
npm run check             # Syntax checks for API, Web server, and Client runtime
npm test                  # Full E2E verification test suite
npm run validate:harness  # Validate agent harness compliance (100/100)
```

---

## 🌐 Deployment to Vercel & Supabase

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the migration script located at `supabase/migrations/20261118000000_init_wedding_schema.sql` in the Supabase SQL Editor.
3. Note your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### Vercel Setup

1. Import the repository in your [Vercel Dashboard](https://vercel.com).
2. Add the following Environment Variables under **Project Settings $\rightarrow$ Environment Variables**:
   - `SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
   - `SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
   - `API_BASE`: `/api`
3. Deploy! Vercel will build and serve both the frontend and serverless API endpoints seamlessly.

---

## 📄 License

MIT License. Designed and recreated for educational and commercial-grade wedding invitation delivery.

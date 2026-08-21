# AURIXA Platform

**A commissioned full-stack luxury real-estate platform built for Juliana Souza, founder of a premium Brazilian property firm — combining a cinematic React 19 frontend with a Strapi v5 / PostgreSQL backend, Cloudinary media, AI property enrichment and automated lead handoff.**

> **Portfolio note:** this public repository is a sanitized technical snapshot of the client engagement. It preserves the frontend, backend, API contracts and system architecture while replacing private client data and deployment-specific configuration with curated local fixtures where appropriate.

> **Licence notice:** this repository is published for portfolio evaluation and technical review only — see [Licence](#licence).

---

## Client Project

**Juliana Souza** — founder and director of a luxury property firm operating in the Brazilian high-net-worth market.

AURIXA was commissioned as the client-facing digital platform for her business. The brief was to move beyond a conventional listings site and create a premium, intelligence-led property experience with cinematic presentation, structured property operations, AI-assisted enrichment and automated lead handling.

The delivered system was built as an integrated full-stack product: the React frontend consumed the Strapi platform API, while the backend handled property content, media, AI enrichment and inquiry persistence / automation.

This public repository contains both halves of that work. To make the portfolio build reproducible without exposing client data, credentials or private infrastructure, the checked-in frontend can run from curated local fixtures while the complete backend and API surface remain included for technical review.

---

## Live Demo

**Frontend showcase:** https://aurixa.digitalprodigy.dev/

The public demo is intentionally self-contained and does not expose private client data or deployment credentials.

## Product Overview

AURIXA is a premium real-estate intelligence platform for high-net-worth buyers and sellers in Brazil.

- **`frontend/`** — React 19 single-page application with a cross-fading 4K hero, editorial Pinnacle Collection layouts, cinematic video gallery, property discovery, immersive property detail pages and client/admin portal experiences.
- **`backend/`** — Strapi v5 / PostgreSQL backend with property CMS, Cloudinary media, AI enrichment using Restb.ai + OpenAI, and a hardened inquiry endpoint with n8n/CRM handoff.
- **Integrated delivery architecture** — the client system used the Strapi REST API as the data boundary between the frontend and backend. The public portfolio snapshot keeps that architecture and backend implementation visible while using local fixture data in the browser-facing showcase to avoid shipping client data or secrets.

## Business Problem

Luxury real estate needs presentation quality that generic portals cannot provide, while agencies still need operational leverage behind the experience: structured listings, consistent copy, media workflows and fast lead response.

AURIXA addresses both sides — a brand-defining buyer experience on the frontend and an operational backend that turns raw property assets into structured, AI-enriched listings and routes buyer inquiries into a persistence and automation pipeline.

## Key User Experiences

- **Cinematic first impression** — full-screen cross-fading video hero with search and brand-led interaction.
- **Curated discovery** — filterable property catalogue with category tabs and grid/list views.
- **Cinematic gallery** — buffered multi-video showcase with touch navigation, PiP and fullscreen support.
- **Immersive property detail** — galleries, specification context, advisor information and inquiry entry points.
- **Client & admin portal experiences** — saved-property, scheduling, messaging and operational dashboard concepts.

## Complete Platform Features

| Area | Frontend | Backend |
|---|---|---|
| Properties | Discovery, detail pages, Pinnacle collection | Strapi CMS, REST API, draft & publish |
| Media | 4K video, poster images, galleries | Cloudinary-backed media management |
| AI | Intelligence/search experience | Restb.ai vision analysis + OpenAI pt-BR descriptions |
| Leads | Buyer inquiry entry points | Sanitised inquiry API + persistence + n8n handoff |
| Admin | Operational portal experience | Strapi admin, content management and permissions |

## Frontend Engineering

- **React 19 + Vite 7 + TypeScript**
- **wouter** routing, **TanStack Query**, **Tailwind CSS 4**, **shadcn/ui / Radix**, **framer-motion**
- Custom cinematic video engine with per-slide buffering, PiP-aware visibility handling and touch navigation
- Curated TypeScript fixture data retained in the public snapshot so the showcase can run without client infrastructure, credentials or private production data

## Backend Engineering

- **Strapi v5.34 (Node.js ≥ 20, TypeScript)** on **PostgreSQL** with SQLite support for local experimentation
- `Property` and `Inquiry` content types with draft/publish, media, AI metadata, lead routing and forwarding state
- Core property REST endpoints plus custom admin-only AI enrichment and public inquiry routes
- Cloudinary media integration
- Defensive external-call handling: missing credentials degrade gracefully, failed AI responses do not persist partial results, and webhook failures are recorded per inquiry

## AI Property-Enrichment Pipeline

1. On property update, or via `POST /api/properties/:id/ai-enrich`, property images are sent to **Restb.ai** `multianalyze`.
2. Structured vision output is stored as `ai_metadata`.
3. **OpenAI** generates a conservative Brazilian-Portuguese listing description grounded in the vision result and stores it as `ai_description`.
4. Non-OK or explicit error responses abort safely without persisting invalid enrichment.

## Data and API Flow

**Delivered client system:**

`React frontend → Strapi REST API → PostgreSQL / Cloudinary → AI enrichment + inquiry automation`

Key API boundaries:

- `GET /api/properties`
- `GET /api/properties/:documentId`
- `POST /api/inquiries`
- `POST /api/properties/:id/ai-enrich` (admin-only)

**Public portfolio snapshot:** the browser-facing showcase may resolve its display data from checked-in local fixtures so reviewers can run it without client infrastructure. That is a portfolio packaging decision, not an indication that the commissioned frontend and backend were separate or unfinished products.

See **[docs/architecture.md](docs/architecture.md)** and **[docs/api.md](docs/api.md)** for the system boundary and API details.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, TypeScript, Tailwind CSS 4, shadcn/ui, framer-motion, TanStack Query, wouter |
| Backend | Strapi 5.34, Node.js, TypeScript |
| Database | PostgreSQL |
| Media | Cloudinary |
| Image AI | Restb.ai `multianalyze` |
| Text AI | OpenAI |
| Automation | n8n webhook handoff |

## Security Boundaries

- All backend credentials are environment-driven; no secrets are committed.
- The n8n webhook URL remains server-side.
- Public inquiry input is sanitised, length-capped and validated before persistence.
- AI enrichment requires Strapi admin authentication.
- The public frontend showcase can run without production credentials or private client data.

## Project Structure

```text
aurixa-luxury-real-estate-intelligence/
├── README.md
├── LICENSE
├── frontend/          # React 19 SPA
│   ├── src/           # pages, components, motion system, portfolio fixtures
│   └── public/        # videos and static assets
├── backend/           # Strapi v5 backend
│   ├── src/api/       # property + inquiry APIs, AI lifecycle
│   └── config/        # server, database, plugins, middleware
└── docs/
    ├── architecture.md
    ├── api.md
    └── screenshots/
```

## Screenshots

### Cinematic Homepage — Hero
![Homepage hero](docs/screenshots/home-hero.png)

### Homepage — Pinnacle Collection
![Pinnacle collection](docs/screenshots/home-pinnacle.png)

### Cinematic Gallery
![Cinematic gallery](docs/screenshots/cinematic-gallery.png)

### Property Discovery
![Property discovery](docs/screenshots/property-discovery.png)

### Property Detail
![Property detail](docs/screenshots/property-detail.png)

### Property Overview
![Property overview](docs/screenshots/property-overview.png)

## Local Development

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
pnpm typecheck
pnpm build
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run develop
npm run build && npm run start
```

## Verified Technical Highlights

- Frontend TypeScript typecheck: **passes**
- Frontend production build: **passes**
- Backend TypeScript validation: **passes**
- Backend schema is reproducible from tracked Strapi content-type definitions
- No production secrets or private client data are committed

## Public Snapshot Boundaries

- The repository is a sanitized portfolio snapshot of a commissioned, integrated client system.
- Curated frontend fixtures are retained so the public showcase can run independently of private production data and deployment configuration.
- Authentication, portal persistence and live AI/search behaviour visible in the client environment are not represented as public production services here.
- Backend AI enrichment currently runs synchronously; webhook failures are recorded rather than automatically retried.
- No automated test suite is included in this public snapshot; verification is via type checking and production builds.

## Author

**Aaron Archer**  
AI-Native Full-Stack & Systems Engineer  
https://digitalprodigy.dev

## Licence

Proprietary — © 2026 Aaron Archer. All rights reserved. Published solely for portfolio evaluation and technical review; no reuse rights granted. See [LICENSE](LICENSE).

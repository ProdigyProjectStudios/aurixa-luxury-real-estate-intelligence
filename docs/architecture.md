# AURIXA Platform — Architecture

AURIXA was delivered as a commissioned full-stack client platform combining a React 19 frontend with a Strapi v5 backend. In the client system, the frontend consumed the Strapi REST API for property and inquiry flows.

This public repository is a sanitized portfolio snapshot. It retains both halves of the platform and the integration boundary, but uses curated local frontend fixtures where needed so the showcase can run without private client data, production credentials or deployment-specific infrastructure.

---

## 1. Delivered system architecture

```mermaid
graph TB
  subgraph FE["React 19 + Vite frontend"]
    ROUTER[wouter router] --> PAGES[Home · Properties · Property Detail · Portals]
    PAGES --> COMP[UI / motion / video system]
  end

  FE -->|REST API| API

  subgraph BE["Strapi v5 backend"]
    API[REST API layer\n/api/properties · /api/inquiries · /api/properties/:id/ai-enrich]
    API --> CMS[Strapi CMS core\nadmin · permissions]
    CMS --> PG[(PostgreSQL)]
    CMS --> CLD[Cloudinary media]
    LC[Property update lifecycle] --> RESTB[Restb.ai multianalyze]
    RESTB --> OPENAI[OpenAI\npt-BR descriptions]
    INQ[Inquiry controller] --> N8N[n8n / CRM handoff]
  end
```

## 2. Public portfolio snapshot

The checked-in frontend contains local TypeScript fixtures under `frontend/src/data/` so the public demo can run independently of the private client environment.

```mermaid
flowchart LR
  U[Reviewer] --> R[React frontend]
  R --> F[(Curated portfolio fixtures)]
  R --> V[UI / motion / video experience]

  B[Included Strapi backend] --> API[Platform REST API]
  API --> DB[(PostgreSQL)]
  API --> EXT[Cloudinary · Restb.ai · OpenAI · n8n]
```

This packaging decision should not be read as evidence that the commissioned frontend and backend were separate or unfinished. The client delivery used the API boundary shown in the first diagram; the public snapshot substitutes safe demo data for private production data and deployment configuration.

## 3. Frontend discovery-to-detail journey

```mermaid
flowchart TD
  H[Home — video hero + Pinnacle collection] --> D[Property discovery]
  D --> PD[Property detail]
  PD --> G[Gallery & spec sheet]
  PD --> A[Advisor context]
  PD --> I[Inquiry entry point]
  I --> API[POST /api/inquiries]
```

## 4. Backend: property creation and AI enrichment

```mermaid
flowchart TD
  A[Admin creates/edits Property in Strapi CMS] --> B[Images uploaded to Cloudinary]
  B --> C[Property saved / updated]
  C --> D{Images present and RESTB_API_KEY set?}
  D -- no --> Z[Save without enrichment]
  D -- yes --> E[Restb.ai multianalyze]
  E --> F{HTTP OK and error != true?}
  F -- no --> G[Abort safely]
  F -- yes --> H[Store ai_metadata]
  H --> I[OpenAI generates pt-BR description]
  I --> J[Store ai_description]
```

The same enrichment pipeline is available on demand via `POST /api/properties/:id/ai-enrich`, protected by Strapi admin authentication.

## 5. Backend: public inquiry and n8n handoff

```mermaid
sequenceDiagram
  participant C as Frontend
  participant S as Strapi backend
  participant DB as PostgreSQL
  participant W as n8n webhook

  C->>S: POST /api/inquiries
  S->>S: sanitise + validate
  S->>DB: persist inquiry
  alt N8N_WEBHOOK_URL configured
    S->>W: forward structured payload
    W-->>S: success / error
    S->>DB: store forwarding status
  else not configured
    S->>DB: payload_ready_no_webhook_configured
  end
  S-->>C: { ok, id, status, mode }
```

## 6. Backend structure & data models

```text
backend/
  config/
  src/
    index.ts
    api/property/
    api/inquiry/
```

**Property**: title, price, images, `ai_metadata`, `ai_description`, draft/publish state.

**Inquiry**: sanitised contact fields, property context, routing metadata, UTM/page metadata, forwarding status, timestamps and errors.

The schema is reproducible from tracked Strapi content-type definitions; no production database dump is included.

## 7. Authentication & permissions

- Strapi admin panel uses authenticated admin access.
- `POST /api/properties/:id/ai-enrich` is admin-only.
- `POST /api/inquiries` is deliberately public and protected by server-side sanitisation / validation.
- Core property REST access is governed by Strapi users-permissions configuration.
- The public portfolio frontend does not ship client authentication state or private production sessions.

## 8. Security boundaries

- Credentials are environment-driven and are not committed.
- n8n webhook URLs remain server-side.
- Public inquiry input is sanitised, trimmed, length-capped and validated before persistence.
- AI enrichment is guarded by admin authentication.
- Public frontend fixtures prevent exposure of private client data.

## 9. Deployment model

- **Frontend:** Vite production build deployable to a static host.
- **Backend:** Strapi build/start process with PostgreSQL and environment-variable configuration.
- **Client delivery:** frontend and backend connected across the documented REST API boundary.
- **Portfolio snapshot:** frontend can run safely from curated fixtures while backend code and API contracts remain reviewable.

## 10. Public snapshot boundaries

- This repository represents a commissioned, integrated client system in sanitized portfolio form.
- Curated local fixtures are retained in the public frontend for reproducibility and privacy.
- Private production data, credentials, authentication state and deployment-specific configuration are intentionally excluded.
- Backend AI enrichment is synchronous and webhook failures are recorded rather than automatically retried.
- Verification in this snapshot is primarily via type checking and production builds rather than a committed automated test suite.
